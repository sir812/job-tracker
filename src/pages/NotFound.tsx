import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "../components/ui/Button";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 relative select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center flex flex-col items-center gap-6 max-w-md z-10"
      >
        <div className="w-16 h-16 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center shadow-xl">
          <FileQuestion className="w-8 h-8 text-cyan-400" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-neutral-400">
            404
          </h1>
          <h2 className="text-xl font-bold text-black dark:text-white">Page Not Found</h2>
          <p className="text-sm text-black dark:text-white leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Link to="/dashboard">
          <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};
export default NotFound;
