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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' && user.email) {
          console.log('Google sign in success for:', user.email);

          const nestApiBase = process.env.NEXT_PUBLIC_API_URL;
          if (!nestApiBase) {
            console.error('NEXT_PUBLIC_API_URL is not set');
            // Rather than failing, assign a temporary ID and log the issue
            user.id = `temp-${Date.now()}`;
            return true;
          }

          try {
            // Add timeout and error handling for fetch operations
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
            
            const res = await fetch(
              `${nestApiBase}/users?email=${encodeURIComponent(user.email)}`, 
              { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            
            console.log('GET /users response status:', res.status);
            
            // Handle non-200 status codes without throwing
            let existingUser = null;
            if (res.ok) {
              existingUser = await res.json();
            } else {
              console.log('User not found, will create new user');
            }

            let userId = existingUser?.id;
            // Create user if not found
            if (!userId) {
              try {
                const createController = new AbortController();
                const createTimeoutId = setTimeout(() => createController.abort(), 5000);
                
                const createRes = await fetch(`${nestApiBase}/users`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: user.name || 'Unnamed Google User',
                    email: user.email,
                    avatar_url: user.image,
                  }),
                  signal: createController.signal
                });
                clearTimeout(createTimeoutId);
                
                console.log('POST /users response status:', createRes.status);
                
                if (createRes.ok) {
                  const newUser = await createRes.json();
                  userId = newUser.id;
                  console.log('New user created with ID:', userId);
                } else {
                  // If user creation fails, assign temporary ID to allow login
                  userId = `temp-${Date.now()}`;
                  console.log('Failed to create user, using temporary ID');
                }
              } catch (createError) {
                console.error('Error creating user:', createError);
                // Assign temporary ID to allow login
                userId = `temp-${Date.now()}`;
              }
            }

            // Set user ID for token
            user.id = userId;
            return true;
          } catch (fetchError) {
            console.error('API communication error:', fetchError);
            // Allow login with temp ID even if API calls fail
            user.id = `temp-${Date.now()}`;
            return true;
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn error:', error);
        // Still return true to allow login even with errors
        return true;
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
        console.log('JWT Token:', token);
      }
      return token;
    },
    
    async redirect({ baseUrl }) {
      // หลังจากล็อกอินเสร็จ ให้ redirect ไปที่ /dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
