"use client";

import { chatHrefConstructor } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface SideBarChatsProps {
  friends: User[];
  sessionId: string;
}

const SideBarChats: FC<SideBarChatsProps> = ({ friends, sessionId }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [unseenMessages, setUnseenMessages] = useState<Message[]>();

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
        {friends.sort().map((friend) => {
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
