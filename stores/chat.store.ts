import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

export type Participants = {
  email: string;
  image: string;
  name?: string;
  isOnline: Boolean;
  _id: Id<"users">;
}[];

export type Conversation = {
  _id: Id<"conversations">;
  image?: string;
  participants: Participants;
  isGroup: boolean;
  name?: string;
  groupImage?: string;
  groupName?: string;
  admin?: Id<"users">;
  isOnline?: boolean;
  email?: string;
  lastMessage?: {
    _id: Id<"messages">;
    conversation: Id<"conversations">;
    content: string | null;
    sender: string;
    messageType?: "text" | "image" | "video";
    _creationTime: number;
  };
  _creationTime: number;
};

type ConversationStore = {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
}));
