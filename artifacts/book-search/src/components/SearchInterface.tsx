import { useState } from "react";
import { Search, Sparkles, Send, Loader2, FileX, BookOpen } from "lucide-react";
import { useSearchFragments, useAnswerQuestion } from "../hooks/use-app-queries";
import { FragmentCard } from "./FragmentCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type Mode = "fragments" | "answer";

export function SearchInterface() {
  const [mode, setMode] = useState<Mode>("fragments");
  const [query, setQuery] = useState("");
  
  const searchFragmentsMutation = useSearchFragments();
  const answerQuestionMutation = useAnswerQuestion();

  const isPending = searchFragmentsMutation.isPending || answerQuestionMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (mode === "fragments") {
      searchFragmentsMutation.mutate({ data: { query, topK: 5 } });
    } else {
      answerQuestionMutation.mutate({ data: { query, topK: 5 } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Extract result data to render based on mode
  const fragmentResult = searchFragmentsMutation.data;
  const answerResult = answerQuestionMutation.data;
  
  const hasSearched = mode === 'fragments' ? searchFragmentsMutation.isSuccess : answerQuestionMutation.isSuccess;
  const error = mode === 'fragments' ? searchFragmentsMutation.error : answerQuestionMutation.error;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-0 h-full p-4 md:p-8 space-y-8">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
          Книжный <span className="text-primary italic">Искатель</span>
        </h1>
        
        <div className="flex p-1 bg-muted rounded-xl border border-border shadow-inner">
          <button
            onClick={() => setMode("fragments")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              mode === "fragments" 
                ? "bg-card text-foreground shadow-sm border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="w-4 h-4" />
            Искать цитаты
          </button>
          <button
            onClick={() => setMode("answer")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              mode === "answer" 
                ? "bg-card text-foreground shadow-sm border border-border/50" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Задать вопрос AI
          </button>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-500 opacity-50" />
        <div className="relative bg-card rounded-2xl shadow-lg border border-border overflow-hidden flex items-end p-2 focus-within:border-primary/50 focus-within:ring-4 ring-primary/10 transition-all">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "fragments" ? "Найди, где говорится про..." : "Что произошло с героями в конце?..."}
            className="w-full bg-transparent px-4 py-3 text-base md:text-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px] max-h-[200px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!query.trim() || isPending}
            className="shrink-0 m-1 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {/* Results Area */}
      <div className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          
          {/* Error State */}
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-6 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 text-center"
            >
              <p className="font-medium">Произошла ошибка при выполнении запроса.</p>
              <p className="text-sm mt-1 opacity-80">{error.message}</p>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {isPending && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="h-40 bg-muted/50 rounded-2xl animate-pulse" />
              <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
              <div className="h-48 bg-muted/50 rounded-2xl animate-pulse" />
            </motion.div>
          )}

          {/* Fragments Mode Results */}
          {!isPending && mode === "fragments" && hasSearched && fragmentResult && (
            <motion.div key="fragments" className="space-y-6">
              {!fragmentResult.found ? (
                <div className="text-center p-12 bg-card rounded-3xl border border-border shadow-sm">
                  <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                    <FileX className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-foreground mb-2">Ничего не найдено</h3>
                  <p className="text-muted-foreground">{fragmentResult.message || "По вашему запросу не найдено подходящих фрагментов в загруженных книгах."}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-2">
                    Найденные фрагменты ({fragmentResult.fragments.length})
                  </h3>
                  {fragmentResult.fragments.map((frag, idx) => (
                    <FragmentCard key={frag.id} fragment={frag} index={idx} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Answer Mode Results */}
          {!isPending && mode === "answer" && hasSearched && answerResult && (
            <motion.div key="answer" className="space-y-8">
              {!answerResult.found ? (
                <div className="text-center p-12 bg-card rounded-3xl border border-border shadow-sm">
                  <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                    <FileX className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-serif font-medium text-foreground mb-2">Нет информации для ответа</h3>
                  <p className="text-muted-foreground">{answerResult.message || "В загруженных текстах нет информации, чтобы достоверно ответить на этот вопрос."}</p>
                </div>
              ) : (
                <>
                  {/* AI Answer Block */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 md:p-8 bg-card rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 text-primary font-medium">
                        <Sparkles className="w-5 h-5" />
                        Ответ ассистента
                      </div>
                      <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[1.05rem]">
                        <p>{answerResult.answer}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Citations */}
                  <div className="space-y-5 pt-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-2">
                      Опираясь на источники ({answerResult.citations.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {answerResult.citations.map((citation, idx) => (
                        <FragmentCard key={citation.id} fragment={citation} index={idx} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Empty State / Welcome */}
          {!hasSearched && !isPending && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center px-4 py-12 text-muted-foreground"
            >
              <div className="w-16 h-16 mb-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary/60" />
              </div>
              <p className="max-w-md text-base leading-relaxed">
                Система готова к работе. Выберите режим и отправьте запрос для поиска по вашей библиотеке.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
