"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { IncomingMessage } from "http";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SideBarChatsProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SideBarChats: FC<SideBarChatsProps> = ({ friends, sessionId }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const handleNewChat = (message: ExtendedMessage) => {
      console.log("New message: " + message);
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      toast(`New message from ${message.senderName.toLowerCase()}`);

      setUnseenMessages((prev) => [...prev, message]);
    };

    const handleNewAddedFriend = (user: User) => {
      console.log("Added user: " + user);

      setActiveChats((prev) => [...prev, user]);
    };

    pusherClient.bind(`new_friend`, handleNewAddedFriend);
    pusherClient.bind(`new_chat`, handleNewChat);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind(`new_friend`, handleNewAddedFriend);
      pusherClient.unbind(`new_chats`, handleNewChat);
    };
  }, [sessionId, router, pathname]);

  console.log("Active chats are", activeChats);

  useEffect(() => {
    if (pathname.includes("chat")) {
      setUnseenMessages((prev) =>
        prev?.filter((message) => !pathname.includes(message.senderId))
      );
    }
  }, [pathname]);

  return (
    <>
      <ul role="list" className="overflow-y-auto -mx-2 space-y-1 max-h-[25rem]">
        {activeChats.sort().map((friend) => {
          const unseenMessageCount = unseenMessages?.filter((unseenMsg) => {
            return unseenMsg.senderId === friend.id;
          }).length;

          return (
            <li key={friend.id}>
              {/* anchor tag for hard reload */}
              <a
                href={`/dashboard/chat/${chatHrefConstructor(
                  sessionId,
                  friend.id
                )}`}
                className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
              >
                {friend.name}
                {unseenMessageCount! > 0 && (
                  <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                    {unseenMessageCount}
                  </div>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default SideBarChats;
