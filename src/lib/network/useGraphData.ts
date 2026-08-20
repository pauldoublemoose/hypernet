import { useEffect, useMemo, useState } from 'react'
import type { Answers } from '../../types'
import { fetchGraphSignups, type GraphSignupRow } from '../supabase'
import { buildGraphData } from './buildGraph'
import type { GraphData } from './types'

/** Session cache so reopening the graph paints instantly, then refreshes. */
let cachedRows: GraphSignupRow[] | null = null

/**
 * Graph data for the network view: seeds + current answers + local caches,
 * plus everyone in the shared database. Rows are (re)fetched each time the
 * graph becomes active so new signups and admin ghost changes apply.
 */
export function useGraphData(answers: Answers | null, active: boolean): GraphData {
  const [remote, setRemote] = useState<GraphSignupRow[]>(cachedRows ?? [])

  useEffect(() => {
    if (!active) return
    let alive = true
    fetchGraphSignups().then((rows) => {
      if (!rows.length) return
      cachedRows = rows
      if (alive) setRemote(rows)
    })
    return () => {
      alive = false
    }
  }, [active])

  // `active` stays a dep so local ghost changes apply on reopen.
  return useMemo(() => buildGraphData(answers, remote), [answers, remote, active])
}
