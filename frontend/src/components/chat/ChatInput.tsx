"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Paperclip,
  Lightbulb,
  Code,
  Sliders,
  ChevronDown,
} from "lucide-react";

interface ChatInputProps {
  variant?: "hero" | "compact";
  input: string;
  setInput: (value: string) => void;
  onSend: (overrideMessage?: string) => void;
  isLoading: boolean;
  hintMode: boolean;
  setHintMode: (val: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: string;
  setDifficulty: (diff: string) => void;
  onOpenSavedPrompts?: () => void;
  onAttachFile?: () => void;
}

export function ChatInput({
  variant = "compact",
  input,
  setInput,
  onSend,
  isLoading,
  hintMode,
  setHintMode,
  language,
  setLanguage,
  difficulty,
  setDifficulty,
  onOpenSavedPrompts,
  onAttachFile,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [diffMenuOpen, setDiffMenuOpen] = useState(false);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        variant === "hero" ? 180 : 130
      )}px`;
    }
  }, [input, variant]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const isHero = variant === "hero";

  return (
    <div className={`w-full ${isHero ? "max-w-[720px] mx-auto" : "max-w-[768px] mx-auto"}`}>
      {/* Main Input Card */}
      <div
        className={`w-full rounded-[24px] bg-white dark:bg-[#171720] border transition-all duration-200 ${
          isHero
            ? "p-4 md:p-5 shadow-[0_8px_30px_rgba(139,92,246,0.08)] border-[#ECECF1] dark:border-[#282835] focus-within:border-[#8B5CF6] focus-within:ring-4 focus-within:ring-purple-500/10"
            : "p-3 md:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-[#ECECF1] dark:border-[#282835] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-purple-500/10"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a problem or algorithm..."
          rows={isHero ? 2 : 1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-[#0B0B0F] dark:text-[#F4F4F8] placeholder-[#A0A0AB] focus:outline-none"
        />

        {/* Toolbar Inside Card */}
        <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-[#F0F0F4] dark:border-[#23232F]">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
            {/* Hint Mode Toggle Chip */}
            <button
              type="button"
              onClick={() => setHintMode(!hintMode)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                hintMode
                  ? "bg-[#F3EFFF] text-purple-700 dark:bg-[#2A2045] dark:text-purple-300 border border-[#E4DBFF] dark:border-[#4B3979] shadow-xs"
                  : "bg-gray-100 dark:bg-[#20202A] text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-200 dark:hover:bg-[#292936] border border-transparent"
              }`}
            >
              <Lightbulb className={`w-3.5 h-3.5 ${hintMode ? "text-purple-600 dark:text-purple-400" : ""}`} />
              <span>Hint {hintMode ? "ON" : "OFF"}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setDiffMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-medium text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-100 dark:hover:bg-[#20202A] transition-colors border border-transparent hover:border-[#ECECF1] dark:hover:border-[#2B2B38]"
              >
                <Code className="w-3.5 h-3.5 text-purple-500" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {langMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-32 rounded-xl bg-white dark:bg-[#1A1A24] border border-[#ECECF1] dark:border-[#2B2B38] p-1 shadow-lg z-30">
                  {["Python", "C++", "Java", "JavaScript"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        language === lang
                          ? "bg-[#F3EFFF] text-purple-700 dark:bg-[#2B2244] dark:text-purple-300 font-medium"
                          : "text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-100 dark:hover:bg-[#242432]"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Difficulty Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setDiffMenuOpen(!diffMenuOpen);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-medium text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-100 dark:hover:bg-[#20202A] transition-colors border border-transparent hover:border-[#ECECF1] dark:hover:border-[#2B2B38]"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-500" />
                <span>{difficulty}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {diffMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-28 rounded-xl bg-white dark:bg-[#1A1A24] border border-[#ECECF1] dark:border-[#2B2B38] p-1 shadow-lg z-30">
                  {["All", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setDifficulty(diff);
                        setDiffMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        difficulty === diff
                          ? "bg-[#F3EFFF] text-purple-700 dark:bg-[#2B2244] dark:text-purple-300 font-medium"
                          : "text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-100 dark:hover:bg-[#242432]"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Circular Purple Send Button */}
          <button
            type="button"
            onClick={() => onSend()}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#8B5CF6] text-white flex items-center justify-center transition-all shadow-sm shadow-purple-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 translate-x-px" />
            )}
          </button>
        </div>
      </div>

      {/* Hero-specific lower strip */}
      {isHero && (
        <div className="flex items-center justify-between px-2 sm:px-3 py-2 mt-1 text-xs text-[#6B6B76] dark:text-[#A0A0AB]">
          <button
            type="button"
            onClick={onOpenSavedPrompts}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-medium text-[11px] sm:text-xs">Saved prompts</span>
          </button>

          <button
            type="button"
            onClick={onAttachFile}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">Attach code</span>
          </button>
        </div>
      )}

      {/* Pinned mode footer disclaimer */}
      {!isHero && (
        <p className="text-center text-[11px] text-[#A0A0AB] dark:text-[#6E6E7F] mt-2 select-none">
          AlgoCoach can make mistakes. Verify important solutions.
        </p>
      )}
    </div>
  );
}
