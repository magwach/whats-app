import ChatBubble from "./chat.bubble";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConversationStore } from "@/stores/chat.store";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MessageContainer() {
  const { selectedConversation } = useConversationStore();
  const messages = useQuery(api.messages.getConversationMessages, {
    conversation: selectedConversation?._id!,
  });
  const me = useQuery(api.users.getMe);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Watch scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // If user is not near bottom, show the button
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100; // px threshold

      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Click handler to scroll down
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark"
    >
      <div className="mx-12 flex flex-col gap-3 h-full">
        {messages?.map((msg, idx) => (
          <div key={msg._id}>
            <ChatBubble
              me={me}
              message={msg}
              previousMessage={idx > 0 ? messages[idx - 1] : null}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-0" ref={bottomRef} />

      {/* Floating scroll button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-8 z-50 p-3 rounded-full 
               bg-gray-600 hover:bg-gray-600 text-white shadow-lg 
               transition duration-200 cursor-pointer"
        >
          <ChevronDown size={22} />
        </button>
      )}
    </div>
  );
}
