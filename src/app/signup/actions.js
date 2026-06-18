'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData) {
  const supabase = createClient()
  
  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('fullName')
  const accountType = formData.get('accountType') || 'creative'
  const stateRepresented = formData.get('stateRepresented') || null
  const nin = formData.get('nin') || null

  // To provide a default avatar based on initials
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=FF6B00&color=fff`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        avatar_url: avatarUrl,
        account_type: accountType,
        state_represented: stateRepresented,
      }
    }
  })

  // Give new users a default wallet balance of 1000
  if (data?.user?.id) {
    const isVerified = ['institution', 'agency', 'government'].includes(accountType);
    
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const updateData = { wallet_balance: 1000, is_verified: isVerified };
    if (nin) updateData.nin = nin;

    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updateData)
    });
  }

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  // Next.js routing will handle redirecting the user or showing a success message
  redirect('/signup?message=Check your email to continue sign in process')
}
