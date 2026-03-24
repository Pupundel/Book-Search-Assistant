import { pgTable, text, serial, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { booksTable } from "./books";

export const chunksTable = pgTable("chunks", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => booksTable.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  chapterTitle: text("chapter_title"),
  embedding: text("embedding"),
}, (table) => [
  index("chunks_book_id_idx").on(table.bookId),
]);

export const insertChunkSchema = createInsertSchema(chunksTable).omit({ id: true });
export type InsertChunk = z.infer<typeof insertChunkSchema>;
export type Chunk = typeof chunksTable.$inferSelect;
