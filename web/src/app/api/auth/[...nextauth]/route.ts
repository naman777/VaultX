import { authOptions } from "@/lib/authOptions";
import NextAuth, { NextAuthOptions } from "next-auth";




const handler = NextAuth(authOptions);

// Export handlers for Next.js API routes
export { handler as GET, handler as POST };
