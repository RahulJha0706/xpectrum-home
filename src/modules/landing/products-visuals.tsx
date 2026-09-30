'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView } from 'framer-motion'
import {
  RiArrowRightSLine,
  RiArrowUpLine,
  RiBook2Line,
  RiBrainFill,
  RiChatCheckLine,
  RiChatSmile3Line,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiFlashlightFill,
  RiGlobalLine,
  RiLineChartLine,
  RiLoader2Line,
  RiMailLine,
  RiMegaphoneLine,
  RiMessage2Line,
  RiMicLine,
  RiPauseFill,
  RiPhoneLine,
  RiPlayFill,
  RiPlugLine,
  RiPuzzle2Line,
  RiRefreshLine,
  RiSearchEyeFill,
  RiSearchLine,
  RiStopCircleLine,
  RiVolumeUpLine,
  RiWebhookLine,
  RiWhatsappLine,
  RiYoutubeLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { basePath } from '@/lib/var'
import { Graph } from './walkthrough/canvas'
import type { GEdge, GNode, NodeStatus } from './walkthrough/canvas'

/* Live visuals for the product cards. Each loops through a few steps with
   useTicker, which only runs while its card is on screen and holds still
   under prefers-reduced-motion. The agent and workflow previews reuse the
   walkthrough's replica of the real editor canvas. */

const useTicker = (steps: number, ms: number, still = steps - 1) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(still)
      return
    }
    if (!inView)
      return
    const t = setInterval(() => setStep(s => (s + 1) % steps), ms)
    return () => clearInterval(t)
  }, [inView, steps, ms, still])
  return [ref, step] as const
}

const statusAt = (step: number, runsAt: number): NodeStatus => {
  if (step > runsAt)
    return 'done'
  return step === runsAt ? 'running' : 'idle'
}

/* ── Conversational Apps: an Agent Flow answering a chat ────────────────
   An Agent Flow runs on its canvas while it answers (the Preview drives the
   same run hooks as a workflow): one block at a time takes the blue running
   ring, finished blocks turn green, blocks not reached yet are dimmed, and
   reached wires become a still green gradient. The chat bubble carries the
   app's collapsed "Workflow Process" row, spinner then check. */

const FLOW = [
  { id: 'trigger', title: 'Trigger', sub: 'User message', icon: RiFlashlightFill, color: '#296dff', x: 0, y: 0 },
  { id: 'kb', title: 'Knowledge Search', sub: 'Delivery policy', icon: RiSearchEyeFill, color: '#17b26a', x: 216, y: 0 },
  { id: 'ai', title: 'AI Model', sub: 'Understand the issue', icon: RiBrainFill, color: '#6172f3', x: 432, y: 0 },
  { id: 'http', title: 'HTTP Request', sub: 'lookup_order', icon: RiGlobalLine, color: '#ee46bc', x: 432, y: 124 },
  { id: 'answer', title: 'Answer', sub: 'Streamed reply', icon: RiChatCheckLine, color: '#f04438', x: 216, y: 124 },
]
const FLOW_EDGES: GEdge[] = FLOW.slice(1).map((n, i) => ({ from: FLOW[i].id, to: n.id }))
const REPLY = 'It’s held at the depot. I’ve rebooked delivery for tomorrow before noon and refunded the shipping fee.'
// One step per block, then two beats holding the finished run.
const CHAT_STEPS = FLOW.length + 2

