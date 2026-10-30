"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  BookOpen,
  BarChart2,
  Layers,
  History,
  LogOut,
  PanelLeftClose,
  Sparkles,
  Trash2,
  MessageSquare,
  X,
} from "lucide-react";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onLogout: () => void;
  userEmail: string;
  isLoadingHistory?: boolean;
  onOpenTopics: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onToggleCollapse,
  isCollapsed,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onLogout,
  userEmail,
  isLoadingHistory = false,
  onOpenTopics,
}: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Derived user display info
  const displayName = useMemo(() => {
    if (!userEmail) return "Learner";
    const parts = userEmail.split("@")[0].split(/[._-]/);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  }, [userEmail]);

  const initials = useMemo(() => {
    if (!userEmail) return "AC";
    const clean = userEmail.split("@")[0].replace(/[^a-zA-Z]/g, "");
    return (clean.slice(0, 2) || "AC").toUpperCase();
  }, [userEmail]);

  // Grouped chats
  const groupedSessions = useMemo(() => {
    const filtered = sessions.filter((s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOf7Days = startOfToday - 6 * 86400000;

    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const prev7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    filtered.forEach((session) => {
      const time = session.createdAt;
      if (time >= startOfToday) {
        today.push(session);
      } else if (time >= startOfYesterday) {
        yesterday.push(session);
      } else if (time >= startOf7Days) {
        prev7Days.push(session);
      } else {
        older.push(session);
      }
    });

    return [
      { label: "Today", list: today },
      { label: "Yesterday", list: yesterday },
      { label: "Previous 7 days", list: prev7Days },
      { label: "Older", list: older },
    ].filter((group) => group.list.length > 0);
  }, [sessions, searchQuery]);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-[260px] h-full bg-[#F7F7F9] dark:bg-[#131318] border-r border-[#ECECF1] dark:border-[#23232F] transition-all duration-200 select-none ${
          isCollapsed ? "hidden md:hidden" : "flex"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top: Logo & Title */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shadow-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-[15px] tracking-tight text-[#0B0B0F] dark:text-[#F4F4F8]">
                AlgoCoach
              </span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="md:hidden p-1.5 rounded-lg text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-200/60 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Desktop collapse button */}
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="hidden md:flex p-1.5 rounded-lg text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Button: + New chat */}
        <div className="px-4 py-2">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B0B0F] hover:bg-black/85 text-white dark:bg-[#F4F4F8] dark:hover:bg-white dark:text-[#0B0B0F] text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New chat</span>
          </button>
        </div>

        {/* Search input with ⌘K badge */}
        <div className="px-4 py-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-[#A0A0AB]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-10 py-1.5 rounded-xl bg-white dark:bg-[#1A1A22] border border-[#ECECF1] dark:border-[#272733] text-xs text-[#0B0B0F] dark:text-[#F4F4F8] placeholder-[#A0A0AB] focus:outline-none focus:border-purple-400 dark:focus:border-purple-600 transition-colors"
            />
            <span className="absolute right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-[#6B6B76] dark:text-[#A0A0AB] pointer-events-none">
              ⌘K
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-1 space-y-0.5">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-700 dark:text-purple-300 bg-[#F3EFFF] dark:bg-[#251D3A] transition-colors"
          >
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Practice</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/progress")}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-200/50 dark:hover:bg-gray-800/40 hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8] transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-[#8B5CF6]" />
            <span>Progress</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenTopics();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-200/50 dark:hover:bg-gray-800/40 hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8] transition-colors"
          >
            <Layers className="w-4 h-4 text-[#8B5CF6]" />
            <span>Topics / Library</span>
          </button>

          <div className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-[#A0A0AB] select-none">
            <History className="w-4 h-4 text-[#A0A0AB]" />
            <span>History</span>
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {isLoadingHistory ? (
            /* Loading skeletons */
            <div className="space-y-2 p-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-7 rounded-lg bg-gray-200/70 dark:bg-gray-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : groupedSessions.length === 0 ? (
            <div className="py-8 px-2 text-center text-xs text-[#A0A0AB]">
              {searchQuery ? "No matching chats found" : "No chats yet. Start practicing!"}
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-2 text-[11px] font-semibold tracking-wider text-[#A0A0AB] dark:text-[#6E6E7F] uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.list.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                          isActive
                            ? "bg-[#F3EFFF] text-purple-700 dark:bg-[#271E3D] dark:text-purple-300 font-medium border border-[#E4DBFF]/70 dark:border-[#3E3160]/70"
                            : "text-[#6B6B76] dark:text-[#A0A0AB] hover:bg-gray-200/50 dark:hover:bg-gray-800/40 hover:text-[#0B0B0F] dark:hover:text-[#F4F4F8]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-6">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                          <span className="truncate">{session.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => onDeleteSession(session.id, e)}
                          title="Delete chat"
                          aria-label="Delete chat"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#A0A0AB] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-[#ECECF1] dark:border-[#23232F] bg-white/50 dark:bg-[#16161D]/50 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0B0B0F] dark:text-[#F4F4F8] truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#A0A0AB] truncate">
                  {userEmail || "learner@algocoach.dev"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="p-1.5 rounded-lg text-[#6B6B76] dark:text-[#A0A0AB] hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

