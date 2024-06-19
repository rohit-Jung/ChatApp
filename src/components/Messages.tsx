"use client";

import { cn, toPusherKey } from "@/lib/utils";
import { Message } from "@/lib/validations/messageValidator";
import { FC, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  chatPartnerImg: string;
  sessionImg: string;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  chatId,
  sessionId,
  chatPartnerImg,
  sessionImg,
}) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const handleIncomingMessage = (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming_message", handleIncomingMessage);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming_message", handleIncomingMessage);
    };
  }, [chatId]);

  // console.log(chatPartnerImg, sessionImg);
  const formattedTimeStamp = (timeStamp: number) => {
    return format(timeStamp, "HH:mm");
  };

  return (
    <>
      <div
        id="messages"
        className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
      >
        <div ref={scrollDownRef} />
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === sessionId;
          const hasNextMessage =
            messages[index - 1]?.senderId === messages[index].senderId;

          return (
            <div id="chat-message" key={`${message.id}-${message.timestamp}`}>
              <div
                className={cn("flex items-end", {
                  "justify-end": isCurrentUser,
                })}
              >
                <div
                  className={cn(
                    "flex flex-col space-y-2 text-base mx-2 max-w-xs",
                    {
                      "order-1 items-end": isCurrentUser,
                      "order-2 items-start": !isCurrentUser,
                    }
                  )}
                >
                  <span
                    className={cn("px-4 py-2 rounded-lg inline-block", {
                      " bg-indigo-600 text-white ": isCurrentUser,
                      "bg-gray-200 text-gray-900": !isCurrentUser,
                      "rounded-br-none": !hasNextMessage && isCurrentUser,
                      "rounded-bl-none": !hasNextMessage && !isCurrentUser,
                    })}
                  >
                    {message.text}{" "}
                    <span className="ml-2 text-xs text-gray-400">
                      {formattedTimeStamp(message.timestamp)}
                    </span>
                  </span>
                </div>

                <div
                  className={cn(
                    "relative overflow-hidden rounded-full size-6",
                    {
                      "order-2": isCurrentUser,
                      "order-1": !isCurrentUser,
                      invisible: hasNextMessage,
                    }
                  )}
                >
                  <Image
                    fill
                    src={
                      isCurrentUser
                        ? (sessionImg as string)
                        : (chatPartnerImg as string)
                    }
                    alt={`${
                      isCurrentUser
                        ? (sessionImg as string)
                        : (chatPartnerImg as string)
                    }`}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Messages;