export const ChatVisual = () => {
  const [ref, step] = useTicker(CHAT_STEPS, 1100)
  const finished = step >= FLOW.length
  const nodes: GNode[] = FLOW.map((n, i) => ({
    ...n,
    configured: true,
    status: statusAt(step, i),
    waiting: !finished && i > step,
  }))
  // The reply streams while the Answer block runs.
  const answering = step === FLOW.length - 1
  return (
    <div ref={ref} className='grid h-full grid-cols-1 md:grid-cols-[0.95fr_1.25fr]'>
      <div className='flex min-h-0 flex-col text-[13px]'>
        <div className='flex h-10 shrink-0 items-center justify-between border-b border-[var(--xl-border-subtle)] px-4'>
          <span className='text-[12.5px] font-semibold text-white'>Preview</span>
          <span className='flex items-center gap-2 text-[#9d96b3]'>
            <RiRefreshLine className='h-3.5 w-3.5' />
            <RiCloseLine className='h-4 w-4' />
          </span>
        </div>
        <div className='flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden px-4 py-3'>
        <div className='max-w-[85%] self-end bg-[#3d335f] px-3.5 py-2.5 text-white'>
          My order #4471 never arrived.
        </div>
        <div className='flex max-w-[95%] flex-col gap-2 self-start bg-[#2a2342] px-3.5 py-2.5 text-white'>
          <div className={cn('flex items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-[11.5px] font-medium', finished ? 'bg-[#1c3428] text-[#28ac6a]' : 'bg-[#1f1a33] text-[#9d96b3]')}>
            {finished ? <RiCheckboxCircleFill className='h-3.5 w-3.5' /> : <RiLoader2Line className='h-3.5 w-3.5 animate-spin' />}
            <span className='text-[#e9e7f1]'>Workflow Process</span>
            <RiArrowRightSLine className='h-3.5 w-3.5' />
          </div>
          {step < FLOW.length - 1 && (
            <span className='flex h-4 items-center gap-1'>
              {[0, 150, 300].map(d => <span key={d} className='h-1 w-1 animate-pulse rounded-full bg-[#9d96b3]' style={{ animationDelay: `${d}ms` }} />)}
            </span>
          )}
          {step >= FLOW.length - 1 && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='leading-snug'>
              {answering ? `${REPLY.slice(0, 56)}…` : REPLY}
            </motion.span>
          )}
        </div>
        </div>
        <div className='shrink-0 border-t border-[var(--xl-border-subtle)] px-4 pb-3 pt-2'>
          {!finished && (
            <div className='mb-1.5 flex items-center justify-between text-[11px]'>
              <span className='flex items-center gap-1.5 font-medium text-[#c6c1d6]'>
                Agent is thinking
                {[0, 150, 300].map(d => <span key={d} className='h-1 w-1 animate-bounce rounded-full bg-[#9d96b3]' style={{ animationDelay: `${d}ms` }} />)}
              </span>
              <span className='flex items-center gap-1 text-[#9d96b3]'>
                <RiStopCircleLine className='h-3.5 w-3.5' />
                Stop
              </span>
            </div>
          )}
          <div className='flex h-8 items-center gap-2 border-b border-[#5c5183] pl-0.5'>
            <span className='min-w-0 flex-1 truncate text-[11.5px] text-[#7e7795]'>Ask something to test the agent</span>
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#1966ca] text-white'>
              <RiArrowUpLine className='h-3.5 w-3.5' />
            </span>
          </div>
        </div>
      </div>
      <div className='xl-app-canvas relative hidden border-l border-[var(--xl-border-subtle)] md:block'>
        <Graph nodes={nodes} edges={FLOW_EDGES} zoom={false} pad={16} className='inset-0' />
      </div>
    </div>
  )
}

/* ── Automation: a workflow running node by node ──────────────────────── */

const WF = [
  { id: 'hook', title: 'Webhook Trigger', sub: 'New lead from the website', icon: RiWebhookLine, color: '#296dff' },
  { id: 'ai', title: 'AI Model', sub: 'Qualify the lead', icon: RiBrainFill, color: '#6172f3' },
  { id: 'http', title: 'HTTP Request', sub: 'Create the deal', icon: RiGlobalLine, color: '#ee46bc' },
]

