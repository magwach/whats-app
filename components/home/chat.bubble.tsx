import { MessageSeenSvg } from "@/lib/svgs";
import { IMessage, useConversationStore } from "@/stores/chat.store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatBubbleAvatar from "./chat.bubble.avatar";
import DateIndicator from "./date.indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useState } from "react";
import ChatAvatarActions from "./chat.avatar.actions";

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

  const bgClass = fromMe
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
      case "audio":
        return <AudioMessage message={message} />;
      default:
        return null;
    }
  };

  if (!fromMe) {
    return (
      <>
        <DateIndicator message={message} previousMessage={previousMessage} />
        <div className="flex gap-1 w-2/3">
          <ChatBubbleAvatar
            isGroup={isGroup}
            isMember={isMember}
            message={message}
          />
          <div
            className={`flex flex-col z-20 max-w-fit px-2 pt-1 rounded-md shadow-md relative ${bgClass}`}
          >
            {<ChatAvatarActions message={message} me={me} />}
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

  return (
    <>
      <DateIndicator message={message} previousMessage={previousMessage} />

      <div className="flex gap-1 w-2/3 ml-auto">
        <div
          className={`flex flex-col  z-20 max-w-fit px-2 pt-1 rounded-md shadow-md ml-auto relative ${bgClass}`}
        >
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

const TextMessage = ({ message }: { message: IMessage }) => {
  return (
    <div className="text-sm leading-relaxed break-words prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-blue-400 underline hover:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mt-3 mb-2" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-semibold mt-2 mb-1" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-medium mt-2 mb-1" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="list-disc list-inside" />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-semibold text-foreground" />
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
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

const AudioMessage = ({ message }: { message: IMessage }) => {
  return (
    <div className="flex items-center gap-2 max-w-xs">
      <audio controls src={message.content} />
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
