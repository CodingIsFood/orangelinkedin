'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signContract(contractId, signatureDataUrl, role) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const updateData = {};
  if (role === 'buyer') {
    updateData.buyer_signature = signatureDataUrl;
  } else if (role === 'seller') {
    updateData.seller_signature = signatureDataUrl;
  } else {
    return { error: 'Invalid role' };
  }

  const { error } = await supabase
    .from('purchases')
    .update(updateData)
    .eq('id', contractId);

  if (error) return { error: 'Failed to sign contract' };

  revalidatePath(`/contracts/${contractId}`);
  return { success: true };
}
