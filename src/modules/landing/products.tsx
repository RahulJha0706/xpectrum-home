'use client'
import type { CSSProperties } from 'react'
import {
  RiArrowRightUpLine,
  RiBook2Line,
  RiChatSmile3Line,
  RiDashboard3Line,
  RiPuzzle2Line,
  RiStackLine,
  RiUserVoiceLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { Button } from './button'
import type { ProductKey } from './data'
import { PRODUCTS } from './data'
import {
  AutomationVisual,
  ChannelsVisual,
  ChatVisual,
  IntegrationsVisual,
  KnowledgeVisual,
  MonitoringVisual,
} from './products-visuals'
import { GlowCard, Reveal, SectionHeading } from './ui'

const ICONS: Record<ProductKey, typeof RiChatSmile3Line> = {
  chat: RiChatSmile3Line,
  automation: RiStackLine,
  knowledge: RiBook2Line,
  channels: RiUserVoiceLine,
  integrations: RiPuzzle2Line,
  monitoring: RiDashboard3Line,
}

const VISUALS: Record<ProductKey, () => React.JSX.Element> = {
  chat: ChatVisual,
  automation: AutomationVisual,
  knowledge: KnowledgeVisual,
  channels: ChannelsVisual,
  integrations: IntegrationsVisual,
  monitoring: MonitoringVisual,
}

// Bento. lg (3 columns): chat is wide beside automation; knowledge, channels
// and integrations share a row; monitoring spans the last. md (2 columns):
// integrations and monitoring each take a full row, so no row has a gap.
const SPAN: Partial<Record<ProductKey, string>> = {
  chat: 'lg:col-span-2',
  integrations: 'md:col-span-2 lg:col-span-1',
  monitoring: 'md:col-span-2 lg:col-span-3',
}

// Minimum visual heights; each visual then grows to fill its card, so
// cards in a row line up and a short text block never leaves a hole.
const VISUAL_H: Partial<Record<ProductKey, string>> = {
  monitoring: 'min-h-[640px] lg:min-h-[420px]',
}

const Products = () => (
  <section id='products' className='relative py-16 lg:py-20'>
    <div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
      <SectionHeading
        eyebrow='A fully integrated suite'
        title={(
          <>
            One platform.
            {' '}
            <span className='text-[var(--xl-txt4)]'>Every piece of the agent stack.</span>
          </>
        )}
        body='Start with one agent or run your whole front desk on Xpectrum. Knowledge, tools, channels and monitoring live in one workspace, so an agent you build once can answer anywhere.'
      />

      <div className='mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
        {PRODUCTS.map((p, i) => {
          const Icon = ICONS[p.key]
          const Visual = VISUALS[p.key]
          return (
            <Reveal key={p.key} delay={(i % 3) * 0.08} className={cn('min-w-0', SPAN[p.key])}>
              <GlowCard className='group relative flex h-full flex-col overflow-hidden'>
                {/* The card's own colour, washed in from the corner. */}
                <div
                  aria-hidden
                  className='pointer-events-none absolute inset-0'
                  style={{ background: `radial-gradient(70% 55% at 0% 0%, ${p.color}1c, transparent 70%)` } as CSSProperties}
                />

                <div className='relative p-6 sm:p-7'>
                  <div className='flex items-center gap-2 text-[13px] font-semibold' style={{ color: p.color }}>
                    <span className='flex h-7 w-7 items-center justify-center rounded-lg' style={{ background: `${p.color}24` }}>
                      <Icon className='h-4 w-4' />
                    </span>
                    {p.name}
                  </div>
                  <h3 className='mt-3 text-[21px] font-semibold leading-snug tracking-[-0.01em] text-white sm:text-[23px]'>{p.headline}</h3>
                  <p className='mt-2 max-w-[520px] text-[14.5px] leading-relaxed text-[var(--xl-txt3)]'>{p.long}</p>
                </div>

                <div className={cn('relative flex-1 border-t border-[var(--xl-border-subtle)] bg-[rgba(8,6,28,0.55)]', VISUAL_H[p.key] ?? 'min-h-[260px]')}>
                  <div className='absolute inset-0'>
                    <Visual />
                  </div>
                </div>

                <a
                  href='/auth/signup'
                  aria-label={`Get started with ${p.name}`}
                  className='absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white opacity-0 transition-all duration-200 hover:bg-white/10 focus-visible:opacity-100 group-hover:opacity-100'
                >
                  <RiArrowRightUpLine className='h-4 w-4' />
                </a>
              </GlowCard>
            </Reveal>
          )
        })}
      </div>

      {/* One call to action for the whole suite, not one per card. */}
      <Reveal className='mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[var(--xl-border-subtle)] bg-white/[0.02] p-6 sm:flex-row sm:items-center'>
        <div>
          <div className='text-[17px] font-semibold text-white'>Start with one agent. Add the rest when you need it.</div>
          <div className='mt-1 text-[14px] text-[var(--xl-txt4)]'>Every product is in every workspace, with test calls in your browser and separate workspaces for each client.</div>
        </div>
        <Button href='/auth/signup' size='md'>Get started</Button>
      </Reveal>
    </div>
  </section>
)

export default Products
