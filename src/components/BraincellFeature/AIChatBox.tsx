import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Message } from "ai";
import { useChat } from "ai/react";
import {
  Bot,
  Trash,
  XCircle,
  Mic,
  Volume,
  Volume1,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

export default function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the type of event in the function signature
    function handleClickOutside(event: MouseEvent) {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Remove event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: "greeting",
        role: "assistant" as const,
        content:
          "Hello,\nI am Osmanity Chatbot, an intelligent Virtual Assistant designed to assist you with any questions or information you need.",
      },
      {
        id: "greeting2",
        role: "assistant" as const,
        content: "How can I assist you?",
      },
      // ... more messages
    ];

    setMessages(initialMessages);
  }, [setMessages]);

  return (
    <div
      ref={chatBoxRef}
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-2",
        open ? "fixed" : "hidden",
      )}
    >
      <div className="flex h-[600px] flex-col rounded border bg-background shadow-xl">
        {" "}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 p-2 shadow dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="mb-0.5 ml-1">
              <Bot />
            </div>
            <p className=" text-lg font-bold">Virtual Assistant</p>
            <span className=" inline-block h-1 w-1 animate-ping rounded-full bg-green-400"></span>
          </div>
          <button onClick={onClose} className=" p-2">
            <XCircle size={30} />
          </button>
        </div>
        <div className="mt-3 h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))}
          {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Thinking...",
              }}
            />
          )}
          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something went wrong. Please try again.",
              }}
            />
          )}
          {!error && messages.length === 0 && (
            <div className="flex h-full items-center justify-center gap-3">
              <Bot />
              Ask our Virtual Assistantce any question about us
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-3">
          {/* <Button
            title="Clear chat"
            variant="outline"
            size="icon"
            className="shrink-0"
            type="button"
            onClick={() => setMessages([])}
          >
            <Trash />
          </Button> */}
          <Button
            title="Volyme"
            variant="outline"
            size="icon"
            className="shrink-0"
            type="button"
            // onClick={() => setMessages([])}
          >
            <Volume2 />
          </Button>
          <Button
            title="unmute"
            variant="outline"
            size="icon"
            className="shrink-0"
            type="button"
            // onClick={() => setMessages([])}
          >
            <Mic />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
            ref={inputRef}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const { user } = useUser();

  const isAiMessage = role === "assistant";

  return (
    <div
      className={cn(
        "mb-3  flex items-center",
        isAiMessage ? "me-5 justify-start" : "ms-5 justify-end",
        "animate-fade-in-up",
      )}
    >
      {isAiMessage && <Bot className="mr-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border px-3 py-2",
          isAiMessage ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
      {!isAiMessage && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="User image"
          width={100}
          height={100}
          className="ml-2 h-10 w-10 rounded-full object-cover"
        />
      )}
    </div>
  );
}
