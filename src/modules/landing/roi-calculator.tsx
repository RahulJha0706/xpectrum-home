'use client'
import { useEffect, useState } from 'react'
import { Button } from './button'
import { animate } from 'framer-motion'
import { RiPhoneLine } from '@remixicon/react'
import { Reveal, SectionHeading } from './ui'

// Visitors put in their own numbers, so the figure that persuades them is
// theirs, not a claim of ours. The one assumption is stated on the page.

const WEEKS_PER_MONTH = 4.33

const Slider = ({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) => {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className='block'>
      <div className='flex items-baseline justify-between gap-3'>
        <span className='text-[14px] text-[var(--xl-txt3)]'>{label}</span>
        <span className='xl-display text-lg font-semibold tabular-nums text-white'>{format(value)}</span>
      </div>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className='xl-range mt-3 w-full'
        style={{ background: `linear-gradient(90deg, var(--xl-cyan) 0%, var(--xl-violet) ${pct}%, rgba(255,255,255,0.12) ${pct}%)` }}
      />
    </label>
  )
}

const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`

const AnimatedMoney = ({ value }: { value: number }) => {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const c = animate(shown, value, { duration: 0.5, ease: 'easeOut', onUpdate: setShown })
    return () => c.stop()
    // Animate from whatever is on screen now to the new target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <>{money(shown)}</>
}

const RoiCalculator = () => {
  const [calls, setCalls] = useState(300)
  const [missed, setMissed] = useState(25)
  const [value, setValue] = useState(250)
  const [booked, setBooked] = useState(33)

  const missedPerMonth = calls * WEEKS_PER_MONTH * (missed / 100)
  const atRisk = missedPerMonth * (booked / 100) * value

  return (
    <section id='missed-calls' className='relative py-16 lg:py-20'>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
        <SectionHeading
          eyebrow='What missed calls cost'
          eyebrowColor='#fbbf24'
          title='Every unanswered call is a customer calling someone else'
          body='Put in your own numbers. Busy lines, lunch breaks and after-hours calls add up faster than most teams think.'
        />

        <Reveal className='mt-12'>
          <div className='xl-card grid overflow-hidden lg:grid-cols-[1.1fr_1fr]'>
            <div className='space-y-8 p-6 sm:p-10'>
              <Slider label='Calls you get per week' value={calls} min={20} max={3000} step={10} format={v => v.toLocaleString('en-US')} onChange={setCalls} />
              <Slider label='Share that go unanswered' value={missed} min={5} max={70} step={1} format={v => `${v}%`} onChange={setMissed} />
              <Slider label='Value of a new booking or customer' value={value} min={20} max={5000} step={10} format={money} onChange={setValue} />
              <Slider label='Missed callers who would have booked' value={booked} min={5} max={80} step={1} format={v => `${v}%`} onChange={setBooked} />
            </div>

            <div className='relative flex flex-col justify-center overflow-hidden border-t border-[var(--xl-border-subtle)] bg-[linear-gradient(160deg,rgba(25,102,202,0.25),rgba(124,92,255,0.18)_50%,rgba(6,4,25,0.6))] p-6 sm:p-10 lg:border-l lg:border-t-0'>
              <div className='text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--xl-txt3)]'>Revenue walking away each month</div>
              <div className='xl-display mt-3 break-words text-5xl font-semibold tabular-nums text-white sm:text-6xl'>
                <span className='xl-gradient-text'><AnimatedMoney value={atRisk} /></span>
              </div>
              <div className='mt-4 flex items-center gap-2 text-[15px] text-[var(--xl-txt2)]'>
                <RiPhoneLine className='h-4 w-4 text-[#fbbf24]' />
                {Math.round(missedPerMonth).toLocaleString('en-US')} missed calls a month
              </div>
              <p className='mt-2 text-[14px] leading-relaxed text-[var(--xl-txt4)]'>
                {`That's ${money(atRisk * 12)} a year. An Xpectrum agent picks up every one of those calls, at any hour, and can book on the spot.`}
              </p>
              <Button href='/auth/signup' variant='light' size='lg' className='mt-8 self-start'>Stop missing calls</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default RoiCalculator
