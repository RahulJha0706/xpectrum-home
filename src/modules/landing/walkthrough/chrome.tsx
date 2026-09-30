'use client'
import { useLayoutEffect, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RiArrowDownSLine,
  RiBook2Line,
  RiBroadcastLine,
  RiCalendarCheckLine,
  RiChatSmile3Line,
  RiFlowChart,
  RiFolder3Line,
  RiGitBranchLine,
  RiHammerLine,
  RiMailLine,
  RiMessage2Line,
  RiPhoneLine,
  RiRobot2Line,
  RiSmartphoneLine,
  RiStackLine,
  RiUserVoiceLine,
  RiWhatsappLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { basePath } from '@/lib/var'
import type { S } from './script'

/* The app's shell around the scenes: sidebar (sidebar.tsx), a breadcrumb
   bar standing in for it on phones, small shared controls, and the cursor. */

export const Tip = ({ show, children }: { show: boolean; children: ReactNode }) => (
  <AnimatePresence>
    {show && (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className='pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#493d72] px-2 py-1 text-[11px] text-white shadow-lg'
      >
        {children}
      </motion.span>
    )}
  </AnimatePresence>
)

export const Btn = ({ id, primary, children, className }: { id?: string; primary?: boolean; children: ReactNode; className?: string }) => (
  <span
    data-cursor={id}
    className={cn(
      'inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[12px] font-medium',
      primary ? 'bg-[#1966ca] text-white' : 'border border-[#5c5183] bg-[#261f3a] text-[#e9e7f1]',
      className,
    )}
  >
    {children}
  </span>
)

const NAV = [
  {
    id: 'conv',
    title: 'Conversational Apps',
    icon: RiChatSmile3Line,
    items: [
      { id: 'nav-agent-flow', label: 'Agent Flow', icon: RiFlowChart },
      { id: 'nav-chatbot', label: 'AI Chatbot', icon: RiMessage2Line },
      { id: 'nav-agent', label: 'Autonomous Agent', icon: RiRobot2Line },
    ],
  },
  {
    id: 'auto',
    title: 'Automation Apps',
    icon: RiStackLine,
    items: [
      { id: 'nav-workflow', label: 'Workflow', icon: RiGitBranchLine },
      { id: 'nav-triggers', label: 'Triggers', icon: RiCalendarCheckLine },
    ],
  },
  {
    id: 'res',
    title: 'Resources',
    icon: RiFolder3Line,
    items: [
      { id: 'nav-kb', label: 'Knowledge Base', icon: RiBook2Line },
      { id: 'nav-int', label: 'Integrations', icon: RiHammerLine },
    ],
  },
  {
    id: 'channels',
    title: 'Channels',
    icon: RiBroadcastLine,
    items: [
      { id: 'nav-voice', label: 'Voice', icon: RiUserVoiceLine },
      { id: 'nav-phone', label: 'Phone Number', icon: RiPhoneLine },
      { id: 'nav-sms', label: 'SMS', icon: RiSmartphoneLine },
      { id: 'nav-wa', label: 'WhatsApp', icon: RiWhatsappLine },
      { id: 'nav-email', label: 'Email', icon: RiMailLine },
    ],
  },
]

const activeNav = (s: S) => {
  if (s.scene === 'phone')
    return 'nav-phone'
  return s.kind === 'workflow' ? 'nav-workflow' : 'nav-agent'
}

// The sidebar is an accordion; the section the cursor is heading into opens
// just before it gets there, so its item exists as a target.
const openSection = (s: S) => {
  if (s.cursor === 'nav-phone')
    return 'channels'
  if (s.cursor === 'nav-workflow')
    return 'auto'
  return s.section
}

export const Sidebar = ({ s }: { s: S }) => {
  const open = openSection(s)
  const active = activeNav(s)
  return (
    <aside className='hidden w-[208px] shrink-0 flex-col border-r border-[#453d63] bg-[rgba(10,8,38,0.92)] md:flex'>
      <div className='flex h-12 items-center px-4'>
        <img src={`${basePath}/logo/logo-site-dark.png`} alt='' className='h-5 w-auto brightness-[1.75] saturate-[1.15]' />
      </div>
      <nav className='flex-1 space-y-1 overflow-hidden px-2.5'>
        {NAV.map((sec) => {
          const isOpen = open === sec.id
          return (
            <div key={sec.id}>
              <div className={cn('flex h-7 items-center justify-between rounded-md px-2 text-[10.5px] font-semibold uppercase tracking-wide text-[#9d96b3]', isOpen && 'bg-[#45396b] text-white')}>
                <span className='flex items-center gap-1.5'>
                  <sec.icon className='h-3.5 w-3.5' />
                  {sec.title}
                </span>
                <RiArrowDownSLine className={cn('h-3.5 w-3.5 transition-transform', !isOpen && '-rotate-90')} />
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className='ml-3 overflow-hidden border-l border-[#453d63] py-1 pl-2'
                  >
                    {sec.items.map(it => (
                      <li
                        key={it.id}
                        data-cursor={it.id}
                        className={cn('flex h-6 items-center gap-2 rounded-md px-2 text-[12px] text-[#e9e7f1]', active === it.id && 'bg-[#1f2b5e] font-medium text-white')}
                      >
                        <it.icon className='h-3.5 w-3.5 shrink-0' />
                        {it.label}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
      <div className='m-2.5 rounded-lg border border-[#453d63] px-3 py-2'>
        <div className='text-[10px] text-[#9d96b3]'>Current Workspace</div>
        <div className='flex items-center justify-between text-[12px] font-medium text-white'>
          Bright Smile Dental
          <RiArrowDownSLine className='h-3.5 w-3.5' />
        </div>
      </div>
    </aside>
  )
}

const CRUMBS = {
  channels: { icon: RiBroadcastLine, sec: 'Channels', item: 'Phone Number', id: 'nav-phone' },
  auto: { icon: RiStackLine, sec: 'Automation Apps', item: 'Workflow', id: 'nav-workflow' },
  conv: { icon: RiChatSmile3Line, sec: 'Conversational Apps', item: 'Autonomous Agent', id: 'nav-agent' },
}

// Phones have no sidebar; the section path sits in a breadcrumb bar that
// carries the same cursor targets.
export const MobileCrumbs = ({ s }: { s: S }) => {
  const c = CRUMBS[openSection(s)]
  return (
    <div className='flex h-10 shrink-0 items-center gap-1.5 border-b border-[#453d63] px-3 text-[12px] text-[#9d96b3] md:hidden'>
      <c.icon className='h-3.5 w-3.5' />
      {c.sec}
      <span>›</span>
      <span data-cursor={c.id} className='rounded-md bg-[#1f2b5e] px-2 py-0.5 font-medium text-white'>{c.item}</span>
    </div>
  )
}

/** Glides to whichever element the script names (by data-cursor). */
export const Cursor = ({ s, stageRef }: { s: S; stageRef: RefObject<HTMLDivElement | null> }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage)
      return
    const place = () => {
      const target = [...stage.querySelectorAll<HTMLElement>(`[data-cursor="${s.cursor}"]`)].find(el => el.offsetParent !== null)
      if (!target)
        return
      const a = stage.getBoundingClientRect()
      const b = target.getBoundingClientRect()
      setPos({ x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 })
    }
    // Targets can settle a moment later (modals, panels, the canvas
    // re-fitting its zoom), so place again shortly after.
    place()
    const raf = requestAnimationFrame(place)
    const late = setTimeout(place, 350)
    const later = setTimeout(place, 700)
    const ro = new ResizeObserver(place)
    ro.observe(stage)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(late)
      clearTimeout(later)
      ro.disconnect()
    }
  }, [s.cursor, s.scene, s.kind, s.modal, s.picker, s.publishOpen, s.assignOpen, s.previewOpen, s.wfStartOpen, s.wfNodes, s.runOpen, s.dock, s.kbPicker, stageRef])

  if (!pos)
    return null
  return (
    <motion.div
      className='pointer-events-none absolute left-0 top-0 z-50'
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
    >
      <AnimatePresence>
        <motion.span
          key={s.click}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className='absolute -left-3 -top-3 h-6 w-6 rounded-full border-2 border-[#5a9ef6]'
        />
      </AnimatePresence>
      <svg width='22' height='22' viewBox='0 0 24 24' className='translate-x-[-3px] translate-y-[-2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]' aria-hidden>
        <path d='M4 2 L4 19 L8.5 14.8 L11.6 21.5 L14.4 20.3 L11.4 13.7 L17.5 13.7 Z' fill='white' stroke='#0a0826' strokeWidth='1.4' strokeLinejoin='round' />
      </svg>
    </motion.div>
  )
}
