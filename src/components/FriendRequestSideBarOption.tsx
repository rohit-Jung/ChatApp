"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

interface FriendRequestSideBarOptionProps {
  initialFriendRequestCount: number;
  sessionId: string;
}

const FriendRequestSideBarOption: FC<FriendRequestSideBarOptionProps> = ({
  initialFriendRequestCount,
  sessionId,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState(
    initialFriendRequestCount
  );
  // console.log(initialFriendRequestCount);
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_request`)
    );
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const handleNewFriend = () => {
      setUnseenRequestCount((prev) => prev - 1);
    };

    const handleDenyRequest = () => {
      console.log("Request denied");
      setUnseenRequestCount((prev) => prev - 1);
    };

    const handleIncomingFriendRequest = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };
    pusherClient.bind("incoming_friend_request", handleIncomingFriendRequest);
    pusherClient.bind("new_friend", handleNewFriend);
    pusherClient.bind("deny_request", handleDenyRequest);

    //flush the event
    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_request`)
      );
      pusherClient.unbind(
        "incoming_friend_request",
        handleIncomingFriendRequest
      );
      pusherClient.unbind("new_friend", handleNewFriend);
      pusherClient.unbind("deny_request", handleDenyRequest);
    };
  }, [sessionId]);

  return (
    <>
      <Link
        href={"/dashboard/requests"}
        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
      >
        <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex size-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
          <User className="size-4" />
        </span>

        <span className="truncate">Friend Requests</span>

        {unseenRequestCount > 0 ? (
          <div className="size-5 rounded-full text-xs flex justify-center items-center text-white bg-indigo-600">
            {unseenRequestCount}
          </div>
        ) : null}
      </Link>
    </>
  );
};

export default FriendRequestSideBarOption;
