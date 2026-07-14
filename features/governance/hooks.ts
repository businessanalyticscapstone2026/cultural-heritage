"use client"

import { useState, useEffect, useCallback } from "react"
import type { GovernanceReviewWithSite } from "@/types/heritage"

export function useGovernanceQueue(fetcher: () => Promise<GovernanceReviewWithSite[]>) {
  const [reviews, setReviews] = useState<GovernanceReviewWithSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetcher()
      setReviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load governance queue")
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { reviews, loading, error, refetch }
}
