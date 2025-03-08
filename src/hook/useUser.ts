// import { supabase } from '@/lib/supabase';
// import { User } from '@/types';
// import { useSession } from 'next-auth/react';
// import { useEffect, useState } from 'react';


// export function useUser() {
//   const { data: session, status } = useSession();
//   const [userData, setUserData] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     async function fetchUserData() {
//       if (status === 'authenticated' && session?.user?.id) {
//         try {
//           const { data } = await supabase
//             .from('users')
//             .select('*')
//             .eq('id', session.user.id)
//             .single();

//           if (data) setUserData(data as User);
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       } else if (status === 'unauthenticated') {
//         setUserData(null);
//         setIsLoading(false);
//       }
//     }

//     fetchUserData();
//   }, [session, status]);

//   return { 
//     user: userData, 
//     session, 
//     status, 
//     isLoading
//   };
// }