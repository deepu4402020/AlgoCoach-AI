"use client";

import { useState } from "react";
import { X, Code, FileCode } from "lucide-react";

interface AttachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (codeSnippet: string) => void;
}

export function AttachModal({ isOpen, onClose, onAttach }: AttachModalProps) {
  const [snippet, setSnippet] = useState("");
  const [fileLang, setFileLang] = useState("cpp");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippet.trim()) return;
    const formatted = `Here is my solution code in ${fileLang}:\n\`\`\`${fileLang}\n${snippet.trim()}\n\`\`\`\n`;
    onAttach(formatted);
    setSnippet("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg rounded-[24px] bg-white dark:bg-[#171720] border border-[#ECECF1] dark:border-[#282835] shadow-2xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0F0F4] dark:border-[#242430]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-[#0B0B0F] dark:text-[#F4F4F8]">
              Attach Code Snippet
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#A0A0AB] hover:text-[#0B0B0F] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#6B6B76] dark:text-[#A0A0AB]">Language:</label>
            <select
              value={fileLang}
              onChange={(e) => setFileLang(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-[#ECECF1] dark:border-[#2B2B38] bg-white dark:bg-[#1E1E28] text-[#0B0B0F] dark:text-[#F4F4F8]"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <textarea
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            placeholder="Paste your DSA solution or buggy function here..."
            rows={8}
            className="w-full font-mono text-xs p-3 rounded-xl border border-[#ECECF1] dark:border-[#2B2B38] bg-gray-50 dark:bg-[#13131A] text-[#0B0B0F] dark:text-[#F4F4F8] focus:outline-none focus:border-purple-400 dark:focus:border-purple-600 resize-none"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-100 dark:hover:bg-[#20202A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!snippet.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#0B0B0F] dark:bg-[#F4F4F8] text-white dark:text-[#0B0B0F] text-xs font-semibold hover:bg-black/85 disabled:opacity-40"
            >
              Insert into chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

