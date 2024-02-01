"use client";
import { Bot } from "lucide-react";
import { useState } from "react";
import AIChatBox from "./AIChatBox";
import { Button } from "../ui/button";

export default function AIChatCirclButton() {
  const [chatBoxOpen, setChatBoxOpen] = useState(false);

  return (
    <>
      {!chatBoxOpen && (
        <button
          className="fixed bottom-0 right-0 m-3 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-80"
          onClick={() => setChatBoxOpen(true)}
        >
          <Bot size={35} className="" />
          <p className="text-md pb-2 font-extrabold text-primary-foreground">
            AI Chat
          </p>
        </button>
      )}
      <AIChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />
    </>
  );
}
