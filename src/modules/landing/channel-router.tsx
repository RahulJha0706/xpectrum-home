'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import {
  RiChatSmile3Line,
  RiCheckboxCircleFill,
  RiLinksLine,
  RiMailLine,
  RiMegaphoneLine,
  RiMessage2Line,
  RiPhoneLine,
  RiWhatsappLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { basePath } from '@/lib/var'

/* ─────────────────────────────────────────────────────────────────────────
   "One agent, every channel": six channels wired into one agent. Each beat,
   a message arrives on one channel, a pulse of light travels down its beam
   into the agent, and the agent card shows the conversation it is handling
   — the customer's message, the reply streaming in, and the outcome. The
   call-then-text pair shows the voice↔SMS continuity the product has.
   Conversations and counts are illustrative.
   ───────────────────────────────────────────────────────────────────────── */

type Channel = { key: string; label: string; icon: typeof RiPhoneLine; color: string; idle: string; live: string; base: number }

const CHANNELS: Channel[] = [
  { key: 'voice', label: 'Voice', icon: RiPhoneLine, color: '#d25cff', idle: 'Phone line', live: 'Incoming call', base: 412 },
  { key: 'sms', label: 'SMS', icon: RiMessage2Line, color: '#8b7bff', idle: 'Two-way texting', live: 'New text', base: 268 },
  { key: 'wa', label: 'WhatsApp', icon: RiWhatsappLine, color: '#34d399', idle: 'Business account', live: 'New message', base: 196 },
  { key: 'email', label: 'Email', icon: RiMailLine, color: '#22d3ee', idle: 'support@ inbox', live: 'New email', base: 143 },
  { key: 'web', label: 'Web chat', icon: RiChatSmile3Line, color: '#5a99eb', idle: 'Site chat bubble', live: 'Visitor typing', base: 231 },
  { key: 'batch', label: 'Batch calls', icon: RiMegaphoneLine, color: '#fbbf24', idle: 'Outbound campaigns', live: 'Campaign running', base: 58 },
]

const CONVOS = [
  { ch: 0, who: 'Maria Lopez', ask: 'Can I move my cleaning to Friday?', reply: 'Done. You’re booked for Friday at 10:30, and I’ll text you a confirmation.', outcome: 'Booked' },
  { ch: 1, who: 'Maria Lopez', ask: 'Thanks! Is parking free?', reply: 'Yes, free parking behind the building. See you Friday at 10:30!', outcome: 'Resolved', continued: true },
  { ch: 2, who: 'Dev Patel', ask: 'Is order #4471 out for delivery?', reply: 'Yes, it’s on the van now and arrives today before 6 pm.', outcome: 'Resolved' },
  { ch: 3, who: 'Priya Shah', ask: 'Invoice INV-2291 was charged twice.', reply: 'Sorry about that. I’ve refunded the duplicate; you’ll see it in 3–5 days.', outcome: 'Refunded' },
  { ch: 4, who: 'Website visitor', ask: 'Do you ship to Canada?', reply: 'We do: 5–7 business days, and orders over $80 ship free.', outcome: 'Resolved' },
  { ch: 5, who: 'Reminder campaign', ask: 'Calling 1,200 patients about tomorrow’s visits', reply: '612 reached so far, 41 rescheduled, the rest get a follow-up text.', outcome: 'In progress' },
]

// One beat = 9 ticks: 0-1 beam pulse · 2 message · 3-6 reply streams · 7-8 outcome.
const TICKS = 9
const TICK_MS = 420

const useRouter = () => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const [tick, setTick] = useState(0)
  const [still, setStill] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      setStill(true)
  }, [])
  useEffect(() => {
    if (!inView || still)
      return
    const t = setInterval(() => setTick(v => v + 1), TICK_MS)
    return () => clearInterval(t)
  }, [inView, still])
  const t = still ? TICKS + TICKS - 1 : tick
  const beat = Math.floor(t / TICKS)
  const sub = t % TICKS
  const convo = CONVOS[beat % CONVOS.length]
  // Completed conversations per channel, for the counters.
  const done = CHANNELS.map((_, i) => {
    const full = Math.floor(beat / CONVOS.length)
    const extra = CONVOS.slice(0, beat % CONVOS.length).filter(c => c.ch === i).length
    return full * CONVOS.filter(c => c.ch === i).length + extra + (sub >= 7 && convo.ch === i ? 1 : 0)
  })
  return { ref, beat, sub, convo, done }
}

/* ── Agent card ───────────────────────────────────────────────────────── */

