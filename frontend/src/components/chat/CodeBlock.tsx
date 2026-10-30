"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export function CodeBlock({ language = "text", value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language || "text").toLowerCase().replace(/^language-/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback if clipboard API is unavailable
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-[#ECECF1] dark:border-[#282835] bg-[#121217] text-slate-100 text-[13px] font-mono shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#242430] bg-[#1A1A22] text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-purple-300">
          {cleanLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <Highlight theme={themes.nightOwl} code={value.trim()} language={cleanLang as any}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            style={{ ...style, backgroundColor: "transparent" }}
            className="p-4 overflow-x-auto leading-relaxed"
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="inline-block w-8 select-none text-slate-600 text-right pr-4 text-xs">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

