'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import {
  RiCheckLine,
  RiCustomerService2Line,
  RiFileList3Line,
  RiMailLine,
  RiMegaphoneLine,
  RiPhoneLine,
  RiWhatsappLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { Reveal, SectionHeading } from './ui'

/* ── Tab visuals ───────────────────────────────────────────────────────── */

const FrontDeskVisual = () => (
  <div className='space-y-2.5'>
    {[
      { t: '09:02', who: '+1 (415) 555-0132', out: 'Booked · Fri 10:30', ok: true },
      { t: '09:06', who: '+1 (628) 555-0178', out: 'Answered · insurance question', ok: true },
      { t: '09:11', who: '+1 (510) 555-0199', out: 'Transferred to front desk', ok: false },
      { t: '09:14', who: '+1 (415) 555-0154', out: 'Rescheduled · Tue 2:15', ok: true },
    ].map((c, i) => (
      <motion.div
        key={c.t}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 + i * 0.08 }}
        className='flex items-center gap-3 rounded-xl border border-[var(--xl-border-subtle)] bg-white/[0.04] px-3.5 py-2.5'
      >
        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d25cff1f] text-[#e39bff]'>
          <RiPhoneLine className='h-4 w-4' />
        </span>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-[13px] font-medium text-white'>{c.who}</div>
          <div className='truncate text-[12px] text-[var(--xl-txt4)]'>{c.out}</div>
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', c.ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300')}>
          {c.ok ? 'Resolved' : 'Escalated'}
        </span>
        <span className='hidden text-[11px] text-[var(--xl-txt4)] sm:block'>{c.t}</span>
      </motion.div>
    ))}
  </div>
)

const CampaignVisual = () => (
  <div>
    <div className='flex items-center justify-between'>
      <div>
        <div className='text-[13px] font-semibold text-white'>Appointment reminders · Week 40</div>
        <div className='mt-0.5 flex items-center gap-1.5 text-[12px] text-[var(--xl-txt4)]'>
          <RiFileList3Line className='h-3.5 w-3.5' />
          reminders.csv · 1,200 numbers · 2 retries, 30 min apart
        </div>
      </div>
      <span className='flex items-center gap-1.5 rounded-full bg-[#22d3ee1a] px-2.5 py-1 text-[11px] font-semibold text-[var(--xl-cyan)]'>
        <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--xl-cyan)]' />
        In progress
      </span>
    </div>
    <div className='mt-5 h-2 overflow-hidden rounded-full bg-white/10'>
      <motion.div
        className='h-full rounded-full bg-gradient-to-r from-[var(--xl-brand)] via-[var(--xl-cyan)] to-[var(--xl-violet)]'
        initial={{ width: 0 }}
        animate={{ width: '68%' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
    <div className='mt-5 grid grid-cols-3 gap-3'>
      {[
        ['Talked', '612', 'text-emerald-300'],
        ['No answer', '149', 'text-[var(--xl-txt3)]'],
        ['Voicemail', '55', 'text-amber-300'],
      ].map(([k, v, c]) => (
        <div key={k} className='rounded-xl border border-[var(--xl-border-subtle)] bg-white/[0.04] p-3'>
          <div className='text-[11px] text-[var(--xl-txt4)]'>{k}</div>
          <div className={cn('xl-display mt-0.5 text-2xl font-semibold', c)}>{v}</div>
        </div>
      ))}
    </div>
  </div>
)

const SupportVisual = () => (
  <div className='space-y-2.5'>
    {[
      { icon: RiWhatsappLine, c: '#34d399', ch: 'WhatsApp', q: 'Where is my order #4471?', a: 'It’s out for delivery today, arriving by 6pm.' },
      { icon: RiMailLine, c: '#22d3ee', ch: 'Email', q: 'How do I return a damaged item?', a: 'Replied with the returns steps from your policy.' },
      { icon: RiCustomerService2Line, c: '#5a99eb', ch: 'Web chat', q: 'Do you ship to Canada?', a: 'Yes, 5–7 business days. Here are the rates.' },
    ].map((m, i) => (
      <motion.div
        key={m.ch}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + i * 0.1 }}
        className='rounded-xl border border-[var(--xl-border-subtle)] bg-white/[0.04] p-3'
      >
        <div className='flex items-center gap-2 text-[11px] font-semibold' style={{ color: m.c }}>
          <m.icon className='h-3.5 w-3.5' />
          {m.ch}
        </div>
        <div className='mt-1.5 text-[13px] text-white'>{m.q}</div>
        <div className='mt-1 flex items-start gap-1.5 text-[12px] text-[var(--xl-txt3)]'>
          <RiCheckLine className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300' />
          {m.a}
        </div>
      </motion.div>
    ))}
  </div>
)

