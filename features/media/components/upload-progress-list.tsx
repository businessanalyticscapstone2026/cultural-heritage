import { X, CheckCircle, AlertCircle } from "lucide-react"
import { formatFileSize } from "../constants"

export interface UploadItem {
  id: string
  file: File
  fileName: string
  progress: number
  status: "queued" | "uploading" | "complete" | "error"
  error?: string
}

interface UploadProgressListProps {
  items: UploadItem[]
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onDismiss: (id: string) => void
}

export default function UploadProgressList({
  items,
  onCancel,
  onRetry,
  onDismiss,
}: UploadProgressListProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-md border px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{item.fileName}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(item.file.size)}
              </span>
            </div>

            {(item.status === "queued" || item.status === "uploading") && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.status === "queued" ? "Waiting..." : `${item.progress}%`}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}

            {item.status === "complete" && (
              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="size-3" />
                <span>Upload complete</span>
              </div>
            )}

            {item.status === "error" && (
              <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3" />
                <span>{item.error ?? "Upload failed"}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {item.status === "uploading" && (
              <button
                type="button"
                onClick={() => onCancel(item.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Cancel upload of ${item.fileName}`}
              >
                <X className="size-4" />
              </button>
            )}
            {item.status === "error" && (
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className="text-xs text-primary hover:underline"
              >
                Retry
              </button>
            )}
            {(item.status === "complete" || item.status === "error") && (
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Dismiss ${item.fileName}`}
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
