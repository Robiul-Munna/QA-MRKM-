import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Replace with your user validation logic
        if (credentials.username === "admin" && credentials.password === "admin") {
          return { id: 1, name: "Admin User", role: "admin" };
        }
        if (credentials.username === "tester" && credentials.password === "tester") {
          return { id: 2, name: "QA Tester", role: "tester" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Attach role to session
      session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin"
  }
});
