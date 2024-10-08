//validate the id with zod , check authorized access
//check if already friends, check iff is a person on incoming request
//add friend on both sides, remove incoming friend request

import { fetchRedis } from "@/app/helpers/redis";
import { getServerSession } from "next-auth";
import { ZodError, z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedId = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("You are not logged in", {
        status: 401,
      });
    }

    const isAlreadyFriend = await fetchRedis(
      `sismember`,
      `user:${session.user.id}:friends`,
      validatedId.id
    );

    if (isAlreadyFriend) {
      return new NextResponse("You are already friends", {
        status: 401,
      });
    }

    const isIncomingFriendRequest = await fetchRedis(
      `sismember`,
      `user:${session.user.id}:incoming_friend_request`,
      validatedId.id
    );

    if (!isIncomingFriendRequest) {
      return new NextResponse("You have no friend request", {
        status: 401,
      });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis(`get`, `user:${session.user.id}`),
      fetchRedis(`get`, `user:${validatedId.id}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),
      pusherServer.trigger(
        toPusherKey(`user:${validatedId.id}:friends`),
        "new_friend",
        user
      ),
      db.sadd(`user:${validatedId.id}:friends`, session.user.id), //added the id as a friend
      db.sadd(`user:${session.user.id}:friends`, validatedId.id), //added the id as a friend in the current user
      db.srem(
        `user:${session.user.id}:incoming_friend_request`,
        validatedId.id
      ), // removed the incoming request
    ]);

    return new NextResponse("Friend added successfully", {
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
