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
  lastMessage?: IMessage;
  videoRoomUrl?: string;
  _creationTime: number;
};

export interface IMessage {
  _id: string;
  content: string;
  _creationTime: number;
  messageType: "text" | "image" | "video" | "audio";
  sender: {
    _id: Id<"users">;
    image: string;
    name?: string;
    tokenIdentifier: string;
    email: string;
    _creationTime: number;
    isOnline: boolean;
  };
}

type ConversationStore = {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
};

export const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
}));