const CASES = [
  {
    key: 'front-desk',
    icon: RiPhoneLine,
    label: 'AI front desk',
    title: 'Never miss a call again',
    body: 'A voice receptionist on your own number that answers questions from your handbook, checks availability and books through your scheduling API, and transfers the call when a person should take it.',
    points: ['Answers inbound calls 24/7', 'Books and reschedules through your tools', 'Outcome and sentiment for every call'],
    Visual: FrontDeskVisual,
  },
  {
    key: 'outbound',
    icon: RiMegaphoneLine,
    label: 'Outbound campaigns',
    title: 'Reach everyone on your list, without a call centre',
    body: 'Upload a CSV and your agent calls every number: reminders, follow-ups, renewals, surveys. Fire them all at once, at a set time, or spaced out, with automatic retries.',
    points: ['Schedule or run immediately', 'Retries with a gap you choose', 'Pickup rate and outcomes per campaign'],
    Visual: CampaignVisual,
  },
  {
    key: 'support',
    icon: RiCustomerService2Line,
    label: 'Customer support',
    title: 'Answers on every channel, from your own docs',
    body: 'Put one support agent on WhatsApp, SMS, email and a chat bubble on your site. It answers from your knowledge base and calls your APIs to look things up.',
    points: ['Grounded in your docs, Notion and website', 'Looks up orders and accounts via tools', 'Every conversation logged and reviewable'],
    Visual: SupportVisual,
  },
]

const ROTATE_MS = 7000

const UseCases = () => {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const c = CASES[active]

  useEffect(() => {
    if (!auto || !inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return
    const t = setTimeout(() => setActive(a => (a + 1) % CASES.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [active, auto, inView])

  return (
    <section ref={ref} id='use-cases' className='relative py-16 lg:py-20'>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
        <SectionHeading
          eyebrow='Use cases'
          eyebrowColor='#e39bff'
          title='Put agents to work where the conversations already are'
        />

        <Reveal className='mt-10 flex gap-2 overflow-x-auto pb-3'>
          {CASES.map((u, i) => (
            <button
              key={u.key}
              type='button'
              onClick={() => {
                setAuto(false)
                setActive(i)
              }}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active === i ? 'text-white' : 'text-[var(--xl-txt4)] hover:text-white',
              )}
            >
              {active === i && (
                <motion.span layoutId='xl-usecase-pill' className='absolute inset-0 rounded-full bg-white/10 ring-1 ring-inset ring-white/15' transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
              )}
              <u.icon className='relative h-4 w-4' />
              <span className='relative'>{u.label}</span>
              {active === i && auto && inView && (
                <span className='absolute inset-x-4 -bottom-1.5 h-0.5 overflow-hidden rounded-full bg-white/10'>
                  <span key={active} className='xl-chapter-bar block h-full origin-left bg-[#e39bff]' style={{ animationDuration: `${ROTATE_MS}ms` }} />
                </span>
              )}
            </button>
          ))}
        </Reveal>

        <div className='xl-card mt-6 overflow-hidden'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className='grid gap-10 p-6 sm:p-10 lg:grid-cols-2'
            >
              <div>
                <h3 className='xl-display text-2xl font-semibold text-white sm:text-3xl'>{c.title}</h3>
                <p className='mt-4 text-[16px] leading-relaxed text-[var(--xl-txt3)]'>{c.body}</p>
                <ul className='mt-6 space-y-3'>
                  {c.points.map(p => (
                    <li key={p} className='flex items-center gap-3 text-[15px] text-[var(--xl-txt2)]'>
                      <span className='bg-[var(--xl-brand)]/30 flex h-5 w-5 items-center justify-center rounded-full text-[var(--xl-sky)]'>
                        <RiCheckLine className='h-3.5 w-3.5' />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className='rounded-2xl border border-[var(--xl-border-subtle)] bg-[rgba(10,8,38,0.6)] p-4 sm:p-5'>
                <c.Visual />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default UseCases
