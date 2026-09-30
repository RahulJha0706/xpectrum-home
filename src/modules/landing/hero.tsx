'use client'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { RiCheckLine } from '@remixicon/react'
import GradientCanvas from './gradient-canvas'
import type { VoiceSignal } from './gradient-canvas'
import { useDemoTimeline } from './hero-demo'
import type { DemoState } from './hero-demo'
import { Button } from './button'
import { OutcomeChip, PhoneMock, ToolChip, TraceCard, WorkflowMock } from './mockups'

// The channels one agent answers. Rotating them in the headline says
// "omnichannel" in the time it takes to glance at it.
const WORDS = ['call', 'text', 'email', 'WhatsApp', 'chat']

const RotatingWord = () => {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    const t = setInterval(() => setI(v => (v + 1) % WORDS.length), 2200)
    return () => clearInterval(t)
  }, [])
  return (
    <span key={WORDS[i]} className='xl-word-in xl-gradient-text inline-block pb-[0.08em]'>
      {WORDS[i]}
      .
    </span>
  )
}

// Delay for the CSS entrance of each hero block, in order.
const rise = (i: number) => ({ '--d': `${0.06 + i * 0.08}s` }) as CSSProperties

// Named for what they are — the services Xpectrum runs on — not as customers.
const RUNS_ON = ['Twilio', 'LiveKit', 'WhatsApp Business', 'ElevenLabs', 'Deepgram', 'MCP']

// One line narrating what the demo is doing right now, so the copy on the
// left and the animation on the right read as one story.
const narrate = (s: DemoState) => {
  if (s.phase === 'ringing')
    return 'Incoming call…'
  if (s.outcome)
    return 'Resolved · booked in one call'
  if (s.sms)
    return 'Confirmation texted to the caller'
  if (s.tool)
    return s.tool.label.startsWith('search') ? 'Searching the practice handbook' : s.tool.label.startsWith('check') ? 'Checking Friday availability' : 'Booking Friday at 10:30'
  if (s.speaking === 'caller')
    return 'Caller is speaking'
  if (s.speaking === 'agent')
    return 'Ada is answering'
  return 'Ada is thinking…'
}

const LiveStatus = ({ state }: { state: DemoState }) => {
  const text = narrate(state)
  return (
    <div className='border-white/12 inline-flex max-w-full items-center gap-2.5 rounded-full border bg-[rgba(20,16,50,0.7)] py-1.5 pl-2 pr-4 text-[13px]'>
      <span className='flex items-center gap-1.5 rounded-full bg-[#22d3ee1a] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--xl-cyan)]'>
        <span className='relative flex h-1.5 w-1.5'>
          <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--xl-cyan)] opacity-75' />
          <span className='relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--xl-cyan)]' />
        </span>
        Live demo
      </span>
      <span className='relative h-5 min-w-0 flex-1 overflow-hidden'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.span
            key={text}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='block truncate leading-5 text-[var(--xl-txt2)]'
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

