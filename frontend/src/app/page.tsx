"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, ChatSession } from "@/components/chat/Sidebar";
import { TopBar } from "@/components/chat/TopBar";
import { Hero } from "@/components/chat/Hero";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ShortcutsModal } from "@/components/chat/ShortcutsModal";
import { TopicsModal } from "@/components/chat/TopicsModal";
import { AttachModal } from "@/components/chat/AttachModal";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHATS_STORAGE_KEY = "algocoach_sessions_v2";
const EMAIL_STORAGE_KEY = "algocoach_user_email";
const THEME_STORAGE_KEY = "algocoach_theme";

export default function ChatPage() {
  const router = useRouter();

  // Chat State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");

  // Toolbar & Preferences
  const [hintMode, setHintMode] = useState(true);
  const [language, setLanguage] = useState("Python");
  const [difficulty, setDifficulty] = useState("Medium");
  const [mode, setMode] = useState("AlgoCoach · Tutor");

  // Layout & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);

  // User details
  const [userEmail, setUserEmail] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // Load user email
      const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
      if (savedEmail) setUserEmail(savedEmail);

      // Load theme - default to clean airy light theme
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const shouldUseDark = savedTheme === "dark";
      setIsDarkMode(shouldUseDark);
      if (shouldUseDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Load past sessions
      const raw = localStorage.getItem(CHATS_STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore local storage state", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save sessions to localStorage", e);
    }
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_STORAGE_KEY, "light");
      }
      return next;
    });
  };

  // Switch / Select Session
  const handleSelectSession = (id: string) => {
    const s = sessions.find((item) => item.id === id);
    if (s) {
      setActiveSessionId(s.id);
      setMessages(s.messages || []);
      setStreamError(null);
    }
  };

  // Start New Chat
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setStreamError(null);
  };

  // Delete Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      handleNewChat();
    }
  };

  // Logout handler (unchanged backend endpoint)
  const handleLogout = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem(EMAIL_STORAGE_KEY);
      router.push("/login");
    } catch (e) {
      console.error("Logout failed", e);
      router.push("/login");
    }
  };

  // Export current chat to Markdown
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const dateStr = new Date().toLocaleDateString();
    let md = `# AlgoCoach AI Practice Session - ${dateStr}\n\n`;
    messages.forEach((m) => {
      md += `### ${m.role === "user" ? "User" : "AlgoCoach"}:\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `algocoach-session-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Send message & stream response
  const sendMessage = async (overrideMessage?: string) => {
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setStreamError(null);
    setLastUserMessage(userMessage);

    // Contextual instruction suffix for hint mode if active
    let promptToSend = userMessage;
    if (hintMode && !userMessage.toLowerCase().includes("hint")) {
      promptToSend = `${userMessage} (Preferred language: ${language}. Please guide me with pedagogical hints first without revealing full code.)`;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    // Identify or generate current session
    let currentId = activeSessionId;
    let currentSessions = [...sessions];

    if (!currentId) {
      currentId = `session-${Date.now()}`;
      setActiveSessionId(currentId);
      const title = userMessage.length > 36 ? userMessage.slice(0, 36) + "..." : userMessage;
      const newSession: ChatSession = {
        id: currentId,
        title,
        createdAt: Date.now(),
        messages: newMessages,
      };
      currentSessions = [newSession, ...currentSessions];
      saveSessions(currentSessions);
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: promptToSend,
          history: messages,
        }),
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.body) {
        throw new Error("No response body received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;
      let accumulatedReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (isFirstChunk) {
                setIsLoading(false);
                isFirstChunk = false;

                if (data.error) {
                  setStreamError(data.error);
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: `Error: ${data.error}` },
                  ]);
                } else if (data.reply !== undefined) {
                  accumulatedReply = data.reply;
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.reply },
                  ]);
                }
              } else {
                if (data.error) {
                  setStreamError(data.error);
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = `Error: ${data.error}`;
                    return updated;
                  });
                } else if (data.reply !== undefined) {
                  accumulatedReply = data.reply;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = data.reply;
                    return updated;
                  });
                }
              }
            } catch (err) {
              console.error("Error parsing SSE JSON chunk", err);
            }
          }
        }
      }

      // Update session in localStorage with final conversation
      if (currentId) {
        const finalMessages: Message[] = [
          ...newMessages,
          { role: "assistant", content: accumulatedReply },
        ];
        const updated = currentSessions.map((s) =>
          s.id === currentId ? { ...s, messages: finalMessages } : s
        );
        saveSessions(updated);
      }
    } catch (err: any) {
      console.error("Error communicating with AlgoCoach backend:", err);
      const errMsg = "Oops! Could not connect to the AlgoCoach server. Please check your connection.";
      setStreamError(errMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errMsg },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const isHeroState = messages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFB] dark:bg-[#0C0C10] text-[#0B0B0F] dark:text-[#F4F4F8]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCollapsed={isSidebarCollapsed}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
        userEmail={userEmail}
        isLoadingHistory={!isLoaded}
        onOpenTopics={() => setIsTopicsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <TopBar
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setIsSidebarOpen(!isSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          isSidebarCollapsed={isSidebarCollapsed}
          mode={mode}
          setMode={setMode}
          onExportChat={handleExportChat}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {isHeroState ? (
            /* Empty State Hero */
            <div className="flex-1 overflow-y-auto">
              <Hero
                username={userEmail ? userEmail.split("@")[0] : "Learner"}
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                isLoading={isLoading}
                hintMode={hintMode}
                setHintMode={setHintMode}
                language={language}
                setLanguage={setLanguage}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                onOpenSavedPrompts={() => setIsTopicsOpen(true)}
                onAttachFile={() => setIsAttachOpen(true)}
              />
            </div>
          ) : (
            /* Chat Messages + Pinned Bottom Input */
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                error={streamError}
                onRetry={() => {
                  if (lastUserMessage) sendMessage(lastUserMessage);
                }}
              />

              {/* Pinned Bottom Input Bar */}
              <div className="sticky bottom-0 z-20 w-full px-4 pb-4 pt-2 bg-gradient-to-t from-[#FAFAFB] via-[#FAFAFB]/95 to-transparent dark:from-[#0C0C10] dark:via-[#0C0C10]/95">
                <ChatInput
                  variant="compact"
                  input={input}
                  setInput={setInput}
                  onSend={sendMessage}
                  isLoading={isLoading}
                  hintMode={hintMode}
                  setHintMode={setHintMode}
                  language={language}
                  setLanguage={setLanguage}
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  onOpenSavedPrompts={() => setIsTopicsOpen(true)}
                  onAttachFile={() => setIsAttachOpen(true)}
                />
              </div>
            </div>
          )}
        </main>

        {/* Floating Help / Shortcuts Button */}
        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
          onOpen={() => setIsShortcutsOpen(true)}
        />

        {/* Topics & Saved Prompts Modal */}
        <TopicsModal
          isOpen={isTopicsOpen}
          onClose={() => setIsTopicsOpen(false)}
          onSelectPrompt={(prompt) => {
            if (isHeroState) {
              sendMessage(prompt);
            } else {
              setInput(prompt);
            }
          }}
        />

        {/* Attach Code Snippet Modal */}
        <AttachModal
          isOpen={isAttachOpen}
          onClose={() => setIsAttachOpen(false)}
          onAttach={(code) => {
            setInput((prev) => (prev ? `${prev}\n\n${code}` : code));
          }}
        />
      </div>
    </div>
  );
}