const AgentCard = ({ beat, sub, convo, done, className }: ReturnType<typeof useRouter> & { className?: string }) => {
  const ch = CHANNELS[convo.ch]
  const shownReply = sub < 3 ? '' : sub >= 7 ? convo.reply : convo.reply.slice(0, Math.ceil(convo.reply.length * ((sub - 2) / 4)))
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(46,38,82,0.96),rgba(22,18,48,0.98))] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]', className)}>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60' style={{ background: `radial-gradient(60% 100% at 50% 0%, ${ch.color}40, transparent)` }} />
      {/* Header */}
      <div className='relative flex items-center gap-2.5 border-b border-white/10 px-4 py-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.08)]'>
          <img src={`${basePath}/logo/logo-embedded-chat-avatar.png`} alt='' className='h-5 w-5 object-contain' />
        </span>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-[13px] font-semibold text-white'>Front desk agent</div>
          <div className='truncate text-[10.5px] text-[var(--xl-txt4)]'>Every channel · one memory</div>
        </div>
        <span className='flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-300'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400' />
          Live
        </span>
      </div>

      {/* The conversation it's handling now */}
      <div className='relative px-4 pb-3 pt-3'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={beat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className='flex min-h-[176px] flex-col gap-2'
          >
            <div className='flex items-center gap-2 text-[11px]'>
              <span className='flex h-5 w-5 items-center justify-center rounded-md' style={{ background: `${ch.color}26`, color: ch.color }}>
                <ch.icon className='h-3 w-3' />
              </span>
              <span className='font-semibold' style={{ color: ch.color }}>{ch.label}</span>
              <span className='truncate text-[var(--xl-txt4)]'>{`· ${convo.who}`}</span>
            </div>
            {convo.continued && sub >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center gap-1 self-start rounded-md bg-[#d25cff1a] px-1.5 py-0.5 text-[10px] text-[#e39bff]'>
                <RiLinksLine className='h-3 w-3' />
                Picked up from this morning’s call
              </motion.div>
            )}
            {sub >= 2 && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className='max-w-[92%] self-end rounded-2xl rounded-br-md bg-white/[0.08] px-3 py-2 text-[12px] leading-snug text-[var(--xl-txt2)]'>
                {convo.ask}
              </motion.div>
            )}
            {sub >= 3 && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className='max-w-[92%] self-start rounded-2xl rounded-bl-md bg-[#1966ca] px-3 py-2 text-[12px] leading-snug text-white'>
                {shownReply}
                {sub < 7 && <span className='ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-white' />}
              </motion.div>
            )}
            {sub < 2 && (
              <div className='flex items-center gap-2 text-[11.5px] text-[var(--xl-txt4)]'>
                <span className='flex gap-1'>
                  {[0, 150, 300].map(d => <span key={d} className='h-1.5 w-1.5 animate-bounce rounded-full' style={{ background: ch.color, animationDelay: `${d}ms` }} />)}
                </span>
                {ch.live}
                …
              </div>
            )}
            <AnimatePresence>
              {sub >= 7 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='mt-auto flex items-center gap-1.5 self-start rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300'>
                  <RiCheckboxCircleFill className='h-3.5 w-3.5' />
                  {convo.outcome}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Handled today, per channel */}
      <div className='grid grid-cols-6 border-t border-white/10'>
        {CHANNELS.map((c, i) => (
          <div key={c.key} className={cn('flex flex-col items-center gap-0.5 py-2.5 transition-colors duration-300', i === convo.ch && 'bg-white/[0.05]')}>
            <c.icon className='h-3.5 w-3.5' style={{ color: c.color }} />
            <span className='text-[10.5px] font-semibold tabular-nums text-white'>{c.base + done[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Channel card ─────────────────────────────────────────────────────── */

const ChannelCard = ({ c, active, compact }: { c: Channel; active: boolean; compact?: boolean }) => (
  <div
    className={cn('relative flex items-center gap-2.5 rounded-xl border transition-all duration-300', compact ? 'px-2 py-2' : 'px-3 py-2.5', active ? 'bg-[#221a47]' : 'border-white/[0.08] bg-[#15112f]')}
    style={active ? { borderColor: c.color, boxShadow: `0 0 0 3px ${c.color}22, 0 0 28px -4px ${c.color}99` } : undefined}
  >
    <span className={cn('flex shrink-0 items-center justify-center rounded-lg', compact ? 'h-7 w-7' : 'h-8 w-8')} style={{ background: `${c.color}${active ? '33' : '1f'}`, color: c.color }}>
      <c.icon className='h-4 w-4' />
    </span>
    <span className='min-w-0 flex-1'>
      <span className='block truncate text-[12.5px] font-semibold text-white'>{c.label}</span>
      {!compact && (
        <span className={cn('block truncate text-[10.5px] transition-colors', active ? '' : 'text-[var(--xl-txt4)]')} style={active ? { color: c.color } : undefined}>
          {active ? c.live : c.idle}
        </span>
      )}
    </span>
    {active && (
      <span className='relative ml-auto flex h-2 w-2 shrink-0'>
        <span className='absolute inset-0 animate-ping rounded-full opacity-60' style={{ background: c.color }} />
        <span className='relative h-2 w-2 rounded-full' style={{ background: c.color }} />
      </span>
    )}
  </div>
)

/* ── Desktop: channels on the left, beams into the agent on the right ─── */

const W = 580
const H = 500
const CARD_W = 172
const CARD_H = 58
const GAP = 22
const TOP = (H - (CHANNELS.length * CARD_H + (CHANNELS.length - 1) * GAP)) / 2
const AGENT_X = 272
const JOIN_Y = H / 2
const cardY = (i: number) => TOP + i * (CARD_H + GAP)
const beam = (i: number) => {
  const y = cardY(i) + CARD_H / 2
  const x1 = CARD_W
  const mx = (x1 + AGENT_X) / 2
  return `M${x1},${y} C${mx},${y} ${mx},${JOIN_Y} ${AGENT_X},${JOIN_Y}`
}

const Stage = (r: ReturnType<typeof useRouter>) => {
  const active = r.convo.ch
  return (
    <div className='relative' style={{ width: W, height: H }}>
      <div className='pointer-events-none absolute left-[240px] top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,92,255,0.28),rgba(25,102,202,0.12)_55%,transparent)]' />
      <svg className='absolute inset-0 overflow-visible' width={W} height={H} aria-hidden>
        <defs>
          {CHANNELS.map((c, i) => (
            <linearGradient key={c.key} id={`xl-beam-${i}`} gradientUnits='userSpaceOnUse' x1={CARD_W} y1={0} x2={AGENT_X} y2={0}>
              <stop offset='0' stopColor={c.color} stopOpacity='0.55' />
              <stop offset='1' stopColor='#8b7bff' stopOpacity='0.35' />
            </linearGradient>
          ))}
        </defs>
        {CHANNELS.map((c, i) => (
          <path key={c.key} d={beam(i)} fill='none' stroke={`url(#xl-beam-${i})`} strokeWidth={i === active ? 1.8 : 1.1} strokeOpacity={i === active ? 1 : 0.55} className='transition-all duration-300' />
        ))}
        {/* The message travelling down the active beam. */}
        {r.sub < 3 && (
          <motion.path
            key={r.beat}
            d={beam(active)}
            fill='none'
            stroke={CHANNELS[active].color}
            strokeWidth={3}
            strokeLinecap='round'
            pathLength={1}
            strokeDasharray='0.16 1'
            initial={{ strokeDashoffset: 0.16 }}
            animate={{ strokeDashoffset: -1 }}
            transition={{ duration: 0.8, ease: 'easeIn' }}
            style={{ filter: `drop-shadow(0 0 6px ${CHANNELS[active].color})` }}
          />
        )}
        <circle cx={AGENT_X} cy={JOIN_Y} r={5} fill='#15112f' stroke={CHANNELS[active].color} strokeWidth={2} className='transition-[stroke] duration-300' />
      </svg>
      {CHANNELS.map((c, i) => (
        <div key={c.key} className='absolute left-0' style={{ top: cardY(i), width: CARD_W, height: CARD_H }}>
          <ChannelCard c={c} active={i === active} />
        </div>
      ))}
      <div className='absolute top-1/2 -translate-y-1/2' style={{ left: AGENT_X, width: W - AGENT_X }}>
        <AgentCard {...r} />
      </div>
    </div>
  )
}

const ChannelRouter = () => {
  const r = useRouter()
  return (
    <div ref={r.ref} className='w-full'>
      {/* sm and up: the wired stage (scaled a touch on narrower columns). */}
      <div className='hidden justify-center sm:flex'>
        <div className='origin-top lg:scale-[0.78] xl:scale-[0.92]'>
          <Stage {...r} />
        </div>
      </div>
      {/* Phones: channel chips, then the agent card. */}
      <div className='sm:hidden'>
        <div className='grid grid-cols-2 gap-2'>
          {CHANNELS.map((c, i) => <ChannelCard key={c.key} c={c} active={i === r.convo.ch} compact />)}
        </div>
        <div className='mx-auto h-5 w-px bg-gradient-to-b from-[#8b7bff] to-transparent' />
        <AgentCard {...r} />
      </div>
    </div>
  )
}

export default ChannelRouter
