'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function submitTicket(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const issueType = formData.get('issueType');
  const priority = formData.get('priority');
  const subject = formData.get('subject');
  const description = formData.get('description');

  if (!user) {
    redirect('/login');
  }
  
  await supabase.from('support_tickets').insert({
    user_id: user.id,
    issue_type: issueType,
    priority: priority,
    subject: subject,
    description: description,
    status: 'open'
  });

  // Redirect to the support page with a success parameter
  redirect('/support?success=true');
}
