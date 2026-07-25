"use client"

import { useState, useCallback } from "react"
import { getHeroImageAction, setHeroImageAction, requestHeroUploadUrlAction } from "../actions/media"
import { MEDIA_STORAGE_BUCKET } from "../constants"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function HeroImageManager() {
  const [heroUrl, setHeroUrl] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadHero = useCallback(async () => {
    const url = await getHeroImageAction()
    setHeroUrl(url)
    setLoaded(true)
  }, [])

  if (!loaded) {
    loadHero()
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading...</div>
  }

  const handleUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/jpeg,image/png"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setSaving(true)
      try {
        const supabase = createClient()
        const { uploadUrl, filePath } = await requestHeroUploadUrlAction(file.name, file.type)
        const response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })
        if (!response.ok) throw new Error("Upload failed")
        const { data: urlData } = supabase.storage.from(MEDIA_STORAGE_BUCKET).getPublicUrl(filePath)
        await setHeroImageAction(urlData.publicUrl)
        setHeroUrl(urlData.publicUrl)
      } catch {
        // keep current state
      } finally {
        setSaving(false)
      }
    }
    input.click()
  }

  const handleClear = async () => {
    setSaving(true)
    try {
      await setHeroImageAction("")
      setHeroUrl(null)
    } catch {
      // keep current state
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-muted">
        {heroUrl ? (
          <img src={heroUrl} alt="Hero background" className="h-64 w-full object-cover" />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-parchment via-cream to-ink/20">
            <p className="text-sm text-muted-foreground">No hero image set</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleUpload} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {heroUrl ? "Replace image" : "Upload hero image"}
        </Button>
        {heroUrl && (
          <Button variant="outline" onClick={handleClear} disabled={saving} className="gap-2">
            <Trash2 className="size-4" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
