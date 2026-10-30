"use client";

import { X, BookOpen, ArrowUpRight } from "lucide-react";

interface TopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const TOPICS = [
  {
    title: "Sliding Window",
    badge: "Medium",
    prompt: "Teach me how to identify when to use Sliding Window versus Two Pointers, with an example.",
    desc: "Fixed & variable window techniques for subarrays and substrings.",
  },
  {
    title: "Two Pointers",
    badge: "Easy - Medium",
    prompt: "Explain the two pointers technique for sorting or searching pairs in an array.",
    desc: "Opposite ends, fast/slow pointers for cycles and palindromes.",
  },
  {
    title: "Binary Search",
    badge: "Medium",
    prompt: "How do I avoid off-by-one errors in binary search boundary conditions? Give me a template.",
    desc: "Search space reduction, monotonic predicates, lower/upper bounds.",
  },
  {
    title: "Dynamic Programming",
    badge: "Hard",
    prompt: "Guide me through breaking down 0/1 Knapsack DP step by step.",
    desc: "Memoization, tabulation, state transitions and space optimization.",
  },
  {
    title: "Graph BFS / DFS",
    badge: "Medium",
    prompt: "What is the difference between BFS and DFS for finding shortest paths in unweighted graphs?",
    desc: "Topological sort, cycle detection, connected components.",
  },
  {
    title: "Tries & Trees",
    badge: "Medium - Hard",
    prompt: "How does a Trie prefix tree work in C++/Python, and what are its time complexities?",
    desc: "Prefix matching, word search, LCA in Binary Trees.",
  },
];

export function TopicsModal({
  isOpen,
  onClose,
  onSelectPrompt,
}: TopicsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[24px] bg-white dark:bg-[#171720] border border-[#ECECF1] dark:border-[#282835] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F0F0F4] dark:border-[#242430]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0B0B0F] dark:text-[#F4F4F8]">
                Topics & Saved Prompts
              </h2>
              <p className="text-xs text-[#6B6B76] dark:text-[#A0A0AB]">
                Select any DSA pattern to kickstart your practice session
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-[#0B0B0F] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {TOPICS.map((topic) => (
            <div
              key={topic.title}
              onClick={() => {
                onSelectPrompt(topic.prompt);
                onClose();
              }}
              className="group p-4 rounded-2xl border border-[#ECECF1] dark:border-[#282835] hover:border-purple-300 dark:hover:border-purple-600/70 bg-white dark:bg-[#1A1A24] hover:bg-[#FDFBFF] dark:hover:bg-[#1F192E] cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-semibold text-[#0B0B0F] dark:text-[#F4F4F8] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {topic.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                    {topic.badge}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B76] dark:text-[#A0A0AB] leading-relaxed">
                  {topic.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F5F5F8] dark:border-[#252533] flex items-center justify-between text-xs font-medium text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                <span>Ask AlgoCoach</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

