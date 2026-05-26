import { supabase } from './auth'

const BUCKET = 'party-photos'

export interface UploadResult {
  storagePath: string
  url: string
}

/**
 * Upload an image to Supabase Storage.
 * Path format: {partyId}/{photoId}.{ext}
 */
export async function uploadPartyPhoto(
  partyId: string,
  photoId: string,
  blob: Blob,
  filename: string,
): Promise<UploadResult> {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const extNorm = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
  const storagePath = `${partyId}/${photoId}.${extNorm}`

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

  return { storagePath, url: publicUrl }
}

/**
 * Get the public URL for a stored photo.
 */
export function getPhotoPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

/**
 * Delete a photo from Storage.
 */
export async function deletePartyPhoto(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (error) throw error
}
