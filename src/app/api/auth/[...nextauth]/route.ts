import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log('🪪 Google account:', account);
      console.log('👤 User:', user);
      try {
        if (account?.provider !== 'google' || !user.email) {
          return false;
        }

        const nestApiBase = process.env.NEXT_PUBLIC_API_URL;
        if (!nestApiBase) {
          console.error('❌ NEXT_PUBLIC_API_URL not set');
          return false;
        }

        const email = encodeURIComponent(user.email);

        // Check existing user
        let userId: string | undefined;
        try {
          const res = await fetch(`${nestApiBase}/users?email=${email}`);
          if (res.ok) {
            const existingUser = await res.json();
            if (existingUser?.id) {
              userId = existingUser.id;
              console.log('✅ Existing user found:', userId);
            }
          }
        } catch (err) {
          console.error('❌ Error fetching user:', err);
        }

        // Create user if not found
        if (!userId) {
          try {
            const googleId = account?.providerAccountId;

            const createRes = await fetch(`${nestApiBase}/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: user.name || 'Unnamed Google User',
                email: user.email,
                avatar_url: user.image,
                google_id: googleId,
                last_login: new Date().toISOString(),
              }),
            });

            if (createRes.ok) {
              const newUser = await createRes.json();
              userId = newUser.id;
              console.log('✅ New user created:', userId);
            } else {
              console.error('❌ Failed to create user:', await createRes.text());
              return false;
            }
          } catch (err) {
            console.error('❌ Error creating user:', err);
            return false;
          }
        }

        if (!userId) {
          console.error('❌ No user ID obtained');
          return false;
        }

        // Set user ID for JWT
        user.id = userId;
        return true;
      } catch (error) {
        console.error('❌ signIn callback error:', error);
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
        console.log('🔐 JWT Token set with ID:', token.sub);
      }
      return token;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/',
    error: '/error',
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
