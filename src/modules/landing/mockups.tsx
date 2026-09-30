'use client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RiBrainFill,
  RiChatCheckLine,
  RiCheckLine,
  RiCheckboxCircleFill,
  RiFlashlightFill,
  RiGlobalLine,
  RiLoader2Line,
  RiLoader4Line,
  RiMessage3Fill,
  RiPhoneFill,
  RiSearchEyeFill,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import type { DemoState, NodeId } from './hero-demo'
import { Graph } from './walkthrough/canvas'
import type { GEdge, GNode, NodeStatus } from './walkthrough/canvas'
import { callClock } from './hero-demo'

/* ── Flow card ────────────────────────────────────────────────────────────
   The front-desk Agent Flow on the real canvas replica (walkthrough/canvas),
   so it runs exactly like the product: one node at a time gets the blue
   running ring and spinner, finished nodes turn green with a check, nodes
   not yet reached sit at 70%, and reached wires become a still green→blue
   gradient. No moving wires, no times on the cards. */

// The blocks, named, iconned and coloured as in the app's block picker
// (components/shell/workflow/block-meta.ts, block-category.ts).
const FLOW = [
  { id: 'trigger', title: 'Trigger', sub: 'Inbound call', icon: RiFlashlightFill, color: '#296dff' },
  { id: 'agent', title: 'AI Model', sub: 'Ada, receptionist', icon: RiBrainFill, color: '#6172f3' },
  { id: 'kb', title: 'Knowledge Search', sub: 'Practice handbook', icon: RiSearchEyeFill, color: '#17b26a' },
  { id: 'action', title: 'HTTP Request', sub: 'Check availability', icon: RiGlobalLine, color: '#ee46bc' },
] as const

// Desktop: left to right. Phones: top to bottom.
type FlowLayout = 'wide' | 'tall' | 'hero'
const AT: Record<FlowLayout, Record<NodeId, [number, number]>> = {
  wide: { trigger: [0, 52], agent: [200, 0], kb: [200, 104], action: [400, 52] },
  // Desktop hero: landscape, with 140px cards so it stays wide but compact.
  hero: { trigger: [0, 52], agent: [186, 0], kb: [186, 104], action: [372, 52] },
  tall: { trigger: [94, 0], agent: [0, 120], kb: [188, 120], action: [94, 240] },
}
const FLOW_EDGES: GEdge[] = [
  { from: 'trigger', to: 'agent' },
  { from: 'trigger', to: 'kb' },
  { from: 'agent', to: 'action' },
  { from: 'kb', to: 'action' },
]

const flowStatus = (state: DemoState, id: NodeId): NodeStatus => {
  if (state.node === id)
    return 'running'
  return state.done.includes(id) ? 'done' : 'idle'
}

