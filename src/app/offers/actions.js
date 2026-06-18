'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptOffer(offerId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Fetch offer and product
  const { data: offer } = await supabase.from('offers').select('*, products(id, price)').eq('id', offerId).single()
  if (!offer || offer.seller_id !== user.id) return { error: 'Offer not found or unauthorized' }

  // 2. Fetch buyer's wallet
  const { data: buyerProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', offer.buyer_id).single()
  if (!buyerProfile || buyerProfile.wallet_balance < offer.amount) {
    // If buyer doesn't have enough anymore, reject offer automatically
    await supabase.from('offers').update({ status: 'rejected' }).eq('id', offerId)
    return { error: 'Buyer has insufficient funds. Offer rejected automatically.' }
  }

  // 3. Process Transaction
  const platformFee = offer.amount * 0.01;
  const sellerEarnings = offer.amount - platformFee;

  // Deduct from buyer
  await supabase.from('profiles').update({ wallet_balance: buyerProfile.wallet_balance - offer.amount }).eq('id', offer.buyer_id);

  // Add to seller
  const { data: sellerProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', offer.seller_id).single();
  if (sellerProfile) {
    await supabase.from('profiles').update({ wallet_balance: Number(sellerProfile.wallet_balance) + sellerEarnings }).eq('id', offer.seller_id);
  }

  // Record Purchase
  await supabase.from('purchases').insert({
    buyer_id: offer.buyer_id,
    product_id: offer.product_id,
    seller_id: offer.seller_id,
    amount_paid: offer.amount,
    platform_fee: platformFee
  });

  // Update offer status
  await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId);

  // Notify Buyer
  await supabase.from('notifications').insert({
    user_id: offer.buyer_id,
    actor_id: user.id,
    type: 'system',
    reference_id: offer.product_id
  });

  revalidatePath('/offers')
  return { success: true }
}

export async function rejectOffer(offerId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('offers').update({ status: 'rejected' }).eq('id', offerId).eq('seller_id', user.id);
  
  if (error) return { error: 'Failed to reject offer' }

  revalidatePath('/offers')
  return { success: true }
}
