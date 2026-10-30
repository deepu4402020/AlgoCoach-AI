"use client";

import { Lightbulb, Bug, Compass, Sparkles } from "lucide-react";
import { ChatInput } from "./ChatInput";

interface HeroProps {
  username: string;
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
  onOpenSavedPrompts: () => void;
  onAttachFile: () => void;
}

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: "Explain a Pattern",
    prompt: "Explain the sliding window pattern with an example.",
    description: "Learn how two pointers optimize subarray and substring problems.",
  },
  {
    icon: Bug,
    title: "Debug My Solution",
    prompt: "Help me find the bug in my two-pointer solution.",
    description: "Paste your code to identify edge cases, off-by-one errors, or logic slips.",
  },
  {
    icon: Compass,
    title: "Get a Hint",
    prompt: "Give me a hint for Two Sum without spoiling the answer.",
    description: "Receive guided algorithmic clues without spoiling the complete solution.",
  },
];

export function Hero({
  username,
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
}: HeroProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-10 max-w-4xl mx-auto w-full">
      {/* Soft Glowing Lavender/Purple Orb */}
      <div className="relative mb-5 flex items-center justify-center animate-orb select-none">
        {/* Outer ambient blur */}
        <div className="absolute w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-[#C084FC] via-[#8B5CF6] to-[#6366F1] blur-2xl opacity-50" />
        {/* Core sphere */}
        <div
          className="relative w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-inner"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #E9D5FF 0%, #A78BFA 38%, #8B5CF6 70%, #6366F1 100%)",
          }}
        >
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/40">
            <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-white drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* Greeting and Main Heading */}
      <div className="text-center mb-6 space-y-1.5 max-w-xl px-2">
        <p className="text-sm md:text-base font-medium bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
          Hello, {username || "Learner"}
        </p>
        <h1 className="text-[22px] sm:text-3xl md:text-[40px] font-semibold text-[#0B0B0F] dark:text-[#F4F4F8] tracking-tight leading-snug text-balance">
          What DSA problem are you working on today?
        </h1>
      </div>

      {/* Large Input Card */}
      <div className="w-full mb-8">
        <ChatInput
          variant="hero"
          input={input}
          setInput={setInput}
          onSend={onSend}
          isLoading={isLoading}
          hintMode={hintMode}
          setHintMode={setHintMode}
          language={language}
          setLanguage={setLanguage}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onOpenSavedPrompts={onOpenSavedPrompts}
          onAttachFile={onAttachFile}
        />
      </div>

      {/* 3 Suggestion Cards in a Row (stack on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full max-w-[720px]">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => onSend(item.prompt)}
              className="group text-left p-4 rounded-[20px] bg-white dark:bg-[#171720] border border-[#ECECF1] dark:border-[#282835] hover:border-purple-300 dark:hover:border-purple-700/60 shadow-xs hover:shadow-[0_8px_30px_rgba(139,92,246,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F3EFFF] dark:bg-[#261E3D] text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#0B0B0F] dark:text-[#F4F4F8] mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-[#6B6B76] dark:text-[#A0A0AB] leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
