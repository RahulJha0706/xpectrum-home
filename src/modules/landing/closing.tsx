import { Button } from './button'
import { RiDiscordLine, RiGithubLine } from '@remixicon/react'
import { basePath } from '@/lib/var'
import { Reveal } from './ui'

// Community links as on the in-app Support page (app/(pages)/support/page.tsx).
const DISCORD_URL = 'https://discord.gg/s52zuw6bg'
const FEEDBACK_URL = 'https://github.com/Xpectrum-AI/external-feedback'

const FOOTER = [
  {
    title: 'Product',
    links: [
      ['Conversational Apps', '#products'],
      ['Automation', '#products'],
      ['Knowledge', '#products'],
      ['Monitoring', '#products'],
    ],
  },
  {
    title: 'Channels',
    links: [
      ['Voice & phone numbers', '#channels'],
      ['Batch calls', '#use-cases'],
      ['SMS & WhatsApp', '#channels'],
      ['Email', '#channels'],
    ],
  },
  {
    title: 'Solutions',
    links: [
      ['AI front desk', '#use-cases'],
      ['Customer support', '#use-cases'],
      ['For agencies', '#agencies'],
      ['Developers', '#developers'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Sign in', '/auth/signin'],
      ['Create account', '/auth/signup'],
      ['Open dashboard', '/agents'],
    ],
  },
]

export const ClosingCta = () => (
  <section id='get-started' className='relative overflow-hidden pb-24 pt-10 lg:pb-32 lg:pt-12'>
    <div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
      <Reveal>
        <div className='relative isolate overflow-hidden rounded-[28px] border border-[var(--xl-border)] px-6 py-16 sm:px-14 sm:py-20'>
          {/* Same colour field as the hero, contained in the card */}
          <div className='absolute inset-0 -z-10 bg-[var(--xl-bg-deep)]' aria-hidden>
            <div className='xl-blob xl-blob-1 !left-[-20%] !top-[-40%]' />
            <div className='xl-blob xl-blob-3 !right-[-15%] !top-[10%]' />
            <div className='absolute inset-0 bg-[rgba(10,8,38,0.55)]' />
          </div>
          <div className='grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]'>
            <div>
              <h2 className='xl-display text-4xl font-semibold leading-[1.05] text-white sm:text-6xl'>
                Ready to put your first agent
                {' '}
                <span className='xl-gradient-text'>on the line?</span>
              </h2>
              <p className='mt-5 max-w-[520px] text-lg text-[var(--xl-txt3)]'>
                Build your first agent in minutes, test a call in the browser, then give it a number.
              </p>
            </div>
            <div className='flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end'>
              <Button href='/auth/signup' variant='light' size='lg'>Start building</Button>
              <Button href='/auth/signin' variant='secondary' size='lg'>Sign in</Button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
)

export const Footer = () => (
  <footer className='border-t border-[var(--xl-border-subtle)] bg-[var(--xl-bg-deep)]'>
    <div className='mx-auto grid max-w-[1200px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_2fr]'>
      <div>
        <img src={`${basePath}/logo/logo-site-dark.png`} alt='Xpectrum AI' className='h-7 w-auto brightness-[1.75] saturate-[1.15]' />
        <p className='mt-4 max-w-[300px] text-sm leading-relaxed text-[var(--xl-txt4)]'>
          Your workspace for building, deploying and monitoring AI agents.
        </p>
        <div className='mt-6 flex gap-2'>
          <a href={DISCORD_URL} target='_blank' rel='noopener noreferrer' aria-label='Discord community' className='flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[var(--xl-txt3)] hover:bg-white/10 hover:text-white'>
            <RiDiscordLine className='h-4 w-4' />
          </a>
          <a href={FEEDBACK_URL} target='_blank' rel='noopener noreferrer' aria-label='Feedback on GitHub' className='flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[var(--xl-txt3)] hover:bg-white/10 hover:text-white'>
            <RiGithubLine className='h-4 w-4' />
          </a>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-8 sm:grid-cols-4'>
        {FOOTER.map(col => (
          <div key={col.title}>
            <div className='text-sm font-semibold text-white'>{col.title}</div>
            <ul className='mt-3 space-y-0.5'>
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className='inline-block py-1.5 text-sm text-[var(--xl-txt4)] transition-colors hover:text-white'>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className='border-t border-[var(--xl-border-subtle)]'>
      <div className='mx-auto flex max-w-[1200px] flex-col justify-between gap-2 px-4 py-6 text-[13px] text-[var(--xl-txt4)] sm:flex-row sm:px-6'>
        <span>© {new Date().getFullYear()} Xpectrum AI</span>
        <a href={DISCORD_URL} target='_blank' rel='noopener noreferrer' className='py-1.5 hover:text-white'>Get help from the community</a>
      </div>
    </div>
  </footer>
)
