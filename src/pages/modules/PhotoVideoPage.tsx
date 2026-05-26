import { useRef, useState } from 'react'
import { useParty } from '../../state/PartyContext'
import { v4 as uuid } from 'uuid'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Download, ImagePlus, Trash2 } from 'lucide-react'
import type { GalleryPhoto } from '../../state/types'

const MAX_IMAGE_DIM = 1200
function resizeDataUrl(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { width, height } = img
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl)
        return
      }
      const scale = maxDim / Math.max(width, height)
      const w = Math.round(width * scale)
      const h = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

type PhotoVideoConfirming =
  | { type: 'shot'; id: string; name: string }
  | { type: 'photo'; id: string }
  | { type: 'equipment'; item: string }
  | null

export function PhotoVideoPage() {
  const { state, dispatch } = useParty()
  const [confirmingRemove, setConfirmingRemove] = useState<PhotoVideoConfirming>(null)
  const [draft, setDraft] = useState({
    title: '',
    type: 'photo' as const,
    notes: '',
    assignee: '',
    scheduledOffset: undefined as number | undefined,
  })
  const [equipmentItem, setEquipmentItem] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addShot = () => {
    if (!draft.title.trim()) return
    dispatch({
      type: 'update_photo_video',
      payload: {
        shots: [
          ...state.photoVideo.shots,
          {
            id: uuid(),
            title: draft.title.trim(),
            type: draft.type,
            status: 'not_started' as const,
            notes: draft.notes.trim(),
            assignee: draft.assignee.trim() || undefined,
            scheduledOffset: draft.scheduledOffset,
          },
        ],
      },
    })
    setDraft({ title: '', type: 'photo', notes: '', assignee: '', scheduledOffset: undefined })
  }

  const updateShot = (
    id: string,
    updates: Partial<(typeof state.photoVideo.shots)[0]>,
  ) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        shots: state.photoVideo.shots.map((shot) =>
          shot.id === id ? { ...shot, ...updates } : shot,
        ),
      },
    })
  }

  const removeShot = (id: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        shots: state.photoVideo.shots.filter((shot) => shot.id !== id),
      },
    })
  }

  const addEquipment = () => {
    if (!equipmentItem.trim()) return
    dispatch({
      type: 'update_photo_video',
      payload: {
        equipment: [...state.photoVideo.equipment, equipmentItem.trim()],
      },
    })
    setEquipmentItem('')
  }

  const removeEquipment = (item: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        equipment: state.photoVideo.equipment.filter((entry) => entry !== item),
      },
    })
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return
    const newPhotos: GalleryPhoto[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const resized = await resizeDataUrl(dataUrl, MAX_IMAGE_DIM)
      newPhotos.push({
        id: uuid(),
        dataUrl: resized,
        caption: file.name.replace(/\.[^.]+$/, ''),
        addedAt: new Date().toISOString(),
        filename: file.name,
      })
    }
    if (newPhotos.length > 0) {
      dispatch({
        type: 'update_photo_video',
        payload: {
          photos: [...state.photoVideo.photos, ...newPhotos],
        },
      })
    }
    event.target.value = ''
  }

  const downloadPhoto = (photo: GalleryPhoto) => {
    if (!photo.dataUrl) return
    const base64 = photo.dataUrl.split(',')[1]
    if (!base64) return
    const mime = photo.dataUrl.match(/data:([^;]+);/)?.[1] ?? 'image/jpeg'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: mime })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = photo.caption ? `${photo.caption}.jpg` : photo.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const removePhoto = (id: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        photos: state.photoVideo.photos.filter((p) => p.id !== id),
      },
    })
  }

  const updatePhotoCaption = (id: string, caption: string) => {
    dispatch({
      type: 'update_photo_video',
      payload: {
        photos: state.photoVideo.photos.map((p) =>
          p.id === id ? { ...p, caption } : p,
        ),
      },
    })
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h3 className="text-2xl font-semibold text-white">Photo/Video Shoot</h3>
      <p className="text-sm text-slate-300">
        Plan shots, track equipment, and capture the party.
      </p>

      <Card>
        <CardTitle>Add shot</CardTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            Shot idea
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-2"
              placeholder="Group photo on rooftop"
            />
          </label>
          <label className="text-sm text-slate-300">
            Type
            <Select
              value={draft.type}
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as typeof draft.type })
              }
              className="mt-2"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </Select>
          </label>
          <label className="text-sm text-slate-300">
            Assignee
            <Input
              value={draft.assignee}
              onChange={(event) => setDraft({ ...draft, assignee: event.target.value })}
              className="mt-2"
              placeholder="Photographer name"
            />
          </label>
          <label className="text-sm text-slate-300">
            Schedule (hrs from start)
            <Input
              type="number"
              value={draft.scheduledOffset ?? ''}
              onChange={(event) => setDraft({ ...draft, scheduledOffset: Number(event.target.value) || undefined })}
              className="mt-2"
              placeholder="e.g. 2"
            />
          </label>
          <label className="text-sm text-slate-300 md:col-span-2">
            Notes
            <Input
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              className="mt-2"
              placeholder="Golden hour, face the city"
            />
          </label>
        </div>
        <Button type="button" onClick={addShot} className="mt-4">
          Add shot
        </Button>
      </Card>

      <Card>
        <CardTitle>Shot list</CardTitle>
        {state.photoVideo.shots.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No shots planned yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.photoVideo.shots.map((shot) => (
              <div
                key={shot.id}
                className="rounded-xl bg-white/5 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Input
                      value={shot.title}
                      onChange={(event) =>
                        updateShot(shot.id, { title: event.target.value })
                      }
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Select
                        value={shot.type}
                        onChange={(event) =>
                          updateShot(shot.id, {
                            type: event.target.value as typeof shot.type,
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                      </Select>
                      <Select
                        value={shot.status}
                        onChange={(event) =>
                          updateShot(shot.id, {
                            status: event.target.value as typeof shot.status,
                          })
                        }
                        className="rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="not_started">Not started</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </Select>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <Input
                        value={shot.assignee ?? ''}
                        onChange={(event) =>
                          updateShot(shot.id, { assignee: event.target.value || undefined })
                        }
                        className="text-xs"
                        placeholder="Assignee"
                      />
                      <Input
                        type="number"
                        value={shot.scheduledOffset ?? ''}
                        onChange={(event) =>
                          updateShot(shot.id, { scheduledOffset: Number(event.target.value) || undefined })
                        }
                        className="text-xs"
                        placeholder="Offset hrs"
                      />
                    </div>
                    <Input
                      value={shot.notes}
                      onChange={(event) =>
                        updateShot(shot.id, { notes: event.target.value })
                      }
                      className="mt-2 text-xs"
                      placeholder="Notes"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => setConfirmingRemove({ type: 'shot', id: shot.id, name: shot.title })}
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Photo Gallery</CardTitle>
        <p className="mt-2 text-sm text-slate-400">
          Upload party photos. Images are resized to save space. Stored locally in your browser.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handlePhotoUpload}
        />
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Upload photos
          </Button>
          {state.photoVideo.photos.length > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => state.photoVideo.photos.forEach((p) => downloadPhoto(p))}
            >
              <Download className="mr-2 h-4 w-4" />
              Download all ({state.photoVideo.photos.length})
            </Button>
          )}
        </div>
        {state.photoVideo.photos.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No photos yet. Add some to build your gallery.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {state.photoVideo.photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl bg-white/5"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || 'Party photo'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 p-2">
                  <Input
                    value={photo.caption}
                    onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                    placeholder="Add caption"
                    className="border-white/10 bg-white/5 text-xs"
                  />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-1 py-1.5 text-xs"
                      onClick={() => downloadPhoto(photo)}
                      aria-label="Download photo"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300"
                      onClick={() => setConfirmingRemove({ type: 'photo', id: photo.id })}
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Equipment</CardTitle>
        <div className="mt-4 flex gap-2">
          <Input
            value={equipmentItem}
            onChange={(event) => setEquipmentItem(event.target.value)}
            className="flex-1"
            placeholder="Camera, tripod, ring light..."
          />
          <Button type="button" onClick={addEquipment}>
            Add
          </Button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {state.photoVideo.equipment.map((item) => (
            <li
              key={item}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <span>{item}</span>
              <Button
                variant="ghost"
                onClick={() => setConfirmingRemove({ type: 'equipment', item })}
                className="text-xs"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
      <ConfirmDialog
        open={!!confirmingRemove}
        onClose={() => setConfirmingRemove(null)}
        onConfirm={() => {
          if (!confirmingRemove) return
          if (confirmingRemove.type === 'shot') removeShot(confirmingRemove.id)
          else if (confirmingRemove.type === 'photo') removePhoto(confirmingRemove.id)
          else if (confirmingRemove.type === 'equipment') removeEquipment(confirmingRemove.item)
        }}
        title="Remove item"
        description={
          confirmingRemove
            ? confirmingRemove.type === 'shot'
              ? `Remove shot "${confirmingRemove.name}"? This cannot be undone.`
              : confirmingRemove.type === 'photo'
                ? 'Remove this photo? This cannot be undone.'
                : `Remove "${confirmingRemove.item}"? This cannot be undone.`
            : ''
        }
      />
    </div>
  )
}

export default PhotoVideoPage
