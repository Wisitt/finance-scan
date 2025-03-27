
// import NextAuth, { NextAuthOptions } from 'next-auth';
// import GoogleProvider from 'next-auth/providers/google';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   callbacks: {
//     async signIn({ user, account }) {
//       try {
//         if (account?.provider === 'google' && user.email) {
//           console.log('Google sign in success for:', user.email);

//           // 1) เรียก Nest API เช็ค user by email
//           const nestApiBase = process.env.NEXT_PUBLIC_NEST_API_URL;
//           const checkRes = await fetch(`${nestApiBase}/users?email=${user.email}`);
//           if (!checkRes.ok) {
//             console.error('Check user by email failed:', checkRes.status);
//             return false;
//           }
//           const existingUser = await checkRes.json(); // อาจเป็น null ถ้าไม่เจอ

//           let userId = existingUser?.id;

//           // 2) ถ้าไม่เจอ user => POST /users เพื่อสร้างใหม่
//           if (!userId) {
//             const createRes = await fetch(`${nestApiBase}/users`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 name: user.name || 'Unnamed Google User',
//                 email: user.email,
//                 avatar_url: user.image,
//               }),
//             });
//             if (!createRes.ok) {
//               console.error('Error creating user:', createRes.status);
//               return false;
//             }
//             const newUser = await createRes.json();
//             userId = newUser.id;
//             console.log('New user created with ID:', userId);
//           }

//           // ใส่ userId ลงใน user object (NextAuth จะนำไปใส่ใน token.sub)
//           user.id = userId;
//           return true;
//         }
//         // กรณี provider อื่นๆ
//         return true;
//       } catch (error) {
//         console.error('SignIn error:', error);
//         return false;
//       }
//     },

//     async session({ session, token }) {
//       if (session.user && token.sub) {
//         session.user.id = token.sub;
//       }
//       return session;
//     },

//     async jwt({ token, user }) {
//       if (user) {
//         token.sub = user.id;
//       }
//       return token;
//     },

//     async redirect({ url, baseUrl }) {
//       if (!url.startsWith(baseUrl) && !url.startsWith('/')) {
//         return baseUrl;
//       }
//       return `${baseUrl}/dashboard`;
//     },
//   },
//   pages: {
//     signIn: '/login',
//     error: '/error',
//   },
//   debug: true,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
