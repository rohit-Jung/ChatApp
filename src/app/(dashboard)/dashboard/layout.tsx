import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getFriendsByUserId } from "@/app/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/app/helpers/redis";
import FriendRequestSideBarOption from "@/components/FriendRequestSideBarOption";
import MobilePanel from "@/components/MobilePanel";
import SideBarChats from "@/components/SideBarChats";
import SignOutButton from "@/components/SignOutButton";
import { Icon, Icons } from "../../../components/icons";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface layoutProps {
  children: ReactNode;
}
interface sideBarOptionsProps {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const sideBarOptions: sideBarOptionsProps[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const layout: FC<layoutProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const unseenRequestCount = (
    (await fetchRedis(
      `smembers`,
      `user:${session.user.id}:incoming_friend_request`
    )) as User[]
  ).length;

  return (
    <>
      <div className="w-full flex h-screen">
        <div className="md:hidden">
          <MobilePanel
            friends={friends}
            session={session}
            sidebarOptions={sideBarOptions}
            unseenRequestCount={unseenRequestCount}
          />
        </div>
        <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <Link className="flex h-16 shrink-0 items-center" href={"/dashboard"}>
            <Icons.Logo className="h-8 w-auto text-indigo-600" />
          </Link>

          {friends.length > 0 && (
            <div className="text-xs font-semibold leading-6 text-gray-400">
              Your Chats
            </div>
          )}

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <SideBarChats friends={friends} sessionId={session.user.id} />
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">
                  Overview
                </div>

                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {sideBarOptions.map((option) => {
                    const Icon = Icons[option.Icon];
                    return (
                      <li key={option.id}>
                        <Link
                          href={option.href}
                          className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                          <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex size-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                            <Icon className="size-4" />
                          </span>

                          <span className="truncate">{option.name}</span>
                        </Link>
                      </li>
                    );
                  })}

                  <li>
                    <FriendRequestSideBarOption
                      initialFriendRequestCount={unseenRequestCount}
                      sessionId={session.user.id}
                    />
                  </li>
                </ul>
              </li>

              <li className="-mx-6 mt-auto flex items-center">
                <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="relative size-8 bg-gray-50">
                    <Image
                      fill
                      referrerPolicy="no-referrer"
                      className="rounded-full"
                      src={session.user.image || ""}
                      alt="ProfiePicture"
                    />
                  </div>
                  <span className="sr-only">Your Profile</span>
                  <div className="flex flex-col">
                    <span aria-hidden="true">{session.user.name}</span>
                    <span
                      className="text-xs text-zinc-400 truncate w-36"
                      aria-hidden="true"
                    >
                      {session.user.email}
                    </span>
                  </div>
                </div>

                <SignOutButton className="h-full aspect-square" />
              </li>
            </ul>
          </nav>
        </div>
        {children}
      </div>
    </>
  );
};

export default layout;
