"use client"

import { useRole } from "@/context/role-context"

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function GreetingHeader() {
  const { staffName } = useRole()
  const greeting = getTimeGreeting()
  const date = formatDate()
  const name = staffName ?? "there"

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {greeting}, {name}
      </h1>
      <p className="text-sm text-muted-foreground">{date}</p>
    </div>
  )
}
