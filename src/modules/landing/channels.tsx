'use client'
import ChannelRouter from './channel-router'
import { STATS } from './data'
import { CountUp, Reveal, SectionHeading } from './ui'

const Channels = () => (
  <section id='channels' className='relative overflow-hidden py-16 lg:py-20'>
    <div className='mx-auto grid max-w-[1200px] items-center gap-16 px-4 sm:px-6 lg:grid-cols-2'>
      <div className='min-w-0'>
        <SectionHeading
          eyebrow='Omnichannel by design'
          eyebrowColor='#e39bff'
          title='One agent. Every channel your customers use.'
          body='Buy a number and route calls to an agent in minutes, or run outbound campaigns from a CSV with scheduling and retries. The same agent answers SMS, WhatsApp, email and your website, and when a caller texts back later, it picks up where the call left off.'
        />
        <Reveal className='mt-8 flex flex-wrap gap-2'>
          {['Inbound & outbound calls', 'Batch call campaigns', 'Krisp noise cancellation', 'Call recording', 'Sentiment & outcome per call'].map(t => (
            <span key={t} className='rounded-full border border-[var(--xl-border)] bg-white/5 px-3 py-1 text-[13px] text-[var(--xl-txt2)]'>{t}</span>
          ))}
        </Reveal>
        <div className='mt-10 grid grid-cols-2 gap-x-8 gap-y-10'>
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className='border-l border-[var(--xl-border)] pl-5'>
              <div className='xl-display text-4xl font-semibold text-white sm:text-5xl'>
                <CountUp value={s.value} decimals={s.decimals} />
                <span className='xl-gradient-text'>{s.suffix}</span>
              </div>
              <div className='mt-2 text-sm leading-snug text-[var(--xl-txt4)]'>{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal delay={0.15} className='min-w-0'>
        <ChannelRouter />
      </Reveal>
    </div>
  </section>
)

export default Channels
