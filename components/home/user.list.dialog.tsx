import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ImageIcon, Loader, MessageSquareDiff } from "lucide-react";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import toast from "react-hot-toast";
import { useConversationStore } from "@/stores/chat.store";
export default function UserListDialog({
  dialogOpen,
  setDialogOpen,
}: {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}) {
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [renderedImage, setRenderedImage] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);

  const convex = useConvex();
  const createConversation = useMutation(api.conversations.createConversation);
  const generateUploadUrl = useMutation(api.conversations.generateUploadUrl);
  const me = useQuery(api.users.getMe);
  const users = useQuery(api.users.getUsers);

  const { setSelectedConversation } = useConversationStore();

  const handleCreateConverstaion = async () => {
    if (selectedUsers.length === 0) return;
    setIsLoading(true);
    try {
      const isGroup = selectedUsers.length > 1;

      let conversationId;

      if (!isGroup) {
        conversationId = await createConversation({
          participants: [...selectedUsers, me?._id!],
          isGroup,
        });
      } else {
        const postUrl = await generateUploadUrl();

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage?.type! },
          body: selectedImage,
        });

        const { storageId } = await result.json();

        conversationId = await createConversation({
          participants: [...selectedUsers, me?._id!],
          isGroup,
          admin: me?._id!,
          groupName,
          groupImage: storageId,
        });
      }
      try {
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
        throw error;
      }
      setSelectedUsers([]);
      setDialogOpen(false);
      setGroupName("");
      setSelectedImage(null);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedImage || selectedUsers.length < 2) {
      setRenderedImage("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setRenderedImage(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage, selectedUsers]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <MessageSquareDiff size={20} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {/* TODO: <DialogClose /> will be here */}
          {/* <DialogClose /> */}
          <DialogTitle>USERS</DialogTitle>
        </DialogHeader>

        <DialogDescription>Start a new chat</DialogDescription>
        {renderedImage && (
          <div className="w-16 h-16 relative mx-auto">
            <Image
              src={renderedImage}
              fill
              alt="user image"
              className="rounded-full object-cover"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={imgRef}
          onChange={(e) => {
            setSelectedImage(e.target.files?.[0] || null);
          }}
          hidden
        />
        {selectedUsers.length > 1 && (
          <>
            <Input
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button
              className="flex gap-2"
              onClick={() => imgRef.current?.click()}
            >
              <ImageIcon size={20} />
              Group Image
            </Button>
          </>
        )}
        <div className="flex flex-col gap-3 overflow-auto max-h-60">
          {users?.map((user) => (
            <div
              key={user._id}
              className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 
								transition-all ease-in-out duration-300
							${selectedUsers.includes(user._id) ? "bg-[#00a884]" : ""}`}
              onClick={() => {
                if (selectedUsers.includes(user._id)) {
                  setSelectedUsers(
                    selectedUsers.filter((id) => id !== user._id)
                  );
                } else {
                  setSelectedUsers([...selectedUsers, user._id]);
                }
              }}
            >
              <Avatar className="overflow-visible">
                {user.isOnline && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground" />
                )}

                <AvatarImage
                  src={user.image}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>
                  <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
                </AvatarFallback>
              </Avatar>

              <div className="w-full ">
                <div className="flex items-center justify-between">
                  <p className="text-md font-medium">
                    {user.name || user.email.split("@")[0]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant={"outline"} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              selectedUsers.length === 0 ||
              (selectedUsers.length > 1 && !groupName) ||
              isLoading
            }
            onClick={() => handleCreateConverstaion()}
          >
            {/* spinner */}
            {isLoading ? <Loader className="animate-spin" /> : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
