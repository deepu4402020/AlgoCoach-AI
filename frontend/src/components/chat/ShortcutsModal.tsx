"use client";

import { HelpCircle, X } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const SHORTCUTS = [
  { key: "Enter", desc: "Send your message to AlgoCoach" },
  { key: "Shift + Enter", desc: "Insert a new line in the input box" },
  { key: "⌘K / Ctrl + K", desc: "Quick focus search in past chats" },
  { key: "Hint Mode", desc: "Guides with clues without spoiling code" },
  { key: "Esc", desc: "Dismiss open dialogs and drawers" },
];

export function ShortcutsModal({ isOpen, onClose, onOpen }: ShortcutsModalProps) {
  return (
    <>
      {/* Floating "?" Button at bottom-right */}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Keyboard shortcuts and help"
        title="Keyboard shortcuts & help"
        className="fixed bottom-5 right-5 z-30 w-8 h-8 rounded-full bg-white dark:bg-[#1A1A24] border border-[#ECECF1] dark:border-[#2C2C3C] text-[#6B6B76] dark:text-[#A0A0AB] hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8] hover:border-purple-300 dark:hover:border-purple-600 shadow-md hover:scale-105 transition-all flex items-center justify-center font-semibold text-xs"
      >
        <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#171720] border border-[#ECECF1] dark:border-[#282835] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0F0F4] dark:border-[#242430]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#0B0B0F] dark:text-[#F4F4F8]">
                  Shortcuts & Tips
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

            <div className="space-y-2.5">
              {SHORTCUTS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="text-[#6B6B76] dark:text-[#A0A0AB]">
                    {item.desc}
                  </span>
                  <kbd className="px-2 py-0.5 rounded-md font-mono bg-gray-100 dark:bg-[#232330] border border-gray-200 dark:border-[#333342] text-[#0B0B0F] dark:text-[#F4F4F8] text-[11px] font-medium shrink-0">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-[#F0F0F4] dark:border-[#242430]">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-[#0B0B0F] dark:bg-[#F4F4F8] text-white dark:text-[#0B0B0F] text-xs font-medium hover:bg-black/85 dark:hover:bg-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