export const WorkflowMock = ({ state, className, layout = 'wide' }: { state: DemoState; className?: string; layout?: FlowLayout }) => {
  const live = state.phase === 'live'
  const nodes: GNode[] = FLOW.map((f) => {
    const status = flowStatus(state, f.id)
    return {
      ...f,
      x: AT[layout][f.id][0],
      y: AT[layout][f.id][1],
      configured: true,
      input: f.id !== 'trigger',
      output: f.id !== 'action',
      status,
      waiting: live && status === 'idle',
    }
  })
  const done = state.phase === 'ended'
  return (
    <div className={cn('xl-card overflow-hidden', className)}>
      <div className='flex items-center justify-between border-b border-[var(--xl-border-subtle)] px-4 py-2.5'>
        <div className='flex items-center gap-2'>
          <span className='h-2.5 w-2.5 rounded-full bg-[#ff5f57]' />
          <span className='h-2.5 w-2.5 rounded-full bg-[#febc2e]' />
          <span className='h-2.5 w-2.5 rounded-full bg-[#28c840]' />
          <span className='ml-3 text-xs font-medium text-[var(--xl-txt3)]'>Front desk · Flow</span>
        </div>
        <span className={cn('flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold', done ? 'bg-[#28ac6a26] text-[#28ac6a]' : 'bg-[#1f2b5e] text-[#5a99eb]')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', done ? 'bg-[#28ac6a]' : 'bg-[#5a99eb]')} />
          {done ? 'Completed' : state.phase === 'ringing' ? 'Waiting for a call' : 'Running…'}
        </span>
      </div>
      <div className='xl-app-canvas relative' style={{ height: layout === 'tall' ? 350 : layout === 'hero' ? 226 : 222 }}>
        <Graph nodes={nodes} edges={FLOW_EDGES} vertical={layout === 'tall'} nodeW={layout === 'hero' ? 156 : undefined} zoom={false} pad={10} className='inset-0' />
      </div>
    </div>
  )
}

/* ── Phone: the live call ─────────────────────────────────────────────── */

const Waveform = ({ speaking }: { speaking: DemoState['speaking'] }) => (
  <div className='mt-3 flex h-8 items-center gap-[3px]' aria-hidden>
    {Array.from({ length: 22 }).map((_, i) => (
      <span
        key={i}
        className={cn(
          'w-[3px] rounded-full bg-gradient-to-t transition-all duration-300',
          speaking === 'caller' ? 'from-[#7c5cff] to-[#d25cff]' : 'from-[#5a99eb] to-[#22d3ee]',
          speaking ? 'xl-wave-bar opacity-100' : 'opacity-40',
        )}
        style={{ height: speaking ? `${10 + ((i * 37) % 22)}px` : '4px', animationDelay: `${(i % 7) * 0.12}s` }}
      />
    ))}
  </div>
)

export const PhoneMock = ({ state, elapsed, className }: { state: DemoState; elapsed: number; className?: string }) => {
  const recent = state.messages.slice(-3)
  return (
    <div className={cn('relative w-[250px] rounded-[36px] border border-white/15 bg-[#07051a] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]', className)}>
      <div className='relative flex h-[400px] flex-col overflow-hidden rounded-[28px] bg-gradient-to-b from-[#1a1540] to-[#0d0a26]'>
        <div className='mx-auto mt-2 h-5 w-20 shrink-0 rounded-full bg-black' />

        <AnimatePresence mode='wait' initial={false}>
          {state.phase === 'ringing'
            ? (
              <motion.div
                key='ringing'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className='flex min-h-0 flex-1 flex-col items-center justify-between px-4 pb-7 pt-7'
              >
                <div className='text-center'>
                  <div className='text-[11px] uppercase tracking-[0.2em] text-[var(--xl-txt4)]'>Incoming call</div>
                  <div className='xl-display mt-2 text-xl font-semibold text-white'>+1 (415) 555-0132</div>
                  <div className='mt-1 text-[12px] text-[var(--xl-txt4)]'>Bright Smile Dental line</div>
                </div>
                <div className='relative flex h-20 w-20 items-center justify-center'>
                  <span className='xl-pulse-ring absolute inset-0 rounded-full bg-emerald-400/40' />
                  <span className='xl-pulse-ring absolute inset-0 rounded-full bg-emerald-400/30 [animation-delay:0.8s]' />
                  <span className='relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]'>
                    <RiPhoneFill className='h-7 w-7 animate-[xl-ring_0.9s_ease-in-out_infinite] text-white' />
                  </span>
                </div>
                <div className='text-[11px] text-[var(--xl-txt4)]'>Ada is picking up…</div>
              </motion.div>
            )
            : (
              <motion.div key='live' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex min-h-0 flex-1 flex-col'>
                <div className='flex flex-col items-center px-4 pb-2 pt-4'>
                  <div className='relative flex h-14 w-14 items-center justify-center'>
                    {state.speaking === 'agent' && <span className='xl-pulse-ring absolute inset-0 rounded-full bg-[#22d3ee]/40' />}
                    <span className='relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1966ca] to-[#7c5cff]'>
                      <span className='xl-display text-[22px] font-semibold leading-none text-white'>A</span>
                    </span>
                  </div>
                  <div className='mt-2 text-sm font-semibold text-white'>Ada</div>
                  <div className='text-[11px] tabular-nums text-[var(--xl-txt4)]'>
                    {state.phase === 'ended' ? 'Call ended' : 'Dental practice'}
                    {' · '}
                    {callClock(state, elapsed)}
                  </div>
                  <Waveform speaking={state.speaking} />
                </div>
                <div className='flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 pb-4'>
                  <AnimatePresence initial={false}>
                    {recent.map(m => (
                      <motion.div
                        key={m.text}
                        layout
                        initial={{ opacity: 0, y: 12, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className={cn(
                          'max-w-[88%] rounded-2xl px-3 py-1.5 text-[11.5px] leading-snug',
                          m.from === 'agent'
                            ? 'self-start rounded-bl-md bg-[#1966ca] text-white'
                            : 'self-end rounded-br-md bg-white/10 text-[var(--xl-txt2)]',
                        )}
                      >
                        {m.text}
                      </motion.div>
                    ))}
                    {state.tool && (
                      <motion.div
                        key={`tool-${state.tool.label}`}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className='flex items-center gap-1.5 self-start rounded-lg border border-[#22d3ee40] bg-[#22d3ee12] px-2 py-1 font-mono text-[10px] text-[#67e8f9]'
                      >
                        {state.tool.ok
                          ? <RiCheckLine className='h-3 w-3 text-emerald-300' />
                          : <RiLoader4Line className='h-3 w-3 animate-spin' />}
                        {state.tool.label}
                      </motion.div>
                    )}
                    {state.typing && !state.tool && (
                      <motion.div
                        key='typing'
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className='flex gap-1 self-start rounded-2xl rounded-bl-md bg-[#1966ca]/60 px-3 py-2.5'
                      >
                        {[0, 1, 2].map(i => (
                          <span key={i} className='h-1.5 w-1.5 animate-bounce rounded-full bg-white/90' style={{ animationDelay: `${i * 0.12}s` }} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {/* The confirmation text lands on the same phone, like it would. */}
        <AnimatePresence>
          {state.sms && (
            <motion.div
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className='absolute inset-x-2 top-9 rounded-2xl border border-white/15 bg-[#2a2350] p-2.5 shadow-2xl'
            >
              <div className='flex items-center gap-1.5 text-[10px] text-[var(--xl-txt4)]'>
                <span className='flex h-4 w-4 items-center justify-center rounded bg-emerald-500'>
                  <RiMessage3Fill className='h-2.5 w-2.5 text-white' />
                </span>
                MESSAGES · now
              </div>
              <div className='mt-1 text-[11.5px] font-semibold text-white'>Bright Smile Dental</div>
              <div className='text-[11px] leading-snug text-[var(--xl-txt2)]'>You’re confirmed for Fri 10:30. Reply C to cancel.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Outcome chip: what the call analysis writes afterwards ─────────── */

export const OutcomeChip = ({ show, className }: { show: boolean; className?: string }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={cn('xl-card flex items-center gap-3 px-4 py-3', className)}
      >
        <span className='flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300'>
          <RiCheckboxCircleFill className='h-5 w-5' />
        </span>
        <div>
          <div className='text-[11px] text-[var(--xl-txt4)]'>Call outcome · from transcript</div>
          <div className='flex items-baseline gap-1.5'>
            <span className='xl-display text-[17px] font-semibold text-white'>Resolved</span>
            <span className='flex items-center gap-0.5 text-[11px] font-semibold text-emerald-300'>
              <RiFlashlightFill className='h-3 w-3' />
              Positive
            </span>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

/* ── Tool-call chip: the API call the agent is making right now ─────── */

export const ToolChip = ({ tool, className }: { tool: DemoState['tool']; className?: string }) => (
  <AnimatePresence mode='wait'>
    {tool && (
      <motion.div
        key={tool.label}
        initial={{ opacity: 0, x: -16, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className={cn('xl-card flex items-center gap-3 px-4 py-3', className)}
      >
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', tool.ok ? 'bg-emerald-400/15 text-emerald-300' : 'bg-[#22d3ee1f] text-[#22d3ee]')}>
          {tool.ok ? <RiCheckLine className='h-5 w-5' /> : <RiLoader4Line className='h-5 w-5 animate-spin' />}
        </span>
        <div>
          <div className='text-[11px] text-[var(--xl-txt4)]'>{tool.ok ? 'Tool call · 212 ms' : 'Calling your API…'}</div>
          <div className='font-mono text-[12.5px] text-[#67e8f9]'>{tool.label}</div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

/* ── Steps card ────────────────────────────────────────────────────────────
   The run panel's Steps list (run/node.tsx): uppercase block titles, a
   "Running" spinner on the current step, then its time in the app's format
   ("184.212 ms", "1.036 s") with tokens where a model ran, and a green check.
   The outcome line matches run-outcome.tsx. */

const STEPS = [
  { name: 'Trigger', time: '12.084 ms', icon: RiFlashlightFill, color: '#296dff', done: (s: DemoState) => s.phase !== 'ringing' },
  { name: 'AI Model', time: '640.518 ms', tokens: 312, icon: RiBrainFill, color: '#6172f3', done: (s: DemoState) => s.messages.length >= 1 },
  { name: 'Knowledge Search', time: '184.212 ms', icon: RiSearchEyeFill, color: '#17b26a', done: (s: DemoState) => s.done.includes('kb') },
  { name: 'HTTP Request', time: '212.930 ms', icon: RiGlobalLine, color: '#ee46bc', done: (s: DemoState) => s.messages.length >= 3 },
  { name: 'HTTP Request', time: '198.447 ms', icon: RiGlobalLine, color: '#ee46bc', done: (s: DemoState) => s.messages.length >= 5 },
  { name: 'Answer', time: '38.105 ms', icon: RiChatCheckLine, color: '#f04438', done: (s: DemoState) => s.sms },
]

export const TraceCard = ({ state, className }: { state: DemoState; className?: string }) => {
  const doneCount = STEPS.filter(t => t.done(state)).length
  const finished = doneCount === STEPS.length
  const live = state.phase === 'live'
  // Rows appear as steps start, like the app's trace list.
  const shown = Math.min(STEPS.length, doneCount + (live && !finished ? 1 : 0))
  return (
    <div className={cn('xl-card p-3', className)}>
      <div className={cn('flex items-center justify-between rounded-lg border border-[var(--xl-border-subtle)] px-2.5 py-1.5', finished ? 'bg-[#28ac6a26]' : 'bg-[#1f2b5e66]')}>
        <span className='flex items-center gap-2 text-[11.5px] font-semibold text-white'>
          <span className={cn('h-1.5 w-1.5 rounded-full', finished ? 'bg-[#28ac6a]' : 'bg-[#5a99eb]')} />
          {finished ? 'Completed' : live ? 'Running…' : 'Waiting for a call'}
        </span>
        {finished
          ? (
            <span className='flex items-center gap-2 text-[10.5px] tabular-nums text-[var(--xl-txt3)]'>
              1.286s
              <span className='h-3 w-px bg-white/15' />
              1,240 tokens
            </span>
          )
          : <span className='h-1.5 w-12 rounded-sm bg-[#7e7795]/40' />}
      </div>
      <div className='mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--xl-txt4)]'>
        Steps
        <span className='ml-1.5 text-[#7e7795]'>{shown}</span>
      </div>
      <div className='mt-1.5 space-y-1'>
        {STEPS.slice(0, shown).map((t, i) => {
          const done = t.done(state)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex items-center gap-1.5 rounded-lg border border-[var(--xl-border-subtle)] bg-[#0a0826] py-1 pl-1.5 pr-2'
            >
              <span className='flex h-4 w-4 shrink-0 items-center justify-center rounded text-white' style={{ background: t.color }}>
                <t.icon className='h-2.5 w-2.5' />
              </span>
              <span className='min-w-0 grow truncate text-[10px] font-semibold uppercase text-[var(--xl-txt3)]'>{t.name}</span>
              {done
                ? (
                  <span className='flex shrink-0 items-center text-[10px] tabular-nums text-[var(--xl-txt4)]'>
                    {t.tokens ? `${t.tokens} tokens · ` : ''}
                    {t.time}
                    <RiCheckboxCircleFill className='ml-1.5 h-3 w-3 text-[#28ac6a]' />
                  </span>
                )
                : (
                  <span className='flex shrink-0 items-center text-[10.5px] font-medium text-[#5a99eb]'>
                    <span className='mr-1'>Running</span>
                    <RiLoader2Line className='h-3 w-3 animate-spin' />
                  </span>
                )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