export const AutomationVisual = () => {
  const [ref, step] = useTicker(5, 1100)
  const nodes: GNode[] = WF.map((w, i) => ({ ...w, x: 0, y: i * 112, configured: true, input: i > 0, output: i < 2, status: statusAt(step, i), waiting: step < 3 && step < i }))
  const edges: GEdge[] = [{ from: 'hook', to: 'ai' }, { from: 'ai', to: 'http' }]
  const done = step >= 3
  return (
    <div ref={ref} className='xl-app-canvas relative h-full'>
      <Graph nodes={nodes} edges={edges} vertical zoom={false} pad={16} className='inset-x-0 bottom-11 top-0' />
      <div className='absolute inset-x-4 bottom-3 flex h-7 items-center justify-between rounded-lg border border-[#453d63] bg-[#1a1535] px-2.5 text-[11px]'>
        <span className='text-[#9d96b3]'>Run #2,184</span>
        <span className={cn('flex items-center gap-1.5 font-semibold', done ? 'text-[#28ac6a]' : 'text-[#5a99eb]')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', done ? 'bg-[#28ac6a]' : 'bg-[#5a99eb]')} />
          {done ? 'Completed · 1.412s' : 'Running…'}
        </span>
      </div>
    </div>
  )
}

/* ── Knowledge: hybrid search over every source, with the cited result ─ */

const QUERIES = [
  {
    q: 'Can I reschedule a cleaning?',
    hits: [
      { t: 'Scheduling & cancellations', src: 'Patient FAQ.pdf', icon: RiFileTextLine, score: 0.94 },
      { t: 'Front desk: rescheduling', src: 'Notion', icon: RiBook2Line, score: 0.81 },
      { t: 'Book online', src: 'brightsmile.com', icon: RiGlobalLine, score: 0.62 },
    ],
  },
  {
    q: 'How do I care for a new implant?',
    hits: [
      { t: 'Implant aftercare, week 1', src: 'YouTube', icon: RiYoutubeLine, score: 0.91 },
      { t: 'After your procedure', src: 'Patient FAQ.pdf', icon: RiFileTextLine, score: 0.77 },
      { t: 'Recovery tips', src: 'brightsmile.com', icon: RiGlobalLine, score: 0.58 },
    ],
  },
]

export const KnowledgeVisual = () => {
  // Per query: type (6 ticks) · results (3) · hold (3)
  const [ref, tick] = useTicker(QUERIES.length * 12, 180, 11)
  const qi = Math.floor(tick / 12)
  const local = tick % 12
  const { q, hits } = QUERIES[qi]
  const typed = local >= 6 ? q : q.slice(0, Math.ceil((q.length * (local + 1)) / 6))
  const shown = local >= 6
  return (
    <div ref={ref} className='flex h-full flex-col gap-2.5 p-5'>
      <div className='flex h-9 items-center gap-2 rounded-lg border border-[#7c5cff66] bg-[#7c5cff14] px-3 text-[12.5px]'>
        <RiSearchLine className='h-3.5 w-3.5 text-[#b9a8ff]' />
        <span className='min-w-0 truncate text-white'>{typed}</span>
        {!shown && <span className='h-3.5 w-px animate-pulse bg-white' />}
        <span className='ml-auto shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--xl-txt4)]'>Hybrid</span>
      </div>
      <div className='space-y-1.5'>
        {!shown && [0, 1, 2].map(i => (
          <div key={i} className='flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-2.5 py-2'>
            <span className='h-4 w-4 shrink-0 animate-pulse rounded bg-white/10' />
            <span className='flex-1 space-y-1.5'>
              <span className='block h-2.5 animate-pulse rounded bg-white/10' style={{ width: `${70 - i * 12}%` }} />
              <span className='block h-2 w-1/3 animate-pulse rounded bg-white/[0.06]' />
            </span>
          </div>
        ))}
        {shown && hits.map((h, i) => (
          <motion.div
            key={`${qi}-${h.t}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={cn('flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px]', i === 0 && shown ? 'bg-[#7c5cff1f] ring-1 ring-inset ring-[#7c5cff80]' : 'bg-white/[0.04]')}
          >
            <h.icon className='h-4 w-4 shrink-0 text-[#b9a8ff]' />
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-white'>{h.t}</span>
              <span className='block truncate text-[10.5px] text-[var(--xl-txt4)]'>{h.src}</span>
            </span>
            <span className='h-1 w-10 shrink-0 overflow-hidden rounded-full bg-white/10'>
              <motion.span className='block h-full rounded-full bg-[#7c5cff]' initial={false} animate={{ width: shown ? `${h.score * 100}%` : '0%' }} transition={{ delay: i * 0.1 }} />
            </span>
            {i === 0 && shown
              ? <span className='shrink-0 rounded bg-[#7c5cff] px-1.5 text-[10px] font-bold text-white'>cited</span>
              : <span className='w-9 shrink-0 text-right text-[10.5px] tabular-nums text-[var(--xl-txt4)]'>{shown ? h.score.toFixed(2) : ''}</span>}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ── Channels: every channel flowing into one agent ───────────────────── */

const CHANNELS = [
  { icon: RiPhoneLine, label: 'Voice', msg: 'Incoming call…', x: 50, y: 11 },
  { icon: RiMessage2Line, label: 'SMS', msg: 'Running 10 min late', x: 83, y: 28 },
  { icon: RiWhatsappLine, label: 'WhatsApp', msg: 'Is my order ready?', x: 83, y: 64 },
  { icon: RiMailLine, label: 'Email', msg: 'Invoice question', x: 50, y: 78 },
  { icon: RiChatSmile3Line, label: 'Web chat', msg: 'Do you ship to Canada?', x: 17, y: 64 },
  { icon: RiMegaphoneLine, label: 'Batch calls', msg: 'Calling 1,200 numbers', x: 17, y: 28 },
]

export const ChannelsVisual = () => {
  const [ref, active] = useTicker(CHANNELS.length, 1500, 0)
  const a = CHANNELS[active]
  return (
    <div ref={ref} className='relative h-full overflow-hidden'>
      <svg className='absolute inset-0 h-full w-full' viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden>
        {CHANNELS.map((c, i) => (
          <line key={c.label} x1={c.x} y1={c.y} x2='50' y2='45' stroke={i === active ? '#d25cff' : '#453d63'} strokeWidth={i === active ? 0.9 : 0.5} vectorEffect='non-scaling-stroke' className='transition-[stroke] duration-500' />
        ))}
      </svg>
      {/* The message travelling in along the active line. */}
      <motion.span
        key={active}
        className='absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e39bff] shadow-[0_0_12px_4px_rgba(210,92,255,0.6)]'
        initial={{ left: `${a.x}%`, top: `${a.y}%`, opacity: 1 }}
        animate={{ left: '50%', top: '45%', opacity: [1, 1, 0] }}
        transition={{ duration: 0.9, ease: 'easeIn' }}
      />
      <div className='absolute left-1/2 top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'>
        <span className='relative flex h-14 w-14 items-center justify-center'>
          <span className='xl-pulse-ring absolute inset-0 rounded-full bg-[#d25cff]/30' />
          <span className='relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1966ca] to-[#d25cff] shadow-[0_0_30px_rgba(210,92,255,0.45)]'>
            <span className='flex h-11 w-11 items-center justify-center rounded-full bg-white'><img src={`${basePath}/logo/logo-embedded-chat-avatar.png`} alt='' className='h-7 w-7 object-contain' /></span>
          </span>
        </span>
        <span className='mt-1.5 text-[11px] font-semibold text-white'>One agent</span>
      </div>
      {CHANNELS.map((c, i) => (
        <div key={c.label} className='absolute -translate-x-1/2 -translate-y-1/2' style={{ left: `${c.x}%`, top: `${c.y}%` }}>
          <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-500', i === active ? 'border-[#d25cff] bg-[#3a1f4f] text-white shadow-[0_0_18px_rgba(210,92,255,0.45)]' : 'border-[#453d63] bg-[#1c1638] text-[var(--xl-txt3)]')}>
            <c.icon className='h-3.5 w-3.5 text-[#e39bff]' />
            {c.label}
          </div>
        </div>
      ))}
      <AnimatePresence mode='wait'>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className='absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] text-[var(--xl-txt2)]'
        >
          <span className='text-[#e39bff]'>{a.label}</span>
          {' · '}
          {a.msg}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── Integrations: the services it connects to, drifting past ─────────── */

// Named because they appear in the product (telephony, speech, knowledge
// sources, tracing, tools) — not as partners or customers.
const ROWS = [
  [{ n: 'Twilio', i: RiPhoneLine }, { n: 'LiveKit', i: RiMicLine }, { n: 'Deepgram', i: RiMicLine }, { n: 'ElevenLabs', i: RiVolumeUpLine }, { n: 'Cartesia', i: RiVolumeUpLine }, { n: 'WhatsApp Business', i: RiWhatsappLine }],
  [{ n: 'Notion', i: RiBook2Line }, { n: 'Firecrawl', i: RiGlobalLine }, { n: 'Jina Reader', i: RiGlobalLine }, { n: 'YouTube', i: RiYoutubeLine }, { n: 'SerpAPI', i: RiSearchLine }],
  [{ n: 'MCP servers', i: RiPlugLine }, { n: 'OpenAPI tools', i: RiCodeSSlashLine }, { n: 'Plugins', i: RiPuzzle2Line }, { n: 'Webhooks', i: RiWebhookLine }, { n: 'LangSmith', i: RiLineChartLine }, { n: 'Langfuse', i: RiLineChartLine }],
]

const Row = ({ row, r }: { row: typeof ROWS[number]; r: number }) => (
  <div className='xl-marquee overflow-hidden'>
    <div className='xl-marquee-track' style={{ animationDuration: `${30 + r * 8}s`, animationDirection: r % 2 ? 'reverse' : 'normal' }}>
      {[...row, ...row].map((c, i) => (
        <span key={i} aria-hidden={i >= row.length} className='mx-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-[#34d39933] bg-[#34d3990d] px-2.5 py-1.5 text-[12px] text-[var(--xl-txt2)]'>
          <c.i className='h-3.5 w-3.5 text-[#6ee7b7]' />
          {c.n}
        </span>
      ))}
    </div>
  </div>
)

export const IntegrationsVisual = () => (
  <div className='flex h-full flex-col justify-center gap-2.5 overflow-hidden py-4'>
    <Row row={ROWS[0]} r={0} />
    <Row row={ROWS[1]} r={1} />
    <div className='relative flex items-center justify-center py-1'>
      <span className='absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-[#34d39966] to-transparent' />
      <span className='relative flex items-center gap-2 rounded-xl border border-[#34d39966] bg-[#0f2a24] px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_0_24px_rgba(52,211,153,0.28)]'>
        <RiPlugLine className='h-4 w-4 text-[#6ee7b7]' />
        Your agent
      </span>
    </div>
    <Row row={ROWS[2]} r={2} />
  </div>
)

/* ── Monitoring: execution overview ─────────────────────────────────────
   Hourly runs as dotted bars (successes above, errors below), the run in
   flight stepping through its blocks, and a status line — the shape of the
   app's Monitoring › Executions view. The current hour's bar grows as runs
   complete. Numbers are illustrative. Pause stops it; it also stops while
   off screen and holds still under prefers-reduced-motion. */

const MON = '#5eead4'
// A rolling window of 14 hours. The newest hour fills up as runs complete;
// every HOUR_TICKS ticks a new hour opens on the right and the oldest one
// slides out on the left. The tallest bar sets the scale, so the whole
// chart rescales as the peak moves.
type Hour = { h: number; ok: number; err: number }
const START_HOUR = 9
const BASE = [38, 61, 84, 112, 146, 70, 92, 118, 139, 64, 88, 121, 150, 52]
const ERRORS = [0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 1, 0]
const HOUR_TICKS = 12
const INITIAL_HOURS: Hour[] = BASE.map((ok, i) => ({ h: START_HOUR + i, ok, err: ERRORS[i] }))
const hourLabel = (h: number) => {
  const x = ((h % 24) + 24) % 24
  const n = x % 12 === 0 ? 12 : x % 12
  return `${n} ${x < 12 ? 'AM' : 'PM'}`
}
// Busy and quiet hours alternate, like a real day: how many runs one tick adds.
const burst = (h: number) => {
  const busy = [10, 11, 13, 14, 16, 17, 20, 21].includes(((h % 24) + 24) % 24)
  return (busy ? 7 : 3) + Math.floor(Math.random() * (busy ? 9 : 5))
}
const RUN_STEPS = ['Request received', 'Knowledge Search', 'HTTP Request · lookup_order', 'Answer', 'Completed']

const useMonitorTick = (ms: number) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches), [])
  useEffect(() => {
    if (!inView || paused || reduced)
      return
    const t = setInterval(() => setTick(v => v + 1), ms)
    return () => clearInterval(t)
  }, [inView, paused, reduced, ms])
  return { ref, tick, paused, setPaused, inView }
}

const Ticker = ({ value }: { value: number }) => {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const c = animate(from.current, value, { duration: 0.6, ease: 'easeOut', onUpdate: v => setShown(Math.round(v)) })
    from.current = value
    return () => c.stop()
  }, [value])
  return <>{shown.toLocaleString('en-US')}</>
}

export const MonitoringVisual = () => {
  const { ref, tick, paused, setPaused, inView } = useMonitorTick(1100)
  const step = tick % RUN_STEPS.length // 0..4
  const completed = Math.floor(tick / RUN_STEPS.length)
  const runNo = 2184 + completed
  const done = step === RUN_STEPS.length - 1

  const [hours, setHours] = useState<Hour[]>(INITIAL_HOURS)
  const [bump, setBump] = useState<{ h: number; n: number; id: number } | null>(null)
  const [extraRuns, setExtraRuns] = useState(0)

  // Each tick: the newest hour takes a batch of runs (sometimes a failure);
  // every HOUR_TICKS ticks the window rolls forward an hour.
  // The random draws happen here, once per tick, so the state updaters stay
  // pure (React may call them twice).
  const hoursRef = useRef(hours)
  hoursRef.current = hours
  useEffect(() => {
    if (tick === 0)
      return
    const roll = tick % HOUR_TICKS === 0
    const lastH = hoursRef.current[hoursRef.current.length - 1].h + (roll ? 1 : 0)
    const n = burst(lastH)
    const err = Math.random() < 0.12 ? 1 : 0
    setHours((prev) => {
      const next = roll ? [...prev.slice(1), { h: prev[prev.length - 1].h + 1, ok: 0, err: 0 }] : prev
      const last = next[next.length - 1]
      return [...next.slice(0, -1), { ...last, ok: last.ok + n, err: last.err + err }]
    })
    setBump({ h: lastH, n, id: tick })
    setExtraRuns(r => r + n + err)
  }, [tick])

  const max = Math.max(...hours.map(x => x.ok), 1)
  const runsToday = 1231 + extraRuns

  return (
    <div ref={ref} className='flex h-full flex-col font-mono'>
      <div className='grid flex-1 grid-cols-1 content-start gap-6 p-5 lg:grid-cols-[1fr_300px] lg:content-stretch lg:gap-8 lg:p-6'>
        <div className='min-w-0'>
          {/* KPIs */}
          <div className='grid grid-cols-3 divide-x divide-[var(--xl-border-subtle)]'>
            {[
              ['Runs today', <Ticker key='runs' value={runsToday} />, null],
              ['Current step', `${Math.min(step + 1, 4)}`, '/4'],
              ['Run status', done ? 'Completed' : 'Running', null],
            ].map(([k, v, sub], i) => (
              <div key={String(k)} className={cn(i > 0 && 'pl-4 sm:pl-5', i < 2 && 'pr-3')}>
                <div className='text-[10.5px] text-[var(--xl-txt4)] sm:text-[11px]'>{k}</div>
                <div className={cn('mt-1 truncate font-sans font-semibold tabular-nums', i === 2 ? 'text-[17px] sm:text-[22px]' : 'text-[22px] sm:text-[30px]', i === 2 ? (done ? 'text-[#28ac6a]' : '') : 'text-white')} style={i === 2 && !done ? { color: MON } : undefined}>
                  {v}
                  {sub && <span className='ml-0.5 text-[13px] font-normal text-[var(--xl-txt4)]'>{sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Hourly bars: dotted fill, runs above, errors below */}
          <div className='mt-6 flex items-end gap-1 overflow-hidden sm:gap-1.5'>
            <AnimatePresence initial={false} mode='popLayout'>
              {hours.map((x, i) => {
                const now = i === hours.length - 1
                return (
                  <motion.div
                    key={x.h}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                    className={cn('group min-w-0 flex-1 flex-col items-center', i < hours.length - 8 ? 'hidden sm:flex' : 'flex')}
                  >
                    <span className={cn('mb-2 truncate text-[9.5px] sm:text-[10.5px]', now ? 'text-white' : 'text-[var(--xl-txt4)]')}>{hourLabel(x.h)}</span>
                    <div className='relative flex h-[92px] w-full items-end sm:h-[110px]'>
                      <motion.div
                        className='xl-dotbar relative w-full rounded-t-[4px] border border-b-0 transition-[filter] duration-200 group-hover:brightness-150'
                        style={{ borderColor: now ? MON : `${MON}b3`, boxShadow: now ? `0 0 18px -4px ${MON}` : undefined }}
                        initial={{ height: 0 }}
                        animate={{ height: inView ? `${Math.max(4, (x.ok / max) * 100)}%` : 0 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 20, delay: inView && tick === 0 ? i * 0.04 : 0 }}
                      >
                        <AnimatePresence>
                          {bump && bump.h === x.h && (
                            <motion.span
                              key={bump.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: [0, 1, 1, 0], y: -18 }}
                              transition={{ duration: 1 }}
                              className='pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold'
                              style={{ color: MON }}
                            >
                              {`+${bump.n}`}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                    <span className='h-px w-full bg-[var(--xl-border-subtle)]' />
                    <span className='mt-1.5 text-[10.5px] font-semibold tabular-nums sm:text-[11.5px]' style={{ color: MON }}>
                      <Ticker value={x.ok} />
                    </span>
                    <span className={cn('text-[10.5px] tabular-nums sm:text-[11.5px]', x.err ? 'text-[#f97066]' : 'text-[var(--xl-txt4)]')}>{x.err}</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          <div className='mt-2 flex items-center gap-4 text-[10.5px] text-[var(--xl-txt4)]'>
            <span className='flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-sm' style={{ background: MON }} />
              Succeeded
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-sm bg-[#f97066]' />
              Failed
            </span>
          </div>
        </div>

        {/* The run in flight */}
        <div className='min-w-0 lg:border-l lg:border-[var(--xl-border-subtle)] lg:pl-8'>
          <div className='text-[11px] tracking-wide text-[var(--xl-txt4)]'>
            RUN
            {' '}
            {runNo.toLocaleString('en-US')}
            <span className='ml-2 text-[var(--xl-txt4)]'>· Voice · Front desk</span>
          </div>
          <div className='mt-3 space-y-0.5 font-sans'>
            {RUN_STEPS.slice(1, 4).map((name, i) => {
              const idx = i + 1
              const state = step > idx ? 'done' : step === idx ? 'running' : 'waiting'
              return (
                <div key={name} className='flex items-center justify-between gap-3 border-b border-[var(--xl-border-subtle)] py-2.5 last:border-0'>
                  <span className={cn('truncate text-[13.5px] transition-colors', state === 'waiting' ? 'text-[var(--xl-txt4)]' : 'text-white')}>{name}</span>
                  <span className={cn('flex shrink-0 items-center gap-1.5 font-mono text-[11.5px]', state === 'done' && 'text-[#28ac6a]', state === 'waiting' && 'text-[var(--xl-txt4)]')} style={state === 'running' ? { color: MON } : undefined}>
                    {state === 'running' && <RiLoader2Line className='h-3.5 w-3.5 animate-spin' />}
                    {state === 'done' && <RiCheckboxCircleFill className='h-3.5 w-3.5' />}
                    {state === 'done' ? 'Done' : state === 'running' ? 'Running' : 'Waiting'}
                  </span>
                </div>
              )
            })}
          </div>
          <div className='mt-4 grid grid-cols-2 gap-3 font-sans text-[12px]'>
            <div className='rounded-lg bg-white/[0.04] px-3 py-2'>
              <div className='text-[10.5px] text-[var(--xl-txt4)]'>Outcome</div>
              <div className={cn('font-semibold', done ? 'text-[#28ac6a]' : 'text-[var(--xl-txt3)]')}>{done ? 'Resolved' : '—'}</div>
            </div>
            <div className='rounded-lg bg-white/[0.04] px-3 py-2'>
              <div className='text-[10.5px] text-[var(--xl-txt4)]'>Sentiment</div>
              <div className={cn('font-semibold', done ? 'text-white' : 'text-[var(--xl-txt3)]')}>{done ? 'Positive' : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status line */}
      <div className='flex items-center justify-between gap-3 border-t border-[var(--xl-border-subtle)] px-5 py-3 lg:px-6'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.span
            key={`${step}-${paused}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className='flex min-w-0 items-center gap-2 text-[12px] text-[var(--xl-txt2)]'
          >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', !paused && !done && 'animate-pulse')} style={{ background: paused ? '#7e7795' : done ? '#28ac6a' : MON }} />
            <span className='truncate'>{paused ? 'Paused' : RUN_STEPS[step]}</span>
          </motion.span>
        </AnimatePresence>
        <button
          type='button'
          onClick={() => setPaused(p => !p)}
          aria-pressed={paused}
          className='flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--xl-border)] px-3 font-sans text-[12px] font-semibold text-white transition-colors hover:bg-white/[0.06]'
        >
          {paused ? <RiPlayFill className='h-3.5 w-3.5' /> : <RiPauseFill className='h-3.5 w-3.5' />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  )
}
