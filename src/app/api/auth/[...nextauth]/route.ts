import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createSupabaseServerClient } from "../../_libs/supabaseServerClient";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Properly await the supabase client
          const supabase = await createSupabaseServerClient();
          
          // Check if user exists in Supabase
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Database error:", error);
            return false;
          }

          let userId = existingUser?.id;

          // Create new user if doesn't exist
          if (!existingUser) {
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({
                name: user.name || "ผู้ใช้งาน",
                email: user.email,
                avatar_url: user.image,
                created_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating user:", insertError);
              return false;
            }

            userId = newUser.id;
          }

          user.id = userId;
          return true;
        } catch (error) {
          console.error("SignIn error:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };