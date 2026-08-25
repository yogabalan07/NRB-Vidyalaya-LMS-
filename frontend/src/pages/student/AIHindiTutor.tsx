import { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Bot,
  User,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useAIConversations,
  useAIMessages,
  useCreateConversation,
  useSendMessage,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIMessage } from "@/types/ai";

type Level = "beginner" | "intermediate" | "advanced";

const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "Basic Hindi conversations" },
  { value: "intermediate", label: "Intermediate", description: "More complex sentences" },
  { value: "advanced", label: "Advanced", description: "Fluent Hindi discussions" },
];

function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <Skeleton className={`h-12 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
        </div>
      ))}
    </div>
  );
}

function ConversationSidebarSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  message: AIMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[75%] items-start gap-2 rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {!isUser && (
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        {isUser && (
          <User className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground" />
        )}
      </div>
    </div>
  );
}

export function StudentAITutorPage() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");
  const [inputMessage, setInputMessage] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [localMessages, setLocalMessages] = useState<AIMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, isLoading: conversationsLoading } =
    useAIConversations(userId);
  const { data: remoteMessages, isLoading: messagesLoading } =
    useAIMessages(activeConversationId || "");
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  useEffect(() => {
    if (remoteMessages && activeConversationId) {
      setLocalMessages(remoteMessages);
    }
  }, [remoteMessages, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleNewConversation = async () => {
    if (!userId) return;
    setError(null);
    try {
      const conv = await createConversation.mutateAsync({
        user_id: userId,
        level: selectedLevel,
        topic: "Hindi Practice",
      });
      setActiveConversationId(conv.id);
      setLocalMessages([]);
    } catch {
      setError("Failed to create conversation. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || sendMessage.isPending) return;
    setError(null);

    const userMsg: AIMessage = {
      id: `local-${Date.now()}`,
      conversationId: activeConversationId || "",
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    try {
      const result = await sendMessage.mutateAsync({
        message: text,
        level: selectedLevel,
        conversationId: activeConversationId || undefined,
      });

      if (result.conversationId && !activeConversationId) {
        setActiveConversationId(result.conversationId);
      }

      const aiMsg: AIMessage = {
        id: `local-ai-${Date.now()}`,
        conversationId: result.conversationId,
        role: "assistant",
        content: result.reply,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, aiMsg]);
    } catch {
      setError("Failed to get AI response. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setLocalMessages([]);
    setError(null);
  };

  const handleClearConversation = () => {
    setActiveConversationId(null);
    setLocalMessages([]);
    setError(null);
  };

  const displayMessages = localMessages;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-lg border">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } shrink-0 overflow-hidden border-r bg-card transition-all duration-300`}
      >
        <div className="flex h-full w-72 flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewConversation}
              disabled={createConversation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <ConversationSidebarSkeleton />
            ) : !conversations?.length ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet. Start a new one!
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      activeConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {conv.topic || "Conversation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conv.level && (
                            <Badge variant="secondary" className="mr-1 text-[10px]">
                              {conv.level}
                            </Badge>
                          )}
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeConversationId && (
            <div className="border-t p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleClearConversation}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Chat
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Toggle sidebar + Header */}
        <div className="flex items-center gap-3 border-b bg-card px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <div className="flex flex-1 items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">AI Hindi Tutor</h1>
          </div>

          <div className="flex items-center gap-1">
            {LEVELS.map((level) => (
              <Button
                key={level.value}
                variant={selectedLevel === level.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedLevel(level.value)}
                className="text-xs"
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {!activeConversationId ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">
                Welcome to AI Hindi Tutor
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Start a new conversation to practice Hindi with our AI tutor.
                Choose your skill level and begin chatting!
              </p>
              <Button
                className="mt-6"
                onClick={handleNewConversation}
                disabled={createConversation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          ) : messagesLoading && localMessages.length === 0 ? (
            <ChatSkeleton />
          ) : displayMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Send a message to start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {sendMessage.isPending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeConversationId && (
          <div className="border-t bg-card p-4">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message in Hindi or English..."
                disabled={sendMessage.isPending}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessage.isPending}
                size="icon"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {LEVELS.find((l) => l.value === selectedLevel)?.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
