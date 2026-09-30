'use client'
import { useEffect, useState } from 'react'

// One scripted timeline drives every piece of the hero demo — the phone, the
// flow canvas, the SMS and the outcome chip — so they tell a single story:
// a call comes in, the agent answers, looks things up, books, and texts a
// confirmation. The first five seconds already show the call being answered
// and a tool firing; the whole loop takes ~12s.
//
// The call mirrors the product's own reference agent: "Ada, a receptionist
// for a dental practice" (flows/panel/flow-schema-panel), whose flow checks
// availability and books through a custom tool.

export type NodeId = 'trigger' | 'agent' | 'kb' | 'action'

export type DemoMessage = { from: 'caller' | 'agent'; text: string }

export type DemoState = {
  phase: 'ringing' | 'live' | 'ended'
  node: NodeId | null
  done: NodeId[]
  messages: DemoMessage[]
  typing: boolean
  speaking: 'caller' | 'agent' | null
  tool: { label: string; ok: boolean } | null
  sms: boolean
  outcome: boolean
  answeredAt: number | null
}

const INITIAL: DemoState = {
  phase: 'ringing',
  node: 'trigger',
  done: [],
  messages: [],
  typing: false,
  speaking: null,
  tool: null,
  sms: false,
  outcome: false,
  answeredAt: null,
}

type Event = { at: number; apply: (s: DemoState) => Partial<DemoState> }

const say = (from: DemoMessage['from'], text: string) => (s: DemoState): Partial<DemoState> => ({
  messages: [...s.messages, { from, text }],
  typing: false,
  speaking: from,
})

const SCRIPT: Event[] = [
  { at: 1000, apply: () => ({ phase: 'live', node: 'agent', done: ['trigger'], typing: true, answeredAt: 1000 }) },
  { at: 1600, apply: say('agent', 'Hi, you’ve reached Bright Smile Dental. This is Ada.') },
  { at: 2700, apply: say('caller', 'Can I move my cleaning to Friday?') },
  { at: 3300, apply: s => ({ node: 'kb', done: [...s.done, 'agent'], typing: true, speaking: null, tool: { label: 'search_knowledge("rescheduling")', ok: false } }) },
  { at: 3900, apply: s => ({ node: 'action', done: [...s.done, 'kb'], tool: { label: 'check_availability(friday)', ok: false } }) },
  { at: 4500, apply: () => ({ tool: { label: 'check_availability(friday)', ok: true } }) },
  { at: 5000, apply: s => ({ ...say('agent', 'Friday has 10:30 or 2:15. Which works better?')(s), node: 'agent', tool: null }) },
  { at: 6300, apply: say('caller', '10:30, please.') },
  { at: 6900, apply: () => ({ node: 'action', typing: true, speaking: null, tool: { label: 'book_appointment(fri 10:30)', ok: false } }) },
  { at: 7500, apply: () => ({ tool: { label: 'book_appointment(fri 10:30)', ok: true } }) },
  { at: 8000, apply: s => ({ ...say('agent', 'You’re booked for Friday at 10:30. I’ll text you now.')(s), tool: null }) },
  { at: 9000, apply: () => ({ phase: 'ended', node: null, done: ['trigger', 'agent', 'kb', 'action'], speaking: null, sms: true }) },
  { at: 9700, apply: () => ({ outcome: true }) },
]
const LOOP_MS = 13000

// The finished call, shown as-is to people who prefer reduced motion.
const FINAL = SCRIPT.reduce<DemoState>((s, e) => ({ ...s, ...e.apply(s) }), INITIAL)

export const useDemoTimeline = () => {
  const [state, setState] = useState<DemoState>(INITIAL)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState(FINAL)
      return
    }
    let timers: ReturnType<typeof setTimeout>[] = []
    const run = () => {
      setState(INITIAL)
      timers = SCRIPT.map(e => setTimeout(() => setState(s => ({ ...s, ...e.apply(s) })), e.at))
      timers.push(setTimeout(run, LOOP_MS))
    }
    run()
    const start = performance.now()
    const tick = setInterval(() => setElapsed((performance.now() - start) % LOOP_MS), 1000)
    return () => {
      timers.forEach(clearTimeout)
      clearInterval(tick)
    }
  }, [])

  return { state, elapsed }
}

/** Call duration as mm:ss from when the agent picked up. */
export const callClock = (state: DemoState, elapsed: number) => {
  if (state.answeredAt === null)
    return '00:00'
  const secs = Math.max(0, Math.floor((elapsed - state.answeredAt) / 1000)) + 12
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
}
