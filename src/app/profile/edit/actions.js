'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = formData.get('name')
  const title = formData.get('title')
  const location = formData.get('location')
  const bio = formData.get('bio')
  const avatar = formData.get('avatar')
  const skillsString = formData.get('skills')
  
  let skills = []
  if (skillsString) {
    skills = skillsString.split(',').map(s => s.trim()).filter(Boolean)
  }

  let avatarUrl = undefined

  // Handle avatar upload if a file was selected
  if (avatar && avatar.size > 0) {
    const fileExt = avatar.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatar)

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      redirect('/profile/edit?error=' + encodeURIComponent('Failed to upload profile image'))
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
      
    avatarUrl = publicUrl
  }

  const updatePayload = {
    name,
    title,
    location,
    bio,
    skills,
    updated_at: new Date().toISOString(),
  }

  if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) {
    // We can redirect back to edit page with an error, or throw
    redirect('/profile/edit?error=' + encodeURIComponent(error.message))
  }

  // Revalidate the profile page to show the new data
  revalidatePath('/profile')
  // Redirect back to profile page
  redirect('/profile')
}
