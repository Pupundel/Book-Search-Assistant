import { TextFragment } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Quote, BookMarked, Hash } from "lucide-react";

interface FragmentCardProps {
  fragment: TextFragment;
  index: number;
}

export function FragmentCard({ fragment, index }: FragmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
      className="bg-card rounded-2xl border border-card-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-border bg-muted/20 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <BookMarked className="w-3.5 h-3.5 text-primary" />
          <span>{fragment.bookTitle || 'Неизвестная книга'}</span>
        </div>
        
        {fragment.bookAuthor && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{fragment.bookAuthor}</span>
          </div>
        )}

        {fragment.chapterTitle && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-1 h-1 rounded-full bg-border" />
            <Hash className="w-3 h-3" />
            <span className="truncate max-w-[200px]">{fragment.chapterTitle}</span>
          </div>
        )}
        
        <div className="ml-auto text-muted-foreground/60 font-mono">
          ~{(fragment.similarity * 100).toFixed(0)}% совпадение
        </div>
      </div>
      
      <div className="p-5 md:p-6 relative">
        <Quote className="absolute top-4 text-primary/10 w-10 h-10 -scale-x-100" />
        <p className="relative z-10 text-foreground/90 leading-relaxed text-sm sm:text-base pl-6">
          {fragment.content}
        </p>
      </div>
    </motion.div>
  );
}
