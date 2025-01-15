import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs"; // Ensure you hash passwords before saving
import prisma from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        console.log(credentials)

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: username,
            },
          });

          if (user && (await compare(password, user.password))) {
            return { id: user.id.toString(), email: user.email };
          }
        } catch (error) {
            return null;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/signin", // Custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Session will last 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
});

export {handler as GET, handler as POST};