import { supabaseAdmin } from "@/lib/superbase-admin.server";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  jwt: {
    maxAge: 60 * 60 * 24 * 30, // 30 วัน
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 วัน (ควรเท่ากับ jwt.maxAge)
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const { data: existingUserByGoogleId } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('google_id', account.providerAccountId)
            .single();

          if (existingUserByGoogleId) {
            await supabaseAdmin
              .from('users')
              .update({
                name: user.name,
                avatar_url: user.image,
                last_login: new Date().toISOString()
              })
              .eq('id', existingUserByGoogleId.id);
            
            user.id = existingUserByGoogleId.id;
          } else {
            const { data: existingUserByEmail } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('email', user.email)
              .single();
              
            if (existingUserByEmail) {
              await supabaseAdmin
                .from('users')
                .update({
                  name: user.name || existingUserByEmail.name,
                  google_id: account.providerAccountId,
                  avatar_url: user.image || existingUserByEmail.avatar_url,
                  last_login: new Date().toISOString()
                })
                .eq('id', existingUserByEmail.id);
                
              user.id = existingUserByEmail.id;
            } else {
              const { data: newUser, error } = await supabaseAdmin
                .from('users')
                .insert({
                  name: user.name || 'ผู้ใช้งาน',
                  email: user.email,
                  google_id: account.providerAccountId,
                  avatar_url: user.image,
                  last_login: new Date().toISOString()
                })
                .select()
                .single();

              if (error) {
                console.error('Error creating new user:', error);
                return false;
              }

              if (newUser) {
                user.id = newUser.id;
              }
            }
          }
          
          return true;
        } catch (error) {
          console.error("Database error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        try {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('avatar_url')
            .eq('id', token.sub)
            .single();
            
          if (userData) {
            session.user.avatar_url = userData.avatar_url;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
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
    signIn: '/login',
    error: '/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
