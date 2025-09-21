import { Laugh, Loader, Mic, Plus, Send, Square, XCircle } from "lucide-react";
import { Input } from "../ui/input";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConversationStore } from "@/stores/chat.store";
import useComponentVisible from "@/hooks/use.component.visible";
import EmojiPicker, { Theme } from "emoji-picker-react";
import MediaDropdown from "./media.dropdown";

export default function MessageInput() {
  const [msgText, setMsgText] = useState("");
  const [sendingAudio, setSendingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const sendTextMessage = useMutation(api.messages.sendTextMessage);
  const sendAudioMessage = useMutation(api.messages.sendAudio);

  const me = useQuery(api.users.getMe);
  const { selectedConversation } = useConversationStore();

  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);

  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendTextMessage({
        sender: me?._id!,
        conversationId: selectedConversation?._id!,
        content: msgText,
      });
      setMsgText("");
    } catch (error) {
      console.log(error);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        audioChunks.current = [];
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const sendRecording = async () => {
    if (!audioBlob) return;

    setSendingAudio(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": audioBlob.type },
        body: audioBlob,
      });

      const { storageId } = await result.json();

      await sendAudioMessage({
        sender: me?._id!,
        conversation: selectedConversation?._id!,
        audioId: storageId,
      });
      discardRecording();
    } catch (error) {
      console.log(error);
    } finally {
      setSendingAudio(false);
    }
  };

  return (
    <div className="bg-gray-primary p-2 flex flex-col gap-2">
      {/* === Preview Section (above input bar) === */}
      {audioBlob && audioUrl && (
        <div className="flex flex-col gap-2 items-center p-2 rounded-lg bg-gray-tertiary">
          <audio controls src={audioUrl} className="w-full" />
          {sendingAudio ? (
            <Loader className="animate-spin text-gray-500" />
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={discardRecording}
                size="icon"
                variant="outline"
                className="rounded-full text-red-500 border-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <XCircle className="w-5 h-5" />
              </Button>
              <Button
                onClick={sendRecording}
                size="icon"
                variant="default"
                className="rounded-full bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-5 h-5 text-white" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* === Input Bar === */}
      <div className="flex gap-4 items-center">
        <div className="relative flex gap-2 ml-2">
          <div
            ref={ref}
            onClick={() => setIsComponentVisible(!isComponentVisible)}
          >
            {isComponentVisible && (
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={(emojiData) =>
                  setMsgText((prev) => prev + emojiData.emoji)
                }
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  left: "1rem",
                  zIndex: 50,
                  cursor: "pointer",
                }}
              />
            )}
            <Laugh
              className={
                !isComponentVisible
                  ? "text-gray-600 dark:text-gray-400 cursor-pointer"
                  : "text-green-500 dark:text-green-300 cursor-pointer"
              }
              onClick={() => setIsComponentVisible(!isComponentVisible)}
            />
          </div>
          <MediaDropdown />
        </div>

        <form
          className="w-full flex gap-3"
          onSubmit={(e) => handleSendTextMessage(e)}
        >
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message"
              className="py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
          </div>

          <div className="mr-4 flex items-center gap-3">
            {msgText.length > 0 ? (
              <Button
                type="submit"
                size="sm"
                className="bg-transparent text-foreground hover:bg-transparent"
              >
                <Send />
              </Button>
            ) : (
              <>
                {!isRecording && !audioBlob && (
                  <Button
                    onClick={startRecording}
                    type="button"
                    size="icon"
                    variant="default"
                    className="rounded-full bg-green-500 hover:bg-green-600"
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </Button>
                )}
                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="rounded-full"
                  >
                    <Square className="w-5 h-5 text-white" />
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
