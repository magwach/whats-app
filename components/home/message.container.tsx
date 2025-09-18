import ChatBubble from "./chat.bubble";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConversationStore } from "@/stores/chat.store";
export default function MessageContainer() {
  const { selectedConversation } = useConversationStore();
  const messages = useQuery(api.messages.getConversationMessages, {
    conversation: selectedConversation?._id!,
  });
  const me = useQuery(api.users.getMe);
  console.log(messages);
  return (
    <div className="relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark">
      <div className="mx-12 flex flex-col gap-3 h-full">
        {messages?.map((msg, idx) => (
          <div key={msg._id}>
            <ChatBubble me={me} message={msg} />
          </div>
        ))}
      </div>
    </div>
  );
}
