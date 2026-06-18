'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create a product' }
  }

  const title = formData.get('title')
  const description = formData.get('description')
  const price = parseFloat(formData.get('price'))
  const category = formData.get('category')
  const coverImage = formData.get('cover_image')
  const digitalFile = formData.get('digital_file')

  if (!title || !description || isNaN(price) || !category) {
    return { error: 'Missing required fields' }
  }

  let coverImageUrl = null
  let fileUrl = null

  // Handle Cover Image Upload
  if (coverImage && coverImage.size > 0) {
    const fileExt = coverImage.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product_images')
      .upload(fileName, coverImage)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return { error: 'Failed to upload cover image' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product_images')
      .getPublicUrl(fileName)
      
    coverImageUrl = publicUrl
  }

  // Handle Digital File Upload
  if (digitalFile && digitalFile.size > 0) {
    const fileExt = digitalFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product_files')
      .upload(fileName, digitalFile)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return { error: 'Failed to upload digital file' }
    }

    // We store the path for private buckets, we will generate signed URLs for downloads
    fileUrl = fileName 
  }

  const tags = formData.get('tags')
  const licenseType = formData.get('license_type')

  const finalDescription = description.trim() + 
    (licenseType ? `\n\n**License:** ${licenseType}` : '') + 
    (tags ? `\n**Tags:** ${tags}` : '')

  const { error } = await supabase
    .from('products')
    .insert({
      creator_id: user.id,
      title: title.trim(),
      description: finalDescription,
      price: price,
      category: category,
      cover_image_url: coverImageUrl,
      file_url: fileUrl,
    })

  if (error) {
    console.error('Error creating product:', error)
    return { error: 'Failed to create product' }
  }

  revalidatePath('/marketplace')
  revalidatePath('/profile')
  return { success: true }
}

export async function buyProduct(productId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // 1. Fetch product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return { error: 'Product not found' }
  }

  if (product.creator_id === user.id) {
    return { error: 'You cannot buy your own product' }
  }

  // 2. Check if already purchased
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existingPurchase) {
    return { error: 'You already own this product' }
  }

  // 3. Fetch buyer's wallet
  const { data: buyerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  if (profileError || !buyerProfile) {
    return { error: 'Failed to get wallet balance' }
  }

  if (buyerProfile.wallet_balance < product.price) {
    return { error: 'Insufficient wallet balance' }
  }

  // 4. Calculate amounts
  const platformFee = product.price * 0.01;
  const sellerEarnings = product.price - platformFee;

  // 5. Execute transaction (Ideally, this should be a DB RPC for atomicity, but doing it sequentially for MVP)
  // Deduct from buyer
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ wallet_balance: buyerProfile.wallet_balance - product.price })
    .eq('id', user.id)

  if (deductError) return { error: 'Transaction failed (deduction)' }

  // Get seller profile to update balance
  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', product.creator_id)
    .single()

  if (sellerProfile) {
    await supabase
      .from('profiles')
      .update({ wallet_balance: Number(sellerProfile.wallet_balance) + sellerEarnings })
      .eq('id', product.creator_id)
  }

  // Record purchase
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      buyer_id: user.id,
      product_id: product.id,
      seller_id: product.creator_id,
      amount_paid: product.price,
      platform_fee: platformFee
    })

  if (purchaseError) {
    console.error('Purchase record failed:', purchaseError)
    // In a real app, we would rollback here if not using RPC.
  }

  revalidatePath('/marketplace')
  revalidatePath(`/marketplace/${productId}`)
  revalidatePath('/profile')
  return { success: true }
}

export async function getDownloadUrl(path) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('product_files').createSignedUrl(path, 60 * 60) // 1 hour
  if (error) {
    return null;
  }
  return data.signedUrl;
}

export async function makeOffer(productId, formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const amount = parseFloat(formData.get('amount'))
  if (!amount || isNaN(amount)) return { error: 'Invalid amount' }

  const { data: product } = await supabase.from('products').select('*').eq('id', productId).single()
  if (!product) return { error: 'Product not found' }

  if (product.creator_id === user.id) return { error: 'Cannot offer on your own product' }

  // Check wallet
  const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
  if (!profile || profile.wallet_balance < amount) return { error: 'Insufficient funds for this offer' }

  const { error } = await supabase.from('offers').insert({
    product_id: product.id,
    buyer_id: user.id,
    seller_id: product.creator_id,
    amount: amount
  })

  if (error) {
    console.error('Error making offer:', error)
    return { error: 'Failed to make offer' }
  }

  // Generate notification for seller
  await supabase.from('notifications').insert({
    user_id: product.creator_id,
    actor_id: user.id,
    type: 'system',
    reference_id: product.id
  })

  revalidatePath(`/marketplace/${productId}`)
  return { success: true }
}
