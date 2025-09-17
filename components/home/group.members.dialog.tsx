import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Participants, useConversationStore } from "@/stores/chat.store";
import { Crown } from "lucide-react";

export default function GroupMembersDialog({ users }: { users: Participants }) {
  const { selectedConversation } = useConversationStore();

  return (
    <Dialog>
      <DialogTrigger>
        <p className="text-xs text-muted-foreground text-left cursor-pointer">
          See members
        </p>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-2">Current Members</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-3 ">
              {users?.map((user) => (
                <div
                  key={user.email}
                  className={`flex gap-3 items-center p-2 rounded`}
                >
                  <Avatar className="overflow-visible">
                    {user.isOnline && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-foreground" />
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-medium">
                        {user.name || user.email.split("@")[0]}
                      </h3>
                      {selectedConversation?.admin === user._id && (
                        <Crown size={16} className="text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
