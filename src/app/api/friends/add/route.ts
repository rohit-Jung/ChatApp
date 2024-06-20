//extract email validate email, fetch the request to redis and find the user
//check the user is logged in
// check if the user exists check if the user is itself
//check if the user is already a friend
// trigger and add to database if everything is fine

import { fetchRedis } from "@/app/helpers/redis";
import { addFriendValidator } from "@/lib/validations/addFriendValidator";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { authOptions } from "../../auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const validatedEmailToAdd = addFriendValidator.parse(email);

    const friendId = (await fetchRedis(
      `get`,
      `user:email:${validatedEmailToAdd.email}`
    )) as string;

    // console.log(validatedEmailToAdd);
    if (!friendId) {
      return new NextResponse("User not found", {
        status: 400,
      });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("You are not logged in", {
        status: 401,
      });
    }

    if (friendId === session.user.id) {
      return new NextResponse("You can't add yourself as a friend", {
        status: 401,
      });
    }

    const alreadyAdded = (await fetchRedis(
      `sismember`,
      `user:${friendId}:incoming_friend_request`,
      session.user.id
    )) as 0 | 1;

    if (alreadyAdded) {
      return new NextResponse("Already added as a friend", {
        status: 400,
      });
    }

    const isFriend = (await fetchRedis(
      `sismember`,
      `user:${session.user.id}:friends`,
      friendId
    )) as 0 | 1;

    if (isFriend) {
      return new NextResponse("Already added as a friend", { status: 400 });
    }

    //valid request add the friend
    //trigger the event to pusher Server for realtime notification
    console.log("message channel triggered");

    await pusherServer.trigger(
      toPusherKey(`user:${friendId}:incoming_friend_request`),
      "incoming_friend_request",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    await db.sadd(`user:${friendId}:incoming_friend_request`, session.user.id);

    return new NextResponse("Friend request sent", {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid credentials", {
        status: 400,
      });
    }
    return new NextResponse("Something went wrong while adding friend", {
      status: 500,
    });
  }
}
