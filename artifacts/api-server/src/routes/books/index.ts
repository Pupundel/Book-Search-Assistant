import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { db, booksTable, chunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { chunkText, getMistralEmbedding } from "../../lib/embedding.js";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/books", async (_req: Request, res: Response) => {
  try {
    const books = await db.select().from(booksTable).orderBy(booksTable.createdAt);
    res.json(books.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      filename: b.filename,
      chunkCount: b.chunkCount,
      createdAt: b.createdAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Ошибка сервера" });
  }
});

router.post("/books", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const title = (req.body?.title as string) || "";
    const author = (req.body?.author as string) || "Неизвестный автор";

    if (file) {
      const filename = file.originalname;
      const text = file.buffer.toString("utf-8");
      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: "empty_file", message: "Файл пустой или не читается" });
        return;
      }
      await processBook(text, title || filename.replace(/\.[^.]+$/, ""), author, filename, res);
    } else if (req.body?.text) {
      await processBook(req.body.text as string, title || "Без названия", author, "paste", res);
    } else {
      res.status(400).json({ error: "no_file", message: "Файл или текст не предоставлен" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Ошибка при загрузке книги" });
  }
});

async function processBook(text: string, title: string, author: string, filename: string, res: Response) {
  const chunks = chunkText(text);
  if (chunks.length === 0) {
    res.status(400).json({ error: "empty_text", message: "Текст слишком короткий или пустой" });
    return;
  }

  const [book] = await db.insert(booksTable).values({ title, author, filename, chunkCount: chunks.length }).returning();

  // Send response immediately, compute embeddings asynchronously
  res.status(201).json({
    id: book.id,
    title: book.title,
    author: book.author,
    filename: book.filename,
    chunkCount: book.chunkCount,
    createdAt: book.createdAt,
  });

  // Insert chunks first without embeddings, then compute in background
  const batchSize = 100;
  for (let i = 0; i < chunks.length; i += batchSize) {
    await db.insert(chunksTable).values(
      chunks.slice(i, i + batchSize).map((c, j) => ({
        bookId: book.id,
        chunkIndex: i + j,
        content: c.content,
        chapterTitle: c.chapterTitle,
        embedding: null,
      }))
    );
  }

  // Compute embeddings in background (non-blocking)
  computeEmbeddingsForBook(book.id, chunks.map(c => c.content)).catch(err =>
    console.warn(`Embedding computation for book ${book.id} failed:`, err)
  );
}

async function computeEmbeddingsForBook(bookId: number, contents: string[]) {
  const rows = await db.select({ id: chunksTable.id, chunkIndex: chunksTable.chunkIndex })
    .from(chunksTable)
    .where(eq(chunksTable.bookId, bookId));

  const rowMap = new Map(rows.map(r => [r.chunkIndex, r.id]));

  // Process in small batches to avoid rate limits
  const embBatch = 10;
  for (let i = 0; i < contents.length; i += embBatch) {
    const batch = contents.slice(i, i + embBatch);
    await Promise.all(
      batch.map(async (content, j) => {
        const idx = i + j;
        const chunkId = rowMap.get(idx);
        if (!chunkId) return;
        const embedding = await getMistralEmbedding(content);
        if (embedding) {
          await db.update(chunksTable)
            .set({ embedding: JSON.stringify(embedding) })
            .where(eq(chunksTable.id, chunkId));
        }
      })
    );
    // Small delay between batches to avoid rate limiting
    if (i + embBatch < contents.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  console.log(`Embeddings computed for book ${bookId}: ${contents.length} chunks`);
}

router.delete("/books/:bookId", async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.bookId);
    if (isNaN(bookId)) {
      res.status(400).json({ error: "invalid_id", message: "Неверный идентификатор книги" });
      return;
    }
    const existing = await db.select().from(booksTable).where(eq(booksTable.id, bookId));
    if (existing.length === 0) {
      res.status(404).json({ error: "not_found", message: "Книга не найдена" });
      return;
    }
    await db.delete(chunksTable).where(eq(chunksTable.bookId, bookId));
    await db.delete(booksTable).where(eq(booksTable.id, bookId));
    res.json({ success: true, message: "Книга удалена" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Ошибка при удалении книги" });
  }
});

export default router;
