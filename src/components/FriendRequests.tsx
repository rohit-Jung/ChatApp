"use client";

import axios from "axios";
import { AwardIcon, Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
}) => {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  const router = useRouter();

  const acceptFriendRequest = async (senderId: string) => {
    try {
      const response = await axios.post(`/api/friends/accept`, {
        id: senderId,
      });

      setFriendRequests(
        friendRequests.filter((request) => request.senderId !== senderId)
      );

      toast.success("Successfully accepted friend request");

      router.refresh();
    } catch (error) {
      console.log("Error accepting friend request", error);

      toast.error("Error accepting friend request");
    }
  };

  const denyFriendRequest = async (senderId: string) => {
    try {
      const response = await axios.post(`/api/friends/deny`, { id: senderId });
      setFriendRequests(
        friendRequests.filter((request) => request.senderId !== senderId)
      );
      toast.success("Successfully denied friend request");


      router.refresh();
    } catch (error) {
      console.log("Error denying friend request", error);
      toast.error("Error denying friend request");
    }
  };

  // console.log(incomingFriendRequests);
  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here ...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              aria-label="accept friend"
              className="size-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => acceptFriendRequest(request.senderId)}
            >
              <Check className="font-semibold text-white size-3/4" />
            </button>
            <button
              aria-label="deny friend"
              className="size-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              onClick={() => denyFriendRequest(request.senderId)}
            >
              <X className="font-semibold text-white size-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
