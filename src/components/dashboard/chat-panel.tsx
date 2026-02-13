"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Trash2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Simple markdown renderer
function MarkdownContent({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    // Split into lines for processing
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let listBuffer: string[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushList = () => {
      if (listBuffer.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag
            key={`list-${elements.length}`}
            className={`my-2 space-y-1 ${listType === "ul" ? "list-disc" : "list-decimal"} pl-5 text-sm`}
          >
            {listBuffer.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ListTag>
        );
        listBuffer = [];
        listType = null;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      // Headers
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={i} className="text-sm font-bold mt-3 mb-1 text-foreground">
            {renderInline(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={i} className="text-base font-bold mt-3 mb-1 text-foreground">
            {renderInline(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={i} className="text-lg font-bold mt-3 mb-1 text-foreground">
            {renderInline(line.slice(2))}
          </h1>
        );
      }
      // Unordered list
      else if (/^[-*]\s/.test(line)) {
        if (listType !== "ul") flushList();
        listType = "ul";
        listBuffer.push(line.replace(/^[-*]\s/, ""));
      }
      // Ordered list
      else if (/^\d+\.\s/.test(line)) {
        if (listType !== "ol") flushList();
        listType = "ol";
        listBuffer.push(line.replace(/^\d+\.\s/, ""));
      }
      // Table row
      else if (line.startsWith("|") && line.endsWith("|")) {
        flushList();
        // Collect full table
        const tableLines: string[] = [line];
        while (
          i + 1 < lines.length &&
          lines[i + 1].startsWith("|") &&
          lines[i + 1].endsWith("|")
        ) {
          i++;
          tableLines.push(lines[i]);
        }
        // Parse table
        const rows = tableLines
          .filter((l) => !l.match(/^\|[\s-:|]+\|$/)) // skip separator
          .map((l) =>
            l
              .split("|")
              .filter(Boolean)
              .map((c) => c.trim())
          );
        if (rows.length > 0) {
          elements.push(
            <div key={`table-${elements.length}`} className="my-2 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    {rows[0].map((cell, ci) => (
                      <th key={ci} className="px-3 py-1.5 text-left font-semibold text-foreground">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-t border-border">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-muted-foreground">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }
      // Code block
      else if (line.startsWith("```")) {
        flushList();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="my-2 p-3 rounded-lg bg-muted/60 border border-border text-xs font-mono overflow-x-auto text-foreground"
          >
            {codeLines.join("\n")}
          </pre>
        );
      }
      // Horizontal rule
      else if (line.match(/^---+$/)) {
        flushList();
        elements.push(
          <hr key={i} className="my-3 border-border" />
        );
      }
      // Empty line
      else if (line.trim() === "") {
        flushList();
      }
      // Regular paragraph
      else {
        flushList();
        elements.push(
          <p key={i} className="text-sm leading-relaxed my-1">
            {renderInline(line)}
          </p>
        );
      }

      i++;
    }
    flushList();
    return elements;
  };

  // Inline markdown rendering
  const renderInline = (text: string): React.ReactNode => {
    // Process bold, italic, inline code, links
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Italic
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

      // Find earliest match
      const matches = [
        boldMatch ? { type: "bold", match: boldMatch } : null,
        codeMatch ? { type: "code", match: codeMatch } : null,
        italicMatch ? { type: "italic", match: italicMatch } : null,
      ]
        .filter(Boolean)
        .sort((a, b) => a!.match.index! - b!.match.index!);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0]!;
      const idx = first.match.index!;

      if (idx > 0) {
        parts.push(remaining.slice(0, idx));
      }

      if (first.type === "bold") {
        parts.push(
          <strong key={key++} className="font-semibold text-foreground">
            {first.match[1]}
          </strong>
        );
      } else if (first.type === "code") {
        parts.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 rounded bg-muted/80 text-xs font-mono text-foreground"
          >
            {first.match[1]}
          </code>
        );
      } else if (first.type === "italic") {
        parts.push(
          <em key={key++} className="italic">
            {first.match[1]}
          </em>
        );
      }

      remaining = remaining.slice(idx + first.match[0].length);
    }

    return parts.length === 1 && typeof parts[0] === "string"
      ? parts[0]
      : parts;
  };

  return <div className="space-y-0.5">{renderMarkdown(content)}</div>;
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 px-1">
      <div className="shrink-0 h-7 w-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="bg-glass border border-border rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// Suggested prompts
const SUGGESTED_PROMPTS = [
  "📊 Summarize all my bills",
  "💰 Which bill was the highest?",
  "⚡ Compare my electricity bills",
  "💡 Tips to reduce my bill",
  "📅 Which bills are unpaid?",
  "📈 Show my spending trend",
];

export function ChatPanel() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const bills = useQuery(
    api.bills.getUserBills,
    user ? { userId: user.id } : "skip"
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Auto-resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = "40px";
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          bills: bills || [],
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.error ||
            "Sorry, I'm having trouble responding right now. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "40px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl bg-violet-500/30 animate-ping opacity-30 pointer-events-none" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-out ${
            isExpanded
              ? "inset-4 sm:inset-6"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-[420px] h-[min(600px,calc(100vh-3rem))]"
          }`}
        >
          <div className="flex flex-col h-full rounded-2xl bg-background/95 backdrop-blur-2xl border border-border shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-glass">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    BillSense AI
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {bills?.length
                      ? `${bills.length} bill${bills.length > 1 ? "s" : ""} loaded`
                      : "Ready to help"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-strong transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-strong transition-colors hidden sm:flex"
                  title={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsExpanded(false);
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-glass-strong transition-colors"
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
              {messages.length === 0 && !isLoading ? (
                // Welcome state
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-foreground">
                      Hi! I&apos;m BillSense AI 👋
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px]">
                      Ask me anything about your utility bills — spending
                      analysis, comparisons, savings tips, or bill details.
                    </p>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt.replace(/^[^ ]+ /, ""))}
                        className="text-left text-xs px-3 py-2.5 rounded-xl bg-glass border border-border hover:bg-glass-strong hover:border-violet-500/20 transition-all text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 px-1 ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`shrink-0 h-7 w-7 rounded-xl flex items-center justify-center shadow-md ${
                          msg.role === "user"
                            ? "bg-foreground text-background"
                            : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/20"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-foreground text-background rounded-2xl rounded-tr-md"
                            : "bg-glass border border-border rounded-2xl rounded-tl-md text-foreground"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <MarkdownContent content={msg.content} />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border bg-glass px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your bills..."
                  rows={1}
                  className="flex-1 resize-none bg-glass-strong border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all min-h-[40px] max-h-[120px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:shadow-none transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                BillSense AI can make mistakes. Verify important bill details.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
