'use client'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiCheckLine } from '@remixicon/react'
import cn from '@/lib/classnames'
import { SectionHeading } from '../ui'
import { Cursor, MobileCrumbs, Sidebar } from './chrome'
import { CanvasScene, ListScene, PhoneScene } from './scenes'
import { CHAPTERS, chapterLen, useWalkthrough } from './script'
import type { S } from './script'

/* ─────────────────────────────────────────────────────────────────────────
   "Watch someone build their first agent": an animated replica of the real
   workspace, not a video. Labels, block names, colours and steps come from
   the app (sidebar.tsx, create-app-modal, the agent flow-canvas and
   config-dock, block-selector, the Preview and Test Run panels,
   app-publisher, omnichannel/phone-numbers-panel) and its xp-kb tokens.
   See ./script.ts for the timeline, ./scenes.tsx for the screens.
   ───────────────────────────────────────────────────────────────────────── */

const URLS: Record<string, string> = {
  'agent-list': 'app.xpectrum.ai/agents/chat?category=autonomous-agent',
  'agent-canvas': 'app.xpectrum.ai/agents/front-desk/settings',
  'workflow-list': 'app.xpectrum.ai/agents/automation?category=workflow',
  'workflow-canvas': 'app.xpectrum.ai/agents/appointment-reminders/flow',
  'phone': 'app.xpectrum.ai/omnichannel?tab=phone-numbers',
}

const ProgressBar = ({ i, run, playing, className }: { i: number; run: number; playing: boolean; className?: string }) => (
  <span
    key={`${run}-${i}`}
    className={cn('xl-chapter-bar absolute origin-left bg-gradient-to-r from-[var(--xl-cyan)] to-[var(--xl-violet)]', className)}
    style={{ animationDuration: `${chapterLen(i)}ms`, animationPlayState: playing ? 'running' : 'paused' }}
  />
)

// Phones: one caption strip right under the window, so the step being played
// is always on screen next to it.
const MobileChapters = ({ s, playing, run, jump }: { s: S; playing: boolean; run: number; jump: (i: number) => void }) => {
  const c = CHAPTERS[s.chapter]
  return (
    <div className='mt-4 sm:hidden'>
      <div className='flex gap-1.5'>
        {CHAPTERS.map((ch, i) => (
          <button key={ch.title} type='button' aria-label={ch.title} onClick={() => jump(i)} className='flex h-8 flex-1 items-center'>
            <span className='relative h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
              {i < s.chapter && <span className='absolute inset-0 bg-[var(--xl-sky)]' />}
              {i === s.chapter && <ProgressBar i={i} run={run} playing={playing} className='inset-0' />}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode='wait' initial={false}>
        <motion.div key={s.chapter} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className='mt-3'>
          <div className='text-[12px] font-semibold text-[var(--xl-sky)]'>{`0${s.chapter + 1} · ${c.title}`}</div>
          <p className='mt-1 text-[14px] leading-snug text-[var(--xl-txt3)]'>{c.blurb}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const AgentWalkthrough = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const { state: s, playing, run, jump } = useWalkthrough(rootRef)
  const sceneKey = s.scene === 'phone' ? 'phone' : `${s.kind}-${s.scene}`

  return (
    <section id='how-it-works' className='relative overflow-x-clip py-16 lg:py-20'>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
        <SectionHeading
          className='mx-auto text-center'
          eyebrow='How it works'
          title='Watch someone build their first agent'
          body='This is the real Xpectrum workspace, step by step: create an agent, configure and test it, publish it, give it a phone number, then automate the busywork with a workflow.'
        />

        <div ref={rootRef} className='relative mt-12'>
          <div className='absolute -inset-x-6 -inset-y-10 -z-10 rounded-[48px] bg-[radial-gradient(closest-side,rgba(109,40,217,0.3),transparent)] blur-2xl' aria-hidden />

          {/* App window */}
          <div className='border-white/12 overflow-hidden rounded-2xl border bg-[#0a0826] shadow-[0_50px_120px_-30px_rgba(25,102,202,0.45),0_30px_60px_-30px_rgba(0,0,0,0.8)]'>
            <div className='flex h-9 items-center gap-2 border-b border-white/10 bg-[#0d0a26] px-3'>
              <span className='h-2.5 w-2.5 rounded-full bg-[#ff5f57]' />
              <span className='h-2.5 w-2.5 rounded-full bg-[#febc2e]' />
              <span className='h-2.5 w-2.5 rounded-full bg-[#28c840]' />
              <span className='mx-auto max-w-[70%] truncate rounded-md bg-white/5 px-4 py-0.5 text-[11px] text-[#9d96b3]'>{URLS[sceneKey]}</span>
            </div>
            <div ref={stageRef} className='relative flex h-[600px] bg-[linear-gradient(176deg,#0a0826,#151236)] md:h-[580px]'>
              <Sidebar s={s} />
              <div className='relative flex min-w-0 flex-1 flex-col'>
                <MobileCrumbs s={s} />
                <AnimatePresence mode='wait' initial={false}>
                  <motion.div
                    key={sceneKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className='flex min-h-0 flex-1 flex-col'
                  >
                    {s.scene === 'list' && <ListScene s={s} />}
                    {s.scene === 'canvas' && <CanvasScene s={s} />}
                    {s.scene === 'phone' && <PhoneScene s={s} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {s.toast && (
                  <motion.div
                    key={s.toast}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className='absolute left-1/2 top-3 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-[#7e72a8] bg-[#3d335f] px-3 py-1.5 text-[12px] font-medium text-white shadow-xl'
                  >
                    <RiCheckLine className='h-3.5 w-3.5 text-emerald-300' />
                    {s.toast}
                  </motion.div>
                )}
              </AnimatePresence>

              <Cursor s={s} stageRef={stageRef} />
            </div>
          </div>

          <MobileChapters s={s} playing={playing} run={run} jump={jump} />

          {/* Chapters: explain what's happening, show progress, and jump. */}
          <div className='mt-6 hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3'>
            {CHAPTERS.map((c, i) => {
              const active = s.chapter === i
              return (
                <button
                  key={c.title}
                  type='button'
                  onClick={() => jump(i)}
                  className={cn('relative flex flex-col items-start justify-start overflow-hidden rounded-xl border p-4 text-left transition-colors', active ? 'border-[var(--xl-sky)] bg-white/[0.06]' : 'border-[var(--xl-border-subtle)] hover:bg-white/[0.04]')}
                >
                  <div className={cn('text-[12px] font-semibold', active ? 'text-[var(--xl-sky)]' : 'text-[var(--xl-txt4)]')}>{`0${i + 1}`}</div>
                  <div className='mt-1 text-[15px] font-semibold text-white'>{c.title}</div>
                  <div className='mt-1 text-[13px] leading-snug text-[var(--xl-txt3)]'>{c.blurb}</div>
                  {active && <ProgressBar i={i} run={run} playing={playing} className='inset-x-0 bottom-0 h-[3px]' />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AgentWalkthrough
