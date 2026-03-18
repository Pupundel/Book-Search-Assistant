import { Router, type IRouter, type Request, type Response } from "express";
import { db, booksTable, chunksTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { computeSimpleSimilarity, generateAnswer } from "../../lib/embedding.js";

const router: IRouter = Router();

interface ChunkWithBook {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  chunkIndex: number;
  content: string;
  chapterTitle: string | null;
  similarity: number;
}

async function findRelevantChunks(query: string, topK: number): Promise<ChunkWithBook[]> {
  const allChunks = await db
    .select({
      id: chunksTable.id,
      bookId: chunksTable.bookId,
      chunkIndex: chunksTable.chunkIndex,
      content: chunksTable.content,
      chapterTitle: chunksTable.chapterTitle,
      bookTitle: booksTable.title,
      bookAuthor: booksTable.author,
    })
    .from(chunksTable)
    .innerJoin(booksTable, eq(chunksTable.bookId, booksTable.id));

  if (allChunks.length === 0) return [];

  const scored = allChunks.map(chunk => ({
    ...chunk,
    similarity: computeSimpleSimilarity(query, chunk.content),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topK).filter(c => c.similarity > 0.01);
}

router.post("/search/fragments", async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body as { query?: string; topK?: number };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({ error: "invalid_query", message: "Запрос не может быть пустым" });
      return;
    }

    const fragments = await findRelevantChunks(query.trim(), Math.min(topK, 10));

    if (fragments.length === 0) {
      res.json({
        query,
        fragments: [],
        found: false,
        message: "В загруженных книгах не найдено фрагментов по вашему запросу. Попробуйте другие ключевые слова или загрузите книги.",
      });
      return;
    }

    res.json({
      query,
      fragments: fragments.map(f => ({
        id: f.id,
        bookId: f.bookId,
        bookTitle: f.bookTitle,
        bookAuthor: f.bookAuthor,
        chunkIndex: f.chunkIndex,
        content: f.content,
        chapterTitle: f.chapterTitle ?? "",
        similarity: Math.round(f.similarity * 100) / 100,
      })),
      found: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Ошибка при поиске" });
  }
});

router.post("/search/answer", async (req: Request, res: Response) => {
  try {
    const { query, topK = 5 } = req.body as { query?: string; topK?: number };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.status(400).json({ error: "invalid_query", message: "Вопрос не может быть пустым" });
      return;
    }

    const fragments = await findRelevantChunks(query.trim(), Math.min(topK, 10));

    if (fragments.length === 0) {
      res.json({
        query,
        answer: "В загруженных книгах не нашлось информации по данному вопросу. Попробуйте загрузить книги или переформулировать вопрос.",
        citations: [],
        found: false,
        message: "В загруженных текстах нет информации по этому вопросу.",
      });
      return;
    }

    const answer = await generateAnswer(
      query.trim(),
      fragments.map(f => ({
        content: f.content,
        bookTitle: f.bookTitle,
        bookAuthor: f.bookAuthor,
        chapterTitle: f.chapterTitle,
        chunkIndex: f.chunkIndex,
      }))
    );

    res.json({
      query,
      answer,
      citations: fragments.map(f => ({
        id: f.id,
        bookId: f.bookId,
        bookTitle: f.bookTitle,
        bookAuthor: f.bookAuthor,
        chunkIndex: f.chunkIndex,
        content: f.content,
        chapterTitle: f.chapterTitle ?? "",
        similarity: Math.round(f.similarity * 100) / 100,
      })),
      found: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Ошибка при генерации ответа" });
  }
});

export default router;
