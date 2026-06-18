import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export const metadata = {
  title: 'Messages | Orangeeconomy.ng'
};

export default async function MessagesPage({ searchParams }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all conversations for the user
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
  }

  // Fetch partner profiles manually
  const formattedConvos = [];
  if (conversations && conversations.length > 0) {
    const partnerIds = conversations.map(c => c.user1_id === user.id ? c.user2_id : c.user1_id);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, title')
      .in('id', partnerIds);

    for (const convo of conversations) {
      const isUser1 = convo.user1_id === user.id;
      const partnerId = isUser1 ? convo.user2_id : convo.user1_id;
      const partnerProfile = profiles?.find(p => p.id === partnerId);
      
      formattedConvos.push({
        id: convo.id,
        partner: partnerProfile || { id: partnerId, name: 'Unknown User' },
        updated_at: convo.updated_at
      });
    }
  }

  return (
    <main className="container page-layout" style={{ paddingTop: '7rem', paddingBottom: '0', height: '90vh', display: 'flex', flexDirection: 'column', gridTemplateColumns: '1fr' }}>
      <ChatInterface initialConversations={formattedConvos} currentUser={user} selectedConvoId={searchParams?.id} />
    </main>
  );
}
