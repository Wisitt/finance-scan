import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  console.log("🔍 Session Debug:", session);

  if (!session || !session.user) {
    return { user: null, error: 'Unauthorized' };
  }

  return { user: session.user, error: null };
}