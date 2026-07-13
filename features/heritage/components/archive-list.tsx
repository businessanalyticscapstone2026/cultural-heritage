"use client"

import { useState } from "react"
import { RotateCcwIcon, SearchIcon, EyeIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { HeritageSite } from "../types"

interface ArchiveListProps {
  sites: HeritageSite[]
  onRestore: (id: string) => Promise<void>
}

export default function ArchiveList({ sites, onRestore }: ArchiveListProps) {
  const [search, setSearch] = useState("")
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const filtered = sites.filter((site) =>
    site.siteName.toLowerCase().includes(search.toLowerCase()) ||
    (site.municipalityName ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const handleRestore = async (id: string) => {
    setRestoringId(id)
    try {
      await onRestore(id)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search archived sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground">
          <p className="text-sm">No archived heritage sites</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Site Name</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Municipality</th>
                <th className="px-4 py-3 text-left font-medium">Last Updated</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((site) => (
                <tr key={site.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{site.siteName}</td>
                  <td className="px-4 py-3">
                    {site.category ? (
                      <Badge variant="secondary">{site.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{site.municipalityName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(site.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="View"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Restore to Draft"
                        onClick={() => handleRestore(site.id)}
                        disabled={restoringId === site.id}
                      >
                        {restoringId === site.id ? (
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcwIcon className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
