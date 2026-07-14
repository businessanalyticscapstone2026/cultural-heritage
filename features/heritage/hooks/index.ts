"use client"

import { useState, useEffect, useCallback } from "react"
import type { HeritageSite, HeritageCategory, HeritageSiteVersion, HeritageBackup } from "@/types/heritage"

export function useHeritageSites(fetcher: () => Promise<HeritageSite[]>) {
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetcher()
      setSites(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load heritage sites")
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { sites, loading, error, refetch }
}

export function useHeritageCategories(fetcher: () => Promise<HeritageCategory[]>) {
  const [categories, setCategories] = useState<HeritageCategory[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetcher()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { categories, loading, refetch }
}

export function useBackups(fetcher: () => Promise<HeritageBackup[]>) {
  const [backups, setBackups] = useState<HeritageBackup[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetcher()
      setBackups(data)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { backups, loading, refetch }
}
