import { useMutation, useConvex } from "convex/react";
import { Ban, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { api } from "@/convex/_generated/api";
import { IMessage, useConversationStore } from "@/stores/chat.store";

type ChatAvatarActionsProps = {
  message: IMessage;
  me: any;
};

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
  const convex = useConvex();

  const { selectedConversation, setSelectedConversation } =
    useConversationStore();

  const isMember = selectedConversation?.participants.some(
    (p) => p._id === message.sender?._id
  );
  const kickUser = useMutation(api.conversations.kickUserFromGroup);
  const createConversation = useMutation(api.conversations.createConversation);
  const fromAI = message.sender?.name === "Grok";
  const isGroup = selectedConversation?.isGroup;

  const handleKickUser = async (e: React.MouseEvent) => {
    if (fromAI) return;
    e.stopPropagation();
    if (!selectedConversation) return;
    try {
      await kickUser({
        conversationId: selectedConversation._id,
        userId: message.sender._id,
      });

      setSelectedConversation({
        ...selectedConversation,
        participants: selectedConversation.participants.filter(
          (participant) => participant._id !== message.sender._id
        ),
      });
    } catch (error) {
        console.log(error);
      toast.error("Failed to kick user");
    }
  };

  const handleCreateConversation = async () => {
    if (fromAI) return;

    try {
      const conversationId = await createConversation({
        isGroup: false,
        participants: [me._id, message.sender._id],
      });

      const conversations = await convex.query(
        api.conversations.getMyConversations,
        {
          conversationId,
        }
      );
      if (conversations === undefined) {
        throw new Error("No conversations found");
      }
      setSelectedConversation(conversations[0]);
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  return (
    <div
      className="text-[11px] flex gap-4 justify-between font-bold cursor-pointer group"
      onClick={handleCreateConversation}
    >
      {isGroup && message.sender.name}

      {!isMember && !fromAI && isGroup && (
        <Ban size={16} className="text-red-500" />
      )}
      {isGroup && isMember && selectedConversation?.admin === me._id && (
        <LogOut
          size={16}
          className="text-red-500 opacity-0 group-hover:opacity-100"
          onClick={handleKickUser}
        />
      )}
    </div>
  );
};
export default ChatAvatarActions;
