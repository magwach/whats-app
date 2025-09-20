import { MessageSeenSvg } from "@/lib/svgs";
import { IMessage, useConversationStore } from "@/stores/chat.store";
import ChatBubbleAvatar from "./chat.bubble.avatar";
import DateIndicator from "./date.indicator";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useState } from "react";

export default function ChatBubble({
  message,
  me,
  previousMessage,
}: {
  message: IMessage;
  me: any;
  previousMessage: IMessage | undefined | null;
}) {
  const date = new Date(message._creationTime);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const time = `${hour}:${minute}`;

  const { selectedConversation } = useConversationStore();
  const isGroup = selectedConversation?.isGroup;
  const isMember =
    selectedConversation?.participants.some(
      (p) => p._id === message.sender?._id
    ) || false;
  const fromMe = message.sender?._id === me._id;

  const bubbleBg = fromMe
    ? "bg-[#005c4b] text-white"
    : "bg-white dark:bg-[#1f2b32] text-gray-900 dark:text-gray-100";
  const alignment = fromMe ? "justify-end" : "justify-start";

  const [open, setOpen] = useState(false);

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return <TextMessage message={message} />;
      case "image":
        return (
          <ImageMessage message={message} handleClick={() => setOpen(true)} />
        );
      case "video":
        return <VideoMessage message={message} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Date indicator always centered */}
      <DateIndicator message={message} previousMessage={previousMessage} />

      {/* Message row */}
      <div className={`flex ${alignment} items-end w-full mb-1`}>
        {/* Show avatar only for group & not me */}

        <div className="mr-2">
          <ChatBubbleAvatar
            message={message}
            isMember={isMember}
            isGroup={selectedConversation?.isGroup}
          />
        </div>

        {/* Bubble */}
        <div
          className={`relative max-w-[75%] px-3 py-2 rounded-lg shadow ${bubbleBg}`}
        >
          {fromMe && isGroup ? (
            <SelfMessageIndicator />
          ) : (
            <OtherMessageIndicator />
          )}
          {renderMessageContent()}
          {open && (
            <ImageDialog
              src={message.content}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
          <MessageTime time={time} fromMe={fromMe} />
        </div>
      </div>
    </>
  );
}

const OtherMessageIndicator = () => (
  <div className="absolute bg-white dark:bg-[#1f2b32] bottom-0 -left-2 w-3 h-3 rounded-bl-lg" />
);

const SelfMessageIndicator = () => (
  <div className="absolute bg-[#005c4b] bottom-0 -right-2 w-3 h-3 rounded-br-lg" />
);

const TextMessage = ({ message }: { message: IMessage }) => {
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const parts = message.content.split(linkRegex);

  return (
    <div className="text-sm leading-relaxed break-words">
      {parts.map((part, i) =>
        linkRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
};

const VideoMessage = ({ message }: { message: IMessage }) => {
  return (
    <ReactPlayer
      src={message.content}
      width="250px"
      height="250px"
      controls={true}
      light={true}
    />
  );
};

const ImageMessage = ({
  message,
  handleClick,
}: {
  message: IMessage;
  handleClick: () => void;
}) => {
  return (
    <div className="w-[250px] h-[250px] m-2 relative">
      <Image
        src={message.content}
        fill
        className="cursor-pointer object-cover rounded"
        alt="image"
        onClick={handleClick}
      />
    </div>
  );
};

const ImageDialog = ({
  src,
  onClose,
  open,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogTitle>Image</DialogTitle>
      <DialogContent className="min-w-[750px]">
        <DialogDescription className="relative h-[450px] flex justify-center">
          <Image
            src={src}
            fill
            className="rounded-lg object-contain"
            alt="image"
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => (
  <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">
    {time} {fromMe && <MessageSeenSvg />}
  </div>
);
