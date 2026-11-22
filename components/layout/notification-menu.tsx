"use client"

import Link from "next/link"
import { Bell, BellOff } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type NotificationItem = {
  id: string
  title: string
  description?: string
  href: string
}

export default function NotificationMenu({ items }: { items: NotificationItem[] }) {
  const count = items.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={count > 0 ? `Notifications (${count} new)` : "Notifications"}
        className="relative rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500" aria-hidden="true" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel className="font-medium text-foreground">Notifications</DropdownMenuGroupLabel>
          {count === 0 ? (
            <div className="flex flex-col items-center gap-1 px-2 py-6 text-center text-sm text-muted-foreground">
              <BellOff className="size-5" aria-hidden="true" />
              <p>You&apos;re all caught up.</p>
            </div>
          ) : (
            items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                render={<Link href={item.href} />}
                className="flex-col items-start gap-0.5"
              >
                <span className="font-medium">{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
