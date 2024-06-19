import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { fetchRedis } from "@/app/helpers/redis";
import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { messageArrayValidator } from "@/lib/validations/messageValidator";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
  params: {
    chatId: string;
  };
}

const getChatMessages = async (chatId: string) => {
  try {
    const results: string[] = await fetchRedis(
      `zrange`,
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessagesJson = results.map((message: string) =>
      JSON.parse(message)
    ) as Message[];

    const reversedMessages = dbMessagesJson.reverse();

    const validatedMessages = messageArrayValidator.parse(reversedMessages);
    return validatedMessages;
  } catch (error) {
    console.log("Error", error);
    notFound();
  }
};

const page: FC<pageProps> = async ({ params }) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  // console.log("Is chat id changing ? ");

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartnerRaw = await fetchRedis(`get`, `user:${chatPartnerId}`);
  const chatPartner = JSON.parse(chatPartnerRaw) as User;

  const initialMessages = await getChatMessages(chatId);

  return (
    <>
      <div className="flex flex-1 justify-between flex-col h-full  max-h-[calc(100vh-6rem)] ">
        <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 ">
          <div className="relative flex items-center space-x-4">
            <div className="relative">
              <div className="imageContainer relative w-8 sm:w-12 h-8 sm:h-12">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  src={chatPartner.image}
                  alt={chatPartner.name + "image"}
                  className="rounded-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col leading-tight">
              <div className="text-xl flex items-center">
                <span className="text-gray-700 mr-3 font-semibold">
                  {chatPartner.name}
                </span>
              </div>

              <div className="text-sm text-gray-700">{chatPartner.email}</div>
            </div>
          </div>
        </div>
        <Messages
          chatId={chatId}
          initialMessages={initialMessages}
          sessionId={session.user.id}
          chatPartnerImg={chatPartner.image}
          sessionImg={session.user.image!}
        />
        <ChatInput chatId={chatId} chatPartner={chatPartner} />
      </div>
    </>
  );
};

export default page;
