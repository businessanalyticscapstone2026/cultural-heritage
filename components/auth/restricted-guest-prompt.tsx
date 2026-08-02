"use client"

import { useState } from "react"
import AuthPromptModal from "@/components/auth/auth-prompt-modal"

interface RestrictedGuestPromptProps {
  title: string
  description: string
}

export default function RestrictedGuestPrompt({ title, description }: RestrictedGuestPromptProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl px-4 py-12 md:px-6 lg:px-10">
      <AuthPromptModal open={open} onClose={() => setOpen(false)} title={title} description={description} />
    </div>
  )
}
