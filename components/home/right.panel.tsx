"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, X } from "lucide-react";
import MessageInput from "./message.input";
import MessageContainer from "./message.container";
import ChatPlaceHolder from "./chat.placeholder";
import GroupMembersDialog from "./group.members.dialog";
import { useConversationStore } from "@/stores/chat.store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

export default function RightPanel() {
  const router = useRouter();

  const setConversationRoomURL = useMutation(
    api.conversations.updateConversationRoomURL
  );

  const { selectedConversation, setSelectedConversation } =
    useConversationStore();
  if (!selectedConversation) return <ChatPlaceHolder />;

  const conversationName =
    selectedConversation.groupName || selectedConversation.name;

  const isGroup = selectedConversation.isGroup;

  const handleVideoClick = async () => {
    let roomUrl = selectedConversation.videoRoomUrl as string;

    if (!roomUrl) {
      try {
        const res = await fetch("/api/create-room", { method: "POST" });
        const data = await res.json();
        console.log(data);
        roomUrl = data.url;

        await setConversationRoomURL({
          conversationId: selectedConversation._id,
          roomUrl: roomUrl!,
        });
      } catch (error) {
        console.log(error);
        toast.error("Failed to create video room");
      }
    }
    window.open(`/video-call?room=${encodeURIComponent(roomUrl)}`, "_blank");
  };

  return (
    <div className="w-3/4 flex flex-col">
      <div className="w-full sticky top-0 z-50">
        {/* Header */}
        <div className="flex justify-between bg-gray-primary p-3">
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage
                src={
                  selectedConversation.groupImage ||
                  selectedConversation.image ||
                  "/placeholder.png"
                }
                className="object-cover"
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p>{conversationName}</p>
              {isGroup && (
                <GroupMembersDialog users={selectedConversation.participants} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <Video
              size={23}
              className="cursor-pointer"
              onClick={handleVideoClick}
            />{" "}
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => setSelectedConversation(null)}
            />
          </div>
        </div>
      </div>
      {/* CHAT MESSAGES */}
      <MessageContainer />

      {/* INPUT */}
      <MessageInput />
    </div>
  );
}
