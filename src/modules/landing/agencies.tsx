'use client'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import {
  RiBuilding2Line,
  RiCoinsLine,
  RiLockLine,
  RiPaletteLine,
  RiPauseCircleLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { ArrowLink } from './button'
import { Reveal, SectionHeading } from './ui'

// Mirrors the Client Workspaces settings page
// (modules/workspace/account-setting/client-workspaces-page). Client names
// are illustrative.
const CLIENTS = [
  { name: 'Bright Smile Dental', apps: 3, usage: 72, status: 'Active' },
  { name: 'Harbor Realty Group', apps: 5, usage: 48, status: 'Active' },
  { name: 'Northline Logistics', apps: 2, usage: 91, status: 'Active' },
  { name: 'Maple Travel Co.', apps: 1, usage: 12, status: 'Suspended' },
]

const WorkspacesMock = () => (
  <div className='xl-card overflow-hidden'>
    <div className='flex items-center justify-between border-b border-[var(--xl-border-subtle)] px-5 py-4'>
      <div>
        <div className='text-sm font-semibold text-white'>Client Workspaces</div>
        <div className='text-[12px] text-[var(--xl-txt4)]'>Provision and monitor client workspaces</div>
      </div>
      <span className='rounded-full bg-[var(--xl-brand)] px-3 py-1.5 text-[12px] font-semibold text-white'>+ New client</span>
    </div>
    <div className='divide-y divide-[var(--xl-border-subtle)]'>
      {CLIENTS.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className='flex items-center gap-4 px-5 py-3.5'
        >
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[var(--xl-sky)]'>
            <RiBuilding2Line className='h-4 w-4' />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-[13.5px] font-medium text-white'>{c.name}</div>
            <div className='text-[11.5px] text-[var(--xl-txt4)]'>{c.apps} {c.apps === 1 ? 'app' : 'apps'}</div>
          </div>
          <div className='hidden w-28 sm:block'>
            <div className='mb-1 flex justify-between text-[10.5px] text-[var(--xl-txt4)]'>
              <span>Credits</span>
              <span>{c.usage}%</span>
            </div>
            <div className='h-1.5 overflow-hidden rounded-full bg-white/10'>
              <motion.div
                className={cn('h-full rounded-full', c.usage > 85 ? 'bg-amber-400' : 'bg-[var(--xl-cyan)]')}
                initial={{ width: 0 }}
                whileInView={{ width: `${c.usage}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
              />
            </div>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
              c.status === 'Active' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-[var(--xl-txt4)]',
            )}
          >
            {c.status}
          </span>
        </motion.div>
      ))}
    </div>
  </div>
)

const POINTS = [
  { icon: RiLockLine, title: 'Private by default', body: 'Each client’s apps, knowledge and conversations stay in their own workspace, private from your team.' },
  { icon: RiPauseCircleLine, title: 'Full lifecycle control', body: 'Provision, change the admin, suspend and reactivate. Usage, logs and traces per client.' },
  { icon: RiCoinsLine, title: 'Transparent costs', body: 'Pay per execution. Models, speech and telephony are passed through at cost, with no markup.' },
  { icon: RiPaletteLine, title: 'Your brand on top', body: 'Your logo on the sign-in page and your name in the title bar. Remove “Powered by” on Enterprise.' },
]

const Agencies = () => (
  <section id='agencies' className='xl-slant relative overflow-x-clip py-20 lg:py-28' style={{ '--xl-slant-bg': 'linear-gradient(180deg,#0f0b33 0%,#060419 100%)' } as CSSProperties}>
    <div className='mx-auto grid max-w-[1200px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]'>
      <div className='order-2 min-w-0 lg:order-1'>
        <Reveal className='relative'>
          <div className='absolute -inset-10 -z-10 rounded-[48px] bg-gradient-to-br from-[#7c5cff40] to-[#1966ca30] blur-3xl' aria-hidden />
          <WorkspacesMock />
        </Reveal>
      </div>
      <div className='order-1 min-w-0 lg:order-2'>
        <SectionHeading
          eyebrow='For agencies'
          eyebrowColor='var(--xl-sky)'
          title='Run AI agents for all of your clients from one place'
          body='Create a workspace for each company you serve. Their team manages their own agents, and you keep an eye on usage, spend and health across all of them.'
        />
        <div className='mt-10 grid gap-6 sm:grid-cols-2'>
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <p.icon className='h-5 w-5 text-[var(--xl-sky)]' />
              <div className='mt-2 text-[15px] font-semibold text-white'>{p.title}</div>
              <p className='mt-1 text-sm leading-relaxed text-[var(--xl-txt4)]'>{p.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <ArrowLink href='/auth/signup' className='mt-8 py-2 text-[15px] text-[var(--xl-sky)] hover:text-white'>Start your agency workspace</ArrowLink>
        </Reveal>
      </div>
    </div>
  </section>
)

export default Agencies
