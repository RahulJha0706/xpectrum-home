'use client'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import cn from '@/lib/classnames'

export const Eyebrow = ({ children, color = 'var(--xl-cyan)' }: { children: ReactNode; color?: string }) => (
  <div className='text-[15px] font-semibold' style={{ color }}>{children}</div>
)

/** Fades and lifts its children in once, when they first scroll into view. */
export const Reveal = ({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

/** A heading whose words blur up into place one after another. */
const WordReveal = ({ text }: { text: string }) => (
  <motion.span
    initial='hidden'
    whileInView='show'
    viewport={{ once: true, margin: '-60px' }}
    transition={{ staggerChildren: 0.05 }}
    aria-label={text}
    className='inline'
  >
    {text.split(' ').map((w, i) => (
      <motion.span
        key={i}
        aria-hidden
        className='inline-block whitespace-pre'
        variants={{
          hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)' },
          show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        {`${w} `}
      </motion.span>
    ))}
  </motion.span>
)

export const SectionHeading = ({
  eyebrow,
  title,
  body,
  className,
  eyebrowColor,
}: {
  eyebrow: string
  title: ReactNode
  body?: ReactNode
  className?: string
  eyebrowColor?: string
}) => (
  <div className={cn('max-w-[680px]', className)}>
    <Reveal>
      <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
    </Reveal>
    <h2 className='xl-display mt-3 text-[32px] font-semibold leading-[1.1] text-white sm:text-5xl'>
      {typeof title === 'string' ? <WordReveal text={title} /> : <Reveal>{title}</Reveal>}
    </h2>
    {body && (
      <Reveal delay={0.15}>
        <p className='mt-5 text-[17px] leading-relaxed text-[var(--xl-txt3)] sm:text-lg'>{body}</p>
      </Reveal>
    )}
  </div>
)

/** A card whose border lights up where the pointer is (see .xl-glow-card)
 *  and which tilts a few degrees toward it. Touch devices get neither. */
export const GlowCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn('xl-card xl-glow-card transition-transform duration-300 ease-out will-change-transform', className)}
    onMouseMove={(e) => {
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
      const rx = ((y / r.height) - 0.5) * -5
      const ry = ((x / r.width) - 0.5) * 5
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = ''
    }}
  >
    {children}
  </div>
)

/** Counts up from zero the first time it scrolls into view. */
export const CountUp = ({ value, decimals = 0 }: { value: number; decimals?: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView)
      return
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    })
    return () => controls.stop()
  }, [inView, value])

  return <span ref={ref}>{display.toFixed(decimals)}</span>
}
