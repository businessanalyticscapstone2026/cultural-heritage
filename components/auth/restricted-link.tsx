"use client"

import Link from "next/link"
import { useState, type MouseEvent, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import AuthPromptModal from "@/components/auth/auth-prompt-modal"

interface RestrictedLinkProps {
  href: string
  title: string
  description: string
  className?: string
  target?: string
  rel?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  children: ReactNode
}

export default function RestrictedLink({
  href,
  title,
  description,
  className,
  target,
  rel,
  onClick,
  children,
}: RestrictedLinkProps) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!profile) {
      e.preventDefault()
      setOpen(true)
      return
    }
    onClick?.(e)
  }

  return (
    <>
      <AuthPromptModal open={open} onClose={() => setOpen(false)} title={title} description={description} />
      <Link href={href} className={className} target={target} rel={rel} onClick={handleClick}>
        {children}
      </Link>
    </>
  )
}
