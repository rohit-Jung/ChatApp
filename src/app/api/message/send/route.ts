import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { fetchRedis } from "@/app/helpers/redis";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { messageValidator } from "@/lib/validations/messageValidator";
import { ZodError } from "zod";
export async function POST(req: Request) {
  try {
    const { text, chatId } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });
    const { user } = session;

    const [userId1, userId2] = chatId.split("--");

    if (user.id !== userId1 && user.id !== userId2) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const friendId = user.id === userId1 ? userId2 : userId1;

    const friends = (await fetchRedis(
      "smembers",
      `user:${user.id}:friends`
    )) as string[];

    const isFriend = friends.includes(friendId);
    if (!isFriend) {
      return new NextResponse("Not a friend", { status: 400 });
    }

    // const senderInfo = (await fetchRedis(`get`, `user:${user.id}`)) as string;
    // const parsedSenderInfo = JSON.parse(senderInfo) as User;

    const receiverInfo = (await fetchRedis(
      `get`,
      `user:${friendId}`
    )) as string;
    const parsedReceiverInfo = JSON.parse(receiverInfo) as User;

    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: user.id,
      receiverId: parsedReceiverInfo.id,
      text,
      timestamp,
    };

    const message = messageValidator.parse(messageData);

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new NextResponse("Message sent successfully", { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid credentials", {
        status: 400,
      });
    }
    console.log("Error Sending Message", error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
}
