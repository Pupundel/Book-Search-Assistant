import { openai } from "@workspace/integrations-openai-ai-server";

export async function getEmbeddingText(text: string): Promise<string> {
  return text.slice(0, 8000);
}

export function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\wа-яёa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTokens(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter(t => t.length > 2);
}

export function computeSimpleSimilarity(query: string, text: string): number {
  const queryTokens = new Set(getTokens(query));
  const textTokens = getTokens(text);

  if (queryTokens.size === 0 || textTokens.length === 0) return 0;

  let matches = 0;
  for (const token of textTokens) {
    if (queryTokens.has(token)) matches++;
  }

  const coverage = matches / queryTokens.size;
  const density = matches / textTokens.length;
  return (coverage * 0.7 + density * 0.3);
}

export function chunkText(text: string, chunkSize = 600, overlap = 100): Array<{ content: string; chapterTitle: string | null }> {
  const lines = text.split('\n');
  const chunks: Array<{ content: string; chapterTitle: string | null }> = [];

  let currentChunk = '';
  let currentChapter: string | null = null;
  let lastChunkEnd = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    const isChapterHeading = (
      /^(глава|chapter|часть|part|раздел|section|эпилог|пролог|epilogue|prologue)\s*[\d\w]/i.test(trimmedLine) ||
      /^[IVX]+\.\s+\S/.test(trimmedLine) ||
      (trimmedLine.length > 0 && trimmedLine.length < 60 && trimmedLine === trimmedLine.toUpperCase() && /[А-ЯA-Z]/.test(trimmedLine)) ||
      /^\*\s*\*\s*\*/.test(trimmedLine)
    );

    if (isChapterHeading && trimmedLine.length > 0) {
      if (currentChunk.trim().length > 50) {
        chunks.push({ content: currentChunk.trim(), chapterTitle: currentChapter });
        lastChunkEnd = currentChunk.slice(-overlap);
        currentChunk = lastChunkEnd;
      }
      currentChapter = trimmedLine;
    }

    currentChunk += (currentChunk ? '\n' : '') + line;

    if (currentChunk.length >= chunkSize) {
      chunks.push({ content: currentChunk.trim(), chapterTitle: currentChapter });
      lastChunkEnd = currentChunk.slice(-overlap);
      currentChunk = lastChunkEnd;
    }
  }

  if (currentChunk.trim().length > 50) {
    chunks.push({ content: currentChunk.trim(), chapterTitle: currentChapter });
  }

  return chunks;
}

export async function generateAnswer(
  query: string,
  fragments: Array<{ content: string; bookTitle: string; bookAuthor: string; chapterTitle: string | null; chunkIndex: number }>
): Promise<string> {
  const contextParts = fragments.map((f, i) => {
    const source = `[${i + 1}] "${f.bookTitle}" (${f.bookAuthor})${f.chapterTitle ? `, ${f.chapterTitle}` : ''}`;
    return `${source}\n${f.content}`;
  });
  const context = contextParts.join('\n\n---\n\n');

  const stream = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `Ты — литературный помощник. Отвечай на вопросы строго на основе предоставленных текстовых фрагментов из книг. 
Если в фрагментах нет ответа, честно скажи об этом. 
Не придумывай информацию. 
Ссылайся на источники в квадратных скобках [1], [2] и т.д.
Отвечай на том же языке, что и вопрос.`
      },
      {
        role: "user",
        content: `Вопрос: ${query}\n\nТекстовые фрагменты из книг:\n\n${context}`
      }
    ],
    stream: false,
  });

  return stream.choices[0]?.message?.content ?? "Не удалось получить ответ.";
}
