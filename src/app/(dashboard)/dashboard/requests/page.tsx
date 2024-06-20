import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { fetchRedis } from "@/app/helpers/redis";
import FriendRequests from "@/components/FriendRequests";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

interface RequestsProps {}

const Requests: FC<RequestsProps> = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const requestIds = (await fetchRedis(
    `smembers`,
    `user:${session.user.id}:incoming_friend_request`
  )) as string[];

  const requestIndividuals = await Promise.all(
    requestIds.map(async (id) => {
      const userJSON = (await fetchRedis(`get`, `user:${id}`)) as string;
      const user = JSON.parse(userJSON) as User;
      // console.log(user.email);
      return {
        senderId: id,
        senderEmail: user.email,
      };
    })
  );
  return (
    <>
      <main className="pt-8 px-10 ml-2">
        <h1 className="font-bold text-5xl mb-8">Friend Requests</h1>
        <div className="flex flex-col gap-4">
          <FriendRequests
            incomingFriendRequests={requestIndividuals}
            sessionId={session.user.id}
          />
        </div>
      </main>
    </>
  );
};

export default Requests;
