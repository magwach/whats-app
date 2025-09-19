import { IMessage } from "@/stores/chat.store";
import { getRelativeDateTime } from "@/utils/get.relative.date.time";
import { isSameDay } from "@/utils/is.same.day";

type DateType = {
  message: IMessage;
  previousMessage: IMessage | undefined | null;
};

export default function DateIndicator({ message, previousMessage }: DateType) {
  return (
    <>
      {!previousMessage ||
      !isSameDay(previousMessage._creationTime, message._creationTime) ? (
        <div className="flex justify-center">
          <p className="text-sm text-gray-50  dark:text-gray-400 mb-2 p-1 z-50 rounded-md bg-white dark:bg-[#1f2b32]">
            {getRelativeDateTime(message, previousMessage)}
          </p>
        </div>
      ) : null}
    </>
  );
}
