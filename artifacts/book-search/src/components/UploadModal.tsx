import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, FileText, Loader2 } from "lucide-react";
import { useAppUploadBook } from "../hooks/use-app-queries";
import { useToast } from "@/hooks/use-toast";
import { cn } from "../lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const { mutate: uploadBook, isPending } = useAppUploadBook();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      // Try to guess title from filename
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      if (!title) setTitle(nameWithoutExt);
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/epub+zip': ['.epub']
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Ошибка", description: "Пожалуйста, выберите файл", variant: "destructive" });
      return;
    }

    uploadBook(
      { data: { file, title: title || undefined, author: author || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Успех", description: "Книга успешно загружена и индексируется." });
          handleReset();
          onClose();
        },
        onError: (err) => {
          toast({ title: "Ошибка загрузки", description: err.message || "Не удалось загрузить файл.", variant: "destructive" });
        }
      }
    );
  };

  const handleReset = () => {
    setFile(null);
    setTitle("");
    setAuthor("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-serif font-semibold text-foreground">Загрузить книгу</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={cn(
                "w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="p-4 bg-background rounded-full shadow-sm border border-border">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Нажмите или перетащите файл сюда
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Поддерживаются TXT, PDF, EPUB
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-start gap-4">
              <div className="p-3 bg-background rounded-lg shadow-sm border border-border shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Название (необязательно)</label>
              <input 
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Война и мир"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Автор (необязательно)</label>
              <input 
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Лев Толстой"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!file || isPending}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Загрузка..." : "Загрузить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
