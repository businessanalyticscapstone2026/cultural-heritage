"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HeritageSiteMedia } from "@/types/heritage"

interface DeleteConfirmationModalProps {
  media: HeritageSiteMedia | null
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DeleteConfirmationModal({
  media,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationModalProps) {
  if (!media) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm deletion"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Delete media</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{media.fileName ?? "this file"}</strong>?
              This action cannot be undone and the file will be permanently removed.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
