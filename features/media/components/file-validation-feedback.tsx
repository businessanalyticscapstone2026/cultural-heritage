import { AlertCircle, CheckCircle } from "lucide-react"
import { formatFileSize } from "../constants"

export interface ValidationIssue {
  fileName: string
  message: string
}

interface FileValidationFeedbackProps {
  issues: ValidationIssue[]
  onDismiss: (index: number) => void
}

export default function FileValidationFeedback({ issues, onDismiss }: FileValidationFeedbackProps) {
  if (issues.length === 0) return null

  return (
    <div className="space-y-2" role="alert" aria-label="File validation errors">
      {issues.map((issue, i) => (
        <div
          key={`${issue.fileName}-${i}`}
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex-1 text-sm">
            <span className="font-medium">{issue.fileName}</span>: {issue.message}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(i)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Dismiss error for ${issue.fileName}`}
          >
            <span className="sr-only">Dismiss</span>
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

interface FileValidationSuccessProps {
  fileName: string
  sizeBytes: number
}

export function FileValidationSuccess({ fileName, sizeBytes }: FileValidationSuccessProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
      <CheckCircle className="size-4 shrink-0" />
      <span>
        <span className="font-medium">{fileName}</span> ({formatFileSize(sizeBytes)}) ready to upload
      </span>
    </div>
  )
}
