'use client'
import { Fragment, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  RiCheckLine,
  RiFileCopyLine,
  RiGitBranchLine,
  RiKey2Line,
  RiShieldCheckLine,
  RiTerminalBoxLine,
} from '@remixicon/react'
import { Button } from './button'
import { CODE_SAMPLE, CURL_SAMPLE } from './data'
import { Reveal, SectionHeading } from './ui'

const SAMPLES = { 'server.ts': CODE_SAMPLE, 'curl': CURL_SAMPLE }

// Just enough highlighting for one snippet: comments, strings, keywords,
// numbers. Tokens become spans, so no HTML is ever injected.
const TOKEN_RE = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|await|for|of|new|return|true|false)\b|\b(\d+)\b/gm
const TOKEN_CLASS = ['text-[#7e7795] italic', 'text-[#6ee7b7]', 'text-[#c4b5fd]', 'text-[#fbbf24]']

const highlight = (line: string) => {
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0
    if (idx > last)
      out.push(line.slice(last, idx))
    const group = [1, 2, 3, 4].find(g => m[g] !== undefined) ?? 1
    out.push(<span key={idx} className={TOKEN_CLASS[group - 1]}>{m[0]}</span>)
    last = idx + m[0].length
  }
  if (last < line.length)
    out.push(line.slice(last))
  return out
}

const FEATURES = [
  { icon: RiKey2Line, title: 'Per-app API keys', body: 'Every app gets its own Service API and secret keys, with docs generated in the app.' },
  { icon: RiTerminalBoxLine, title: 'Streaming responses', body: 'Server-sent events, so replies render as the agent writes them.' },
  { icon: RiGitBranchLine, title: 'Workflows as MCP tools', body: 'Publish a workflow and it gets its own MCP URL. Group several behind one.' },
  { icon: RiShieldCheckLine, title: 'Traced in production', body: 'Per-run logs and traces, plus LangSmith, Langfuse, Opik or Weave if you use them.' },
]

const Developers = () => {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<keyof typeof SAMPLES>('server.ts')
  const code = SAMPLES[tab]
  const lines = code.split('\n')

  return (
    <section id='developers' className='xl-slant relative overflow-x-clip py-20 lg:py-28' style={{ '--xl-slant-bg': '#060419' } as CSSProperties}>
      <div className='xl-dot-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_50%,#000_20%,transparent_70%)]' aria-hidden />
      <div className='mx-auto grid max-w-[1200px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]'>
        <div className='min-w-0'>
          <SectionHeading
            eyebrow='Designed for developers'
            eyebrowColor='var(--xl-sky)'
            title='Ship agents with an API you already understand'
            body='Build on the canvas, then call the agent over a plain HTTPS API, embed it on your website with one script tag, or plug it into other agents over MCP. It’s just JSON over the wire.'
          />
          <div className='mt-10 grid gap-6 sm:grid-cols-2'>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className='border-[var(--xl-sky)]/40 border-l-2 pl-4'>
                  <f.icon className='h-5 w-5 text-[var(--xl-sky)]' />
                  <div className='mt-2 text-[15px] font-semibold text-white'>{f.title}</div>
                  <p className='mt-1 text-sm leading-relaxed text-[var(--xl-txt4)]'>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <Button href='/auth/signup' variant='secondary' size='md' className='mt-10'>Get your API key</Button>
          </Reveal>
        </div>

        <Reveal delay={0.1} className='relative min-w-0'>
          {/* Soft coloured glow behind the editor */}
          <div className='absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-tr from-[#1966ca55] via-[#7c5cff33] to-[#22d3ee33] blur-3xl' aria-hidden />
          <div className='overflow-hidden rounded-2xl border border-[var(--xl-border)] bg-[#0d0b24]/95 shadow-2xl'>
            <div className='flex items-center justify-between border-b border-white/10 px-4'>
              <div className='flex' role='tablist'>
                {(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map(t => (
                  <button
                    key={t}
                    type='button'
                    role='tab'
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={tab === t
                      ? 'border-b-2 border-[var(--xl-cyan)] px-3 py-3 text-xs font-semibold text-white'
                      : 'border-b-2 border-transparent px-3 py-3 text-xs text-[var(--xl-txt4)] hover:text-white'}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                type='button'
                onClick={() => {
                  navigator.clipboard?.writeText(code)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
                className='flex items-center gap-1 rounded-md px-2.5 py-2 text-xs text-[var(--xl-txt4)] hover:bg-white/5 hover:text-white'
              >
                {copied ? <RiCheckLine className='h-3.5 w-3.5 text-emerald-300' /> : <RiFileCopyLine className='h-3.5 w-3.5' />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className='overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.7] text-[var(--xl-txt2)]'>
              <code>
                {lines.map((line, i) => (
                  <motion.div
                    key={`${tab}-${i}`}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.035, duration: 0.3 }}
                    className='flex'
                  >
                    <span className='mr-5 inline-block w-5 select-none text-right text-[#4a4466]'>{i + 1}</span>
                    <span className='whitespace-pre'>{line ? highlight(line).map((n, j) => <Fragment key={j}>{n}</Fragment>) : ' '}</span>
                  </motion.div>
                ))}
              </code>
            </pre>
            <div className='border-t border-white/10 bg-black/30 px-5 py-3 font-mono text-[11.5px]'>
              <div className='text-[var(--xl-txt4)]'>event: message</div>
              <div className='text-[#6ee7b7]'>{'data: {"answer": "Friday at 10:30 is open. Shall I book it?"}'}</div>
              <div className='mt-1 flex items-center gap-1.5 text-[var(--xl-cyan)]'>
                <span className='h-3 w-1.5 animate-pulse bg-[var(--xl-cyan)]' />
                streaming
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Developers
