import { useState } from "react";
import { BookSidebar } from "../components/BookSidebar";
import { SearchInterface } from "../components/SearchInterface";
import { UploadModal } from "../components/UploadModal";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Mobile Header & Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <div className="font-serif font-bold text-lg">Archivist</div>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -mr-2 text-foreground hover:bg-muted rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <BookSidebar onOpenUpload={() => setIsUploadOpen(true)} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-4/5 max-w-sm bg-background z-50 flex shadow-2xl"
            >
              <BookSidebar 
                className="w-full border-r-0"
                onOpenUpload={() => {
                  setIsMobileSidebarOpen(false);
                  setIsUploadOpen(true);
                }} 
              />
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto pt-16 md:pt-0 scroll-smooth">
        <SearchInterface />
      </main>

      {/* Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

    </div>
  );
}
