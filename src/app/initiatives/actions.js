'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInitiative(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in' }
  }

  // Verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', user.id)
    .single();

  if (profile?.account_type !== 'government' && profile?.account_type !== 'institution') {
    return { error: 'Unauthorized. Only Governments and Institutions can create initiatives.' }
  }

  const title = formData.get('title')
  const description = formData.get('description')
  const category = formData.get('category')
  const deadline = formData.get('deadline') || null
  const externalLink = formData.get('external_link') || null

  if (!title || !description || !category) {
    return { error: 'Missing required fields' }
  }

  // NOTE: If the user hasn't run the Phase 2 SQL migrations yet, this will fail.
  // We handle the error gracefully here.
  const { error } = await supabase
    .from('initiatives')
    .insert({
      creator_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: category,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      external_link: externalLink ? externalLink.trim() : null
    })

  if (error) {
    console.error('Error creating initiative:', error)
    if (error.code === '42P01') {
       return { error: 'Database table not found. Please ask the administrator to run the Phase 2 SQL script.' }
    }
    return { error: 'Failed to create initiative' }
  }

  revalidatePath('/initiatives')
  return { success: true }
}

export async function submitApplication(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in' };
  }

  const initiative_id = formData.get('initiative_id');
  const cover_letter = formData.get('cover_letter');
  const portfolio_link = formData.get('portfolio_link');

  if (!initiative_id || !cover_letter) {
    return { error: 'Missing required fields' };
  }

  const { error } = await supabase
    .from('initiative_applications')
    .insert({
      initiative_id,
      applicant_id: user.id,
      cover_letter,
      portfolio_link
    });

  if (error) {
    console.error('Error submitting application:', error);
    return { error: 'Failed to submit application' };
  }

  const { redirect } = await import('next/navigation');
  redirect('/initiatives?success=true');
}
