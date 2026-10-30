"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User as UserIcon } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-5">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 bg-[#F3EFFF] dark:bg-[#231B38] text-[#0B0B0F] dark:text-[#F4F4F8] border border-[#E4DBFF] dark:border-[#3D3063] shadow-xs">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start items-start gap-3.5 mb-6 group">
      {/* Assistant Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shadow-purple-500/20 mt-1">
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Assistant Content */}
      <div className="flex-1 min-w-0 text-[15px] leading-relaxed text-[#0B0B0F] dark:text-[#F4F4F8]">
        <div className="prose prose-purple dark:prose-invert max-w-none text-[15px] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p({ children }) {
                return <p className="mb-3.5 leading-relaxed">{children}</p>;
              },
              h1({ children }) {
                return (
                  <h1 className="text-2xl font-bold tracking-tight text-[#0B0B0F] dark:text-white mt-5 mb-3">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-xl font-semibold tracking-tight text-[#0B0B0F] dark:text-white mt-4 mb-2.5">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-lg font-semibold tracking-tight text-[#0B0B0F] dark:text-white mt-3.5 mb-2">
                    {children}
                  </h3>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 my-3 space-y-1.5">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 my-3 space-y-1.5">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-purple-400 pl-4 py-1 my-3 bg-[#F3EFFF]/50 dark:bg-[#231B38]/40 rounded-r-lg italic text-[#6B6B76] dark:text-[#A0A0AB]">
                    {children}
                  </blockquote>
                );
              },
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (!inline && (match || codeString.includes("\n"))) {
                  return (
                    <CodeBlock
                      language={match ? match[1] : "text"}
                      value={codeString}
                    />
                  );
                }

                return (
                  <code
                    className="font-mono text-[13px] bg-[#F3EFFF] dark:bg-[#231B38] text-purple-700 dark:text-purple-300 border border-[#E4DBFF] dark:border-[#3D3063] px-1.5 py-0.5 rounded-md font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

