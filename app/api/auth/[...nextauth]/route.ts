import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Optional: Customize pages if you want, but default is fine for now
  pages: {
    signIn: '/auth/signin', // We will build a custom page later if needed
  },
  callbacks: {
    async session({ session, token }) {
      // Add the user's ID to the session so we can identify them in the DB
      // @ts-ignore
      session.user.id = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };