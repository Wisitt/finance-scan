import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createSupabaseServerClient } from "../../_libs/supabaseServerClient";

// สร้าง authOptions สำหรับ NextAuth.js
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          console.log("Google sign in success for:", user.email);

          const supabase = await createSupabaseServerClient();
          
          // Check if user exists
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
            console.log("Creating new user:", user.email);
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
            console.log("New user created with ID:", userId);
          }

          user.id = userId;
          return true;
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
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

    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect called:", { url, baseUrl });
      
      // ถ้าเป็น URL ภายนอก ให้กลับไปที่ baseUrl
      if (!url.startsWith(baseUrl) && !url.startsWith('/')) {
        return baseUrl;
      }

      // กรณีหลังจาก login สำเร็จ ให้ไปที่ dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: true, // เปิด debug mode
};

// สร้าง handler
const handler = NextAuth(authOptions);

// สำหรับ App Router
export { handler as GET, handler as POST };