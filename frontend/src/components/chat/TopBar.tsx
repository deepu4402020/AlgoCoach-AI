"use client";

import { useState } from "react";
import {
  Menu,
  ChevronDown,
  Download,
  Share2,
  Check,
  Moon,
  Sun,
  GraduationCap,
  Briefcase,
  Code2,
} from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  mode: string;
  setMode: (mode: string) => void;
  onExportChat: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const MODES = [
  {
    id: "tutor",
    label: "AlgoCoach · Tutor",
    icon: GraduationCap,
    desc: "Interactive step-by-step guidance & hints",
  },
  {
    id: "mock",
    label: "AlgoCoach · Mock Interview",
    icon: Briefcase,
    desc: "Rigorous technical interview simulation",
  },
  {
    id: "review",
    label: "AlgoCoach · Code Review",
    icon: Code2,
    desc: "Complexity analysis and refactoring tips",
  },
];

export function TopBar({
  onToggleSidebar,
  isSidebarCollapsed,
  mode,
  setMode,
  onExportChat,
  isDarkMode,
  onToggleDarkMode,
}: TopBarProps) {
  const [modeOpen, setModeOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentModeObj = MODES.find((m) => m.label === mode) || MODES[0];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-[#FAFAFB]/90 dark:bg-[#0C0C10]/90 backdrop-blur-md border-b border-[#ECECF1] dark:border-[#23232F] px-4 flex items-center justify-between select-none">
      {/* Left Area: Toggle + Mode Pill */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-xl text-[#6B6B76] dark:text-[#A0A0AB] hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8] hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mode Pill Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModeOpen(!modeOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#171720] border border-[#ECECF1] dark:border-[#282835] text-xs font-semibold text-[#0B0B0F] dark:text-[#F4F4F8] shadow-2xs hover:border-purple-300 dark:hover:border-purple-700/60 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentModeObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>

          {modeOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#171720] border border-[#ECECF1] dark:border-[#282835] p-1.5 shadow-xl z-50">
              {MODES.map((item) => {
                const Icon = item.icon;
                const isSelected = item.label === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMode(item.label);
                      setModeOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-[#F3EFFF] text-purple-700 dark:bg-[#281F3D] dark:text-purple-300"
                        : "text-[#0B0B0F] dark:text-[#F4F4F8] hover:bg-gray-100 dark:hover:bg-[#22222D]"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[11px] text-[#6B6B76] dark:text-[#A0A0AB] mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Share, Export, Dark Mode */}
      <div className="flex items-center gap-1.5">
        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          title="Share conversation link"
          className="p-2 rounded-xl text-[#6B6B76] dark:text-[#A0A0AB] hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8] hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        {/* Export Chat Button */}
        <button
          type="button"
          onClick={onExportChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECECF1] dark:border-[#282835] bg-white dark:bg-[#171720] hover:bg-gray-50 dark:hover:bg-[#20202A] text-xs font-medium text-[#0B0B0F] dark:text-[#F4F4F8] transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Export chat</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-xl text-[#6B6B76] dark:text-[#A0A0AB] hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8] hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}

