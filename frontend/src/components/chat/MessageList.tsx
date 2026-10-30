"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, RotateCcw } from "lucide-react";
import { Message, MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRetry?: () => void;
  error?: string | null;
}

export function MessageList({
  messages,
  isLoading,
  onRetry,
  error,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll when messages update
  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, showScrollBottom]);

  // Track if user scrolled up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 160;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8"
    >
      <div className="max-w-[768px] mx-auto w-full pb-32">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Loading / Typing indicator while streaming */}
        {isLoading && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-[#1A1A24] border border-[#ECECF1] dark:border-[#282835] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs text-[#6B6B76] dark:text-[#A0A0AB] ml-2 font-medium">
                AlgoCoach is reasoning...
              </span>
            </div>
          </div>
        )}

        {/* Error banner with Retry */}
        {error && (
          <div className="my-4 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 flex items-center justify-between gap-3 text-sm">
            <p className="text-red-700 dark:text-red-400 font-medium">
              {error}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll-to-Bottom button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to latest message"
          className="fixed bottom-24 right-6 md:right-12 z-20 w-9 h-9 rounded-full bg-white dark:bg-[#1E1E28] border border-[#ECECF1] dark:border-[#2F2F3E] text-[#0B0B0F] dark:text-[#F4F4F8] shadow-md hover:bg-gray-50 dark:hover:bg-[#252533] flex items-center justify-center transition-all hover:scale-105"
        >
          <ArrowDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </button>
      )}
    </div>
  );
}

