import { MessageSeenSvg } from "@/lib/svgs";
import { IMessage, useConversationStore } from "@/stores/chat.store";
import ChatBubbleAvatar from "./chat.bubble.avatar";
import DateIndicator from "./date.indicator";

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
          {fromMe && isGroup ? <SelfMessageIndicator /> : <OtherMessageIndicator />}
          <TextMessage message={message} />
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

const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => (
  <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">
    {time} {fromMe && <MessageSeenSvg />}
  </div>
);
