import Link from 'next/link'
import type { ReactNode } from 'react'
import cn from '@/lib/classnames'

/* The landing page's buttons. Deliberately quiet and physical rather than
   glowing: a slight top-lit gradient with a 1px inner highlight, a crisp
   darker edge, a tight low shadow, and a 1px press on click. The arrow's
   shaft draws in on hover (see .xl-hover-arrow). Styles live in
   xpectrum-landing.css under "Buttons". */

type Variant = 'primary' | 'secondary' | 'light'
type Size = 'sm' | 'md' | 'lg'

/** A chevron whose shaft draws in on hover, so it becomes an arrow. */
export const HoverArrow = ({ className }: { className?: string }) => (
  <svg className={cn('xl-hover-arrow', className)} width='10' height='10' viewBox='0 0 10 10' aria-hidden>
    <path className='xl-hover-arrow-line' d='M0 5h7' />
    <path className='xl-hover-arrow-tip' d='M1 1l4 4-4 4' />
  </svg>
)

export const Button = ({
  href,
  variant = 'primary',
  size = 'md',
  arrow = true,
  className,
  children,
}: {
  href: string
  variant?: Variant
  size?: Size
  arrow?: boolean
  className?: string
  children: ReactNode
}) => (
  <Link href={href} prefetch={false} className={cn('xl-btn group', `xl-btn-${variant}`, `xl-btn-${size}`, className)}>
    {children}
    {arrow && <HoverArrow />}
  </Link>
)

/** An inline text link with the same hover arrow. */
export const ArrowLink = ({ href, className, children }: { href: string; className?: string; children: ReactNode }) => (
  <Link href={href} prefetch={false} className={cn('group inline-flex items-center gap-1.5 font-semibold transition-colors', className)}>
    {children}
    <HoverArrow />
  </Link>
)
