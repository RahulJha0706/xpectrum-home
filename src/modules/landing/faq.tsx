'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RiAddLine } from '@remixicon/react'
import cn from '@/lib/classnames'
import { Reveal, SectionHeading } from './ui'

// The objections that stop a sign-up, answered with what the product
// actually does today.
const FAQS = [
  {
    q: 'Will it sound like a robot?',
    a: 'You choose the voice from Cartesia, ElevenLabs, OpenAI or Sarvam. Callers can interrupt mid-sentence, noise cancellation cleans up the line, and the agent says a short filler phrase while it looks something up instead of going silent.',
  },
  {
    q: 'What happens when the agent can’t help?',
    a: 'You can set up call transfer so it hands the caller to your team. Every call is also scored afterwards as resolved, unresolved or escalated, so you can see exactly where it needed a person and improve it for next time.',
  },
  {
    q: 'Do I need developers to set it up?',
    a: 'No. You build the conversation on a visual canvas and add knowledge by uploading files, syncing Notion or pointing it at your website. Developers get a full API, webhooks and MCP when they want to go further.',
  },
  {
    q: 'Can it use my phone number?',
    a: 'You get a number through the app, and our team can help with setup. Route it to an agent for inbound calls, outbound calls or both. SMS, WhatsApp Business and email inboxes connect to agents the same way.',
  },
  {
    q: 'How does pricing work?',
    a: 'You pay per execution: one chat reply, one email processed or one workflow run, with loops and tool calls included rather than billed per step. Models, speech and telephony are passed through at exactly what they cost, with no markup.',
  },
  {
    q: 'I run an agency. Can I manage clients here?',
    a: 'Yes. Create a separate workspace for each client. Their apps, knowledge and conversations stay private to them, while you monitor usage, suspend or reactivate, and put your own branding on the sign-in page.',
  },
]

const Faq = () => {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id='faq' className='relative py-16 lg:py-20'>
      <div className='mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]'>
        <SectionHeading
          eyebrow='Questions'
          title='Everything you’re wondering before you start'
          body={<>Still curious? Our community is on <a className='text-[var(--xl-sky)] underline-offset-4 hover:underline' href='https://discord.gg/s52zuw6bg' target='_blank' rel='noopener noreferrer'>Discord</a>.</>}
        />
        <Reveal className='min-w-0'>
          <div className='divide-y divide-[var(--xl-border-subtle)] border-y border-[var(--xl-border-subtle)]'>
            {FAQS.map((f, i) => {
              const isOpen = open === i
              return (
                <div key={f.q}>
                  <button
                    type='button'
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className='flex w-full items-center justify-between gap-6 py-5 text-left'
                  >
                    <span className={cn('text-[17px] font-semibold transition-colors', isOpen ? 'text-white' : 'text-[var(--xl-txt2)]')}>{f.q}</span>
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300', isOpen ? 'rotate-45 border-[var(--xl-cyan)] text-[var(--xl-cyan)]' : 'border-[var(--xl-border)] text-[var(--xl-txt3)]')}>
                      <RiAddLine className='h-4 w-4' />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className='overflow-hidden'
                      >
                        <p className='pb-6 pr-12 text-[15.5px] leading-relaxed text-[var(--xl-txt3)]'>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Faq