const Hero = () => {
  const { state, elapsed } = useDemoTimeline()
  // The aurora behind the hero listens to who is speaking in the demo.
  const voice = useRef<VoiceSignal>({ speaking: null })
  voice.current.speaking = state.speaking

  // Pointer tilt for the mock-up stage: the whole stage turns a few degrees
  // toward the pointer, as one piece.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 20 })
  const sy = useSpring(my, { stiffness: 80, damping: 20 })
  const tiltX = useTransform(sy, v => v * -7)
  const tiltY = useTransform(sx, v => v * 9)

  return (
    <section
      className='relative isolate overflow-hidden pb-16 pt-24 sm:pt-28 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-16 lg:pt-24'
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
    >
      <div className='xl-hero-field -z-10' aria-hidden>
        {/* A static CSS aurora that matches the shader's first frame, so a
            refresh shows the same scene at once and WebGL takes over
            without a visible change. */}
        <div className='xl-aurora-fallback absolute inset-0' />
        <GradientCanvas className='absolute inset-0 h-full w-full' voice={voice} />
        <div className='xl-hero-veil' />
      </div>

      <div className='mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:gap-10'>
        <div className='min-w-0'>
          {/* Sized against viewport height as well as width, so the whole
              hero — headline to CTA — fits on a laptop screen. */}
          <div style={rise(0)} className='xl-rise mb-6'>
            <LiveStatus state={state} />
          </div>
          <h1 style={rise(0)} className='xl-rise xl-display xl-hero-title font-semibold text-white'>
            <span className='sr-only'>AI agents that answer every call, text, email, WhatsApp and chat.</span>
            <span aria-hidden>
              AI agents that
              <br />
              answer every
              <br />
              <RotatingWord />
            </span>
          </h1>

          <p style={rise(1)} className='xl-rise mt-5 max-w-[520px] text-[17px] leading-relaxed text-[var(--xl-txt3)] lg:text-[18px]'>
            Pick up every call, reply to every text and email, and book the appointment, day or night.
            Build it on a visual canvas, ground it in your knowledge, and go live in minutes.
          </p>

          <div style={rise(2)} className='xl-rise mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4'>
            <Button href='/auth/signup' size='lg'>Get started</Button>
            <span className='text-[13.5px] text-[var(--xl-txt4)]'>
              Pay per execution.
              <br className='hidden sm:block' />
              {' '}
              No markup on models or telephony.
            </span>
          </div>

          <ul style={rise(3)} className='xl-rise mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-[var(--xl-txt3)]'>
            {['Voice, SMS, WhatsApp, email & chat', 'Test calls in your browser', 'Separate client workspaces'].map(t => (
              <li key={t} className='flex items-center gap-1.5'>
                <RiCheckLine className='h-4 w-4 text-[var(--xl-cyan)]' />
                {t}
              </li>
            ))}
          </ul>

          <div style={rise(4)} className='xl-rise mt-8 hidden lg:block'>
            <div className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--xl-txt4)]'>Runs on</div>
            <div className='mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2'>
              {RUNS_ON.map(n => (
                <span key={n} className='xl-display text-[14px] font-semibold text-white/45 transition-colors hover:text-white/90'>{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile and tablet: the whole story at full size. The flow runs
            top to bottom (a canvas designed for phones, not a shrunken
            desktop one), a glowing connector routes the call to the phone,
            and the tool call / outcome chips sit under it. */}
        <div className='relative mx-auto flex w-full max-w-[380px] flex-col items-center lg:hidden' aria-hidden>
          <div className='xl-halo absolute -inset-10 -z-10' />
          <div style={rise(3)} className='xl-rise w-full'>
            <WorkflowMock state={state} layout='tall' />
          </div>
          <svg width='2' height='32' className='shrink-0' aria-hidden>
            <line x1='1' y1='0' x2='1' y2='32' stroke='#5c5183' strokeWidth='1.5' />
          </svg>
          <div style={rise(4)} className='xl-rise'>
            <PhoneMock state={state} elapsed={elapsed} />
          </div>
          <div className='relative mt-4 flex h-[68px] w-full items-start justify-center'>
            <OutcomeChip show={state.outcome} className='w-max' />
            {!state.outcome && <ToolChip tool={state.tool} className='w-max max-w-full' />}
          </div>
          <TraceCard state={state} className='mt-3 w-full' />
        </div>

        {/* Desktop: a fixed 745×556 stage, scaled as a whole on smaller or
            shorter screens (see .xl-stage). The phone is docked to the flow
            card: its left border sits on the card's right border, starting
            at the card's vertical midpoint. The Steps card sits under the
            flow card and the chip under the phone, each the same width as
            the piece above it. The stage tilts as one piece toward the
            pointer, so the edges stay joined while it moves. */}
        <div className='xl-stage-wrap hidden lg:block' aria-hidden>
          <div className='xl-stage relative'>
            <motion.div className='absolute inset-0' style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className='absolute left-0 top-0 w-[540px]'
              >
                <WorkflowMock state={state} layout='hero' />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className='absolute left-[540px] top-[134px] z-10'
              >
                <div className='origin-top-left scale-[0.82]'>
                  <PhoneMock state={state} elapsed={elapsed} />
                </div>
              </motion.div>
              <div className='absolute left-0 top-[282px] w-[540px]'>
                <TraceCard state={state} />
              </div>
              <div className='absolute left-[540px] top-[494px] w-[250px] origin-top-left scale-[0.82]'>
                {state.outcome ? <OutcomeChip show /> : <ToolChip tool={state.tool} />}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile "runs on" strip sits under the phone. */}
      <div className='mx-auto mt-10 max-w-[1200px] px-4 sm:px-6 lg:hidden'>
        <div className='text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--xl-txt4)]'>Runs on</div>
        <div className='mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2'>
          {RUNS_ON.map(n => (
            <span key={n} className='xl-display text-[14px] font-semibold text-white/45'>{n}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
