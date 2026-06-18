'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create a post')
  }

  const content = formData.get('content')
  const image = formData.get('image') // Now expecting a File object

  if (!content || content.trim() === '') {
    return { error: 'Post content cannot be empty' }
  }

  let imageUrl = null

  // Handle image upload if a file was selected
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post_images')
      .upload(fileName, image)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { error: 'Failed to upload image' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post_images')
      .getPublicUrl(fileName)
      
    imageUrl = publicUrl
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: content.trim(),
      image_url: imageUrl,
    })

  if (error) {
    console.error('Error creating post:', error)
    return { error: 'Failed to create post' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function likePost(postId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('likes')
    .insert({ user_id: user.id, post_id: postId })

  if (error) {
    console.error('Error liking post:', error)
    return { error: 'Failed to like post' }
  }

  // Generate Notification
  const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single()
  if (post && post.author_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: post.author_id,
      actor_id: user.id,
      type: 'like',
      reference_id: postId
    })
  }

  revalidatePath('/')
  return { success: true }
}

export async function unlikePost(postId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('likes')
    .delete()
    .match({ user_id: user.id, post_id: postId })

  if (error) {
    console.error('Error unliking post:', error)
    return { error: 'Failed to unlike post' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function addComment(postId, content) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  if (!content || content.trim() === '') return { error: 'Comment cannot be empty' }

  const { error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      post_id: postId,
      content: content.trim()
    })

  if (error) {
    console.error('Error adding comment:', error)
    return { error: 'Failed to add comment' }
  }

  // Generate Notification
  const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).single()
  if (post && post.author_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: post.author_id,
      actor_id: user.id,
      type: 'comment',
      reference_id: postId
    })
  }

  revalidatePath('/')
  return { success: true }
}
