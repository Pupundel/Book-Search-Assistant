import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { db, booksTable, chunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { chunkText } from "../../lib/embedding.js";

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

    let text = "";
    let filename = "paste";

    if (file) {
      filename = file.originalname;
      const fileTitle = title || filename.replace(/\.[^.]+$/, "");
      text = file.buffer.toString("utf-8");

      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: "empty_file", message: "Файл пустой или не читается" });
        return;
      }

      const bookTitle = title || fileTitle;
      await processBook(text, bookTitle, author, filename, res);
    } else if (req.body?.text) {
      text = req.body.text as string;
      const bookTitle = title || "Без названия";
      await processBook(text, bookTitle, author, filename, res);
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

  const [book] = await db.insert(booksTable).values({
    title,
    author,
    filename,
    chunkCount: chunks.length,
  }).returning();

  const chunkRows = chunks.map((c, i) => ({
    bookId: book.id,
    chunkIndex: i,
    content: c.content,
    chapterTitle: c.chapterTitle,
  }));

  const batchSize = 100;
  for (let i = 0; i < chunkRows.length; i += batchSize) {
    await db.insert(chunksTable).values(chunkRows.slice(i, i + batchSize));
  }

  res.status(201).json({
    id: book.id,
    title: book.title,
    author: book.author,
    filename: book.filename,
    chunkCount: book.chunkCount,
    createdAt: book.createdAt,
  });
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
