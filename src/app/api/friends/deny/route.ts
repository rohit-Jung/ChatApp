//validate the id, if it exists
//check for session and remove the id from the db

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
    const validatedIdToDelete = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("You are not logged in", {
        status: 401,
      });
    }

    if (validatedIdToDelete.id === session.user.id) {
      return new NextResponse("You can't delete yourself as a friend", {
        status: 401,
      });
    }

    //trigger the deny reqyest
   await pusherServer.trigger(
      toPusherKey(`user:${session.user.id}:incoming_friend_request`),
      "deny_request",
      validatedIdToDelete.id
    );

    db.srem(
      `user:${session.user.id}:incoming_friend_request`,
      validatedIdToDelete.id
    );

    return new NextResponse("Request deleted successfully", {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid Credentials", {
        status: 400,
      });
    }
    return new NextResponse("Something went wrong while deleting request", {
      status: 500,
    });
  }
}
