import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Orangeeconomy.ng | Ecosystem for Nigerian Creatives, Institutions & Government',
  description: 'The comprehensive ecosystem connecting Nigerian creatives with institutions, government MDAs, and global opportunities.',
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin, wallet_balance')
      .eq('id', user.id)
      .single();
    profile = data;
    if (profile?.is_admin) {
      isAdmin = true;
    }
  }

  let unreadNotifications = 0;
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    unreadNotifications = count || 0;
  }

  return (
    <html lang="en">
      <body>
        <Navbar user={user} isAdmin={isAdmin} walletBalance={profile?.wallet_balance || 0} unreadNotifications={unreadNotifications} />
        {children}
      </body>
    </html>
  );
}
