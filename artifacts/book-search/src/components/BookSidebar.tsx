import { Book as BookType } from "@workspace/api-client-react";
import { BookOpen, Trash2, Plus, Loader2, Library, Hash } from "lucide-react";
import { useAppDeleteBook, useAppListBooks } from "../hooks/use-app-queries";
import { useToast } from "@/hooks/use-toast";
import { cn } from "../lib/utils";

interface BookSidebarProps {
  onOpenUpload: () => void;
  className?: string;
}

export function BookSidebar({ onOpenUpload, className }: BookSidebarProps) {
  const { data: books, isLoading } = useAppListBooks();
  const { mutate: deleteBook, isPending: isDeleting } = useAppDeleteBook();
  const { toast } = useToast();
  const bookList = Array.isArray(books) ? books : [];

  const totalChunks = bookList.reduce((acc, b) => acc + b.chunkCount, 0);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Вы уверены, что хотите удалить книгу "${title}"?`)) {
      deleteBook(
        { bookId: id },
        {
          onSuccess: () => toast({ title: "Книга удалена" }),
          onError: () => toast({ title: "Ошибка", description: "Не удалось удалить книгу", variant: "destructive" }),
        }
      );
    }
  };

  return (
    <div className={cn("w-full md:w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full", className)}>
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Library className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-semibold text-lg text-sidebar-foreground">Библиотека</h2>
        </div>

        {/* Stats */}
        {bookList.length > 0 && (
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-background rounded-lg px-2.5 py-1.5 border border-border">
              <BookOpen className="w-3 h-3 text-primary" />
              <span className="font-medium text-foreground">{bookList.length}</span>
              <span className="text-muted-foreground">{bookList.length === 1 ? "книга" : bookList.length < 5 ? "книги" : "книг"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background rounded-lg px-2.5 py-1.5 border border-border">
              <Hash className="w-3 h-3 text-primary" />
              <span className="font-medium text-foreground">{totalChunks.toLocaleString("ru")}</span>
              <span className="text-muted-foreground">фрагм.</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : bookList.length === 0 ? (
          <div className="text-center p-6 bg-background/50 rounded-xl border border-dashed border-border mt-4">
            <p className="text-sm text-muted-foreground">Библиотека пуста</p>
            <p className="text-xs text-muted-foreground mt-1">Добавьте книгу ниже</p>
          </div>
        ) : (
          bookList.map((book: BookType) => (
            <div
              key={book.id}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-sidebar-accent border border-transparent hover:border-sidebar-accent-border transition-all duration-200"
            >
              <div className="mt-0.5 p-1.5 bg-background rounded text-muted-foreground shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-sidebar-foreground truncate" title={book.title}>
                  {book.title || book.filename}
                </h4>
                <p className="text-xs text-muted-foreground truncate">{book.author || "Неизвестный автор"}</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">{book.chunkCount} фрагм.</p>
              </div>
              <button
                onClick={() => handleDelete(book.id, book.title || book.filename)}
                disabled={isDeleting}
                className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                title="Удалить книгу"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium shadow-sm hover:bg-primary/90 hover:shadow shadow-primary/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Добавить книгу
        </button>
      </div>
    </div>
  );
}
