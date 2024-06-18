import { db } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/app/helpers/redis";

function getGoogleClientDetails() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("GOOGLE_CLIENT_ID is required");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("GOOGLE_CLIENT_SECRET is required");
  }

  return {
    clientId,
    clientSecret,
  };
}
export const authOptions: NextAuthOptions = {
  //code
  adapter: UpstashRedisAdapter(db),

  providers: [
    GoogleProvider({
      clientId: getGoogleClientDetails().clientId,
      clientSecret: getGoogleClientDetails().clientSecret,
    }),
  ],

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ user, token }) {
      const dbUserResult = (await fetchRedis(`get`, `user:${token.id}`)) as
        | string
        | null;

      if (!dbUserResult) {
        token.id = user!.id;
        return token;
      }

      const dbUser = JSON.parse(dbUserResult) as User;

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }

      return session;
    },

    redirect() {
      return "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
