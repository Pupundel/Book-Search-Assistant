import { useState, useEffect } from "react";
import { Search, Sparkles, Send, Loader2, FileX, BookOpen, History, X, Cpu } from "lucide-react";
import { useSearchFragments, useAnswerQuestion } from "../hooks/use-app-queries";
import { FragmentCard } from "./FragmentCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type Mode = "fragments" | "answer";

const HISTORY_KEY = "book-search-history";
const MAX_HISTORY = 20;

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(q: string) {
  const prev = loadHistory().filter(h => h !== q);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([q, ...prev].slice(0, MAX_HISTORY)));
}

export function SearchInterface() {
  const [mode, setMode] = useState<Mode>("fragments");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const searchFragmentsMutation = useSearchFragments();
  const answerQuestionMutation = useAnswerQuestion();
  const isPending = searchFragmentsMutation.isPending || answerQuestionMutation.isPending;

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveHistory(query.trim());
    setHistory(loadHistory());
    setShowHistory(false);
    if (mode === "fragments") {
      searchFragmentsMutation.mutate({ data: { query, topK: 5 } });
    } else {
      answerQuestionMutation.mutate({ data: { query, topK: 5 } });
    }
  };

  const handleHistorySelect = (q: string) => {
    setQuery(q);
    setShowHistory(false);
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
    if (e.key === "Escape") setShowHistory(false);
  };

  const fragmentResult = searchFragmentsMutation.data;
  const answerResult = answerQuestionMutation.data;
  const hasSearched = mode === "fragments" ? searchFragmentsMutation.isSuccess : answerQuestionMutation.isSuccess;
  const error = mode === "fragments" ? searchFragmentsMutation.error : answerQuestionMutation.error;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-0 h-full p-4 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
            Книжный <span className="text-primary italic">Искатель</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="w-3 h-3" />
            <span>Mistral AI</span>
          </div>
        </div>

        <div className="flex p-1 bg-muted rounded-xl border border-border shadow-inner">
          {(["fragments", "answer"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                mode === m ? "bg-card text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "fragments" ? <Search className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {m === "fragments" ? "Искать цитаты" : "Задать вопрос AI"}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-500 opacity-50" />
          <div className="relative bg-card rounded-2xl shadow-lg border border-border overflow-visible flex items-end p-2 focus-within:border-primary/50 focus-within:ring-4 ring-primary/10 transition-all">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => history.length > 0 && setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              placeholder={mode === "fragments" ? "Найди, где говорится про..." : "Что произошло с героями в конце?"}
              className="w-full bg-transparent px-4 py-3 text-base md:text-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <div className="flex items-center gap-1 shrink-0">
              {history.length > 0 && (
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); setShowHistory(v => !v); }}
                  className="m-1 p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                  title="История поиска"
                >
                  <History className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={!query.trim() || isPending}
                className="m-1 p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>

        {/* History Dropdown */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">История поиска</span>
                <button onClick={clearHistory} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Очистить
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleHistorySelect(h)}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{h}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-6 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 text-center">
              <p className="font-medium">Ошибка при выполнении запроса.</p>
              <p className="text-sm mt-1 opacity-80">{error.message}</p>
            </motion.div>
          )}

          {isPending && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {[40, 32, 48].map((h, i) => (
                <div key={i} style={{ height: `${h * 4}px` }} className="bg-muted/50 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          )}

          {!isPending && mode === "fragments" && hasSearched && fragmentResult && (
            <motion.div key="fragments" className="space-y-6">
              {!fragmentResult.found ? (
                <div className="text-center p-12 bg-card rounded-3xl border border-border shadow-sm">
                  <div className="inline-flex p-4 bg-muted rounded-full mb-4"><FileX className="w-8 h-8 text-muted-foreground" /></div>
                  <h3 className="text-xl font-serif font-medium text-foreground mb-2">Ничего не найдено</h3>
                  <p className="text-muted-foreground">{fragmentResult.message}</p>
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

          {!isPending && mode === "answer" && hasSearched && answerResult && (
            <motion.div key="answer" className="space-y-8">
              {!answerResult.found ? (
                <div className="text-center p-12 bg-card rounded-3xl border border-border shadow-sm">
                  <div className="inline-flex p-4 bg-muted rounded-full mb-4"><FileX className="w-8 h-8 text-muted-foreground" /></div>
                  <h3 className="text-xl font-serif font-medium text-foreground mb-2">Нет информации</h3>
                  <p className="text-muted-foreground">{answerResult.message}</p>
                </div>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 md:p-8 bg-card rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><Sparkles className="w-32 h-32" /></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 text-primary font-medium">
                        <Sparkles className="w-5 h-5" />
                        Ответ Mistral AI
                      </div>
                      <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[1.05rem]">
                        <p>{answerResult.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                  <div className="space-y-5 pt-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-2">
                      Источники ({answerResult.citations.length})
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

          {!hasSearched && !isPending && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center px-4 py-12 text-muted-foreground">
              <div className="w-16 h-16 mb-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary/60" />
              </div>
              <p className="max-w-md text-base leading-relaxed">
                Загрузите книги в библиотеку и задайте вопрос или найдите нужный фрагмент.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
