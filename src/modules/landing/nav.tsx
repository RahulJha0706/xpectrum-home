'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RiArrowRightSLine,
  RiBook2Line,
  RiChatSmile3Line,
  RiCloseLine,
  RiDashboard3Line,
  RiMenuLine,
  RiPuzzle2Line,
  RiStackLine,
  RiUserVoiceLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { basePath } from '@/lib/var'
import { Button } from './button'
import { PRODUCTS } from './data'

const PRODUCT_ICONS = {
  chat: RiChatSmile3Line,
  automation: RiStackLine,
  knowledge: RiBook2Line,
  channels: RiUserVoiceLine,
  integrations: RiPuzzle2Line,
  monitoring: RiDashboard3Line,
} as const

const LINKS = [
  { label: 'Use cases', href: '#use-cases' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Agencies', href: '#agencies' },
  { label: 'Developers', href: '#developers' },
  { label: 'FAQ', href: '#faq' },
]

const Nav = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const headerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // The page scrolls inside .xp-landing, not the window (see xpectrum-landing.css).
  // The progress bar is written directly to the DOM so scrolling never
  // re-renders the nav.
  useEffect(() => {
    const scroller = headerRef.current?.closest('.xp-landing')
    if (!scroller)
      return
    const onScroll = () => {
      setScrolled(scroller.scrollTop > 12)
      const max = scroller.scrollHeight - scroller.clientHeight
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${max > 0 ? scroller.scrollTop / max : 0})`
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-[var(--xl-border-subtle)] bg-[rgba(10,8,38,0.94)]'
          : 'border-b-0 bg-gradient-to-b from-[rgba(6,4,25,0.85)] via-[rgba(6,4,25,0.45)] to-transparent',
      )}
    >
      <nav className='mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6'>
        <Link href='/' className='flex items-center gap-2 py-1.5' aria-label='Xpectrum AI home'>
          <img
            src={`${basePath}/logo/logo-site-dark.png`}
            alt='Xpectrum AI'
            className='h-7 w-auto brightness-[1.75] saturate-[1.15]'
          />
        </Link>

        <div className='hidden items-center gap-0.5 lg:flex'>
          <div
            className='relative'
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type='button'
              className='rounded-full px-4 py-2 text-[15px] font-medium text-[var(--xl-txt2)] transition-colors hover:text-white'
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
            >
              Products
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, rotateX: -8 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{ transformPerspective: 900 }}
                  className='absolute left-1/2 top-full w-[620px] -translate-x-1/2 pt-3'
                >
                  <div className='xl-card grid grid-cols-2 gap-1 p-3'>
                    {PRODUCTS.map((p) => {
                      const Icon = PRODUCT_ICONS[p.key]
                      return (
                        <a
                          key={p.key}
                          href='#products'
                          onClick={() => setMenuOpen(false)}
                          className='group flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/5'
                        >
                          <span
                            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'
                            style={{ background: `${p.color}26`, color: p.color }}
                          >
                            <Icon className='h-5 w-5' />
                          </span>
                          <span>
                            <span className='flex items-center gap-1 text-sm font-semibold text-white'>
                              {p.name}
                              <RiArrowRightSLine className='h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100' />
                            </span>
                            <span className='mt-0.5 block text-[13px] leading-snug text-[var(--xl-txt4)]'>{p.short}</span>
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className='rounded-full px-4 py-2 text-[15px] font-medium text-[var(--xl-txt2)] transition-colors hover:text-white'
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className='flex items-center gap-1 sm:gap-2'>
          <Link prefetch={false}
            href='/auth/signin'
            className='group hidden items-center gap-0.5 rounded-full px-4 py-2 text-[15px] font-medium text-[var(--xl-txt2)] transition-colors hover:text-white sm:flex'
          >
            Sign in
            <RiArrowRightSLine className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
          </Link>
          <Button href='/auth/signup' size='sm'>Get started</Button>
          <button
            type='button'
            className='rounded-lg p-2 text-white lg:hidden'
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <RiCloseLine className='h-6 w-6' /> : <RiMenuLine className='h-6 w-6' />}
          </button>
        </div>
      </nav>

      {/* Reading progress */}
      <div className={cn('absolute inset-x-0 bottom-[-1px] h-[2px] overflow-hidden transition-opacity duration-300', scrolled ? 'opacity-100' : 'opacity-0')} aria-hidden>
        <div ref={progressRef} className='xl-progress h-full w-full' style={{ transform: 'scaleX(0)' }} />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className='mx-4 mb-4 lg:hidden'
          >
            <div className='xl-card flex flex-col p-2'>
              {[{ label: 'Products', href: '#products' }, ...LINKS].map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className='rounded-lg px-3 py-3 text-base font-medium text-[var(--xl-txt2)] hover:bg-white/5'
                >
                  {l.label}
                </a>
              ))}
              <div className='mt-2 grid grid-cols-2 gap-2 border-t border-[var(--xl-border-subtle)] pt-3'>
                <Link href='/auth/signin' prefetch={false} className='rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white ring-1 ring-inset ring-white/20'>
                  Sign in
                </Link>
                <Link href='/agents' prefetch={false} className='rounded-full bg-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white'>
                  Open dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Nav
