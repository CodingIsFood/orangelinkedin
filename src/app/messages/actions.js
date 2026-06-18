'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function startConversation(targetUserId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !targetUserId || user.id === targetUserId) {
    return { error: 'Invalid request' };
  }

  // Check if conversation already exists
  const { data: existingConvo } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
    .single();

  if (existingConvo) {
    redirect(`/messages?id=${existingConvo.id}`);
  }

  // Create new conversation
  const { data: newConvo, error } = await supabase
    .from('conversations')
    .insert({
      user1_id: user.id,
      user2_id: targetUserId
    })
    .select('id')
    .single();

  if (error || !newConvo) {
    console.error('Error starting conversation:', error);
    return { error: 'Failed to start conversation' };
  }

  redirect(`/messages?id=${newConvo.id}`);
}
