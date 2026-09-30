'use client'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiBook2Line,
  RiBrainFill,
  RiChat3Line,
  RiCheckLine,
  RiCheckboxCircleFill,
  RiClipboardLine,
  RiCloseLine,
  RiEyeLine,
  RiFileAddLine,
  RiFileList3Line,
  RiFileTextLine,
  RiFlag2Fill,
  RiFlashlightFill,
  RiGitBranchFill,
  RiGitBranchLine,
  RiGlobalLine,
  RiHammerFill,
  RiLoader2Line,
  RiMailLine,
  RiPhoneFill,
  RiPlayFill,
  RiRefreshLine,
  RiResetLeftLine,
  RiRobot2Fill,
  RiRobot2Line,
  RiSearchEyeFill,
  RiSearchLine,
  RiSparkling2Fill,
  RiStopCircleLine,
  RiToolsLine,
  RiUpload2Line,
  RiWebhookLine,
} from '@remixicon/react'
import cn from '@/lib/classnames'
import { Btn, Tip } from './chrome'
import { Graph } from './canvas'
import type { GEdge, GNode, NodeStatus } from './canvas'
import { AGENT_NAME, QUERY, WF_NAME } from './script'
import type { S } from './script'

const useIsNarrow = () => {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

/* ── App list + Create modal ──────────────────────────────────────────── */

const KIND = {
  agent: {
    title: 'Autonomous Agents',
    desc: 'Agents that pick their own tools and steps to reach the goal you set.',
    icon: RiRobot2Line,
    modal: 'Create Agent',
    emoji: '🤖',
    emojiBg: '#EDE9FE',
    type: 'AGENT',
  },
  workflow: {
    title: 'Workflows',
    desc: 'Automations that run start to finish on a trigger or a schedule, with no conversation.',
    icon: RiGitBranchLine,
    modal: 'Create Workflow',
    emoji: '⚙️',
    emojiBg: '#FFEAD5',
    type: 'WORKFLOW',
  },
}

export const ListScene = ({ s }: { s: S }) => {
  const k = KIND[s.kind]
  return (
    <div className='relative flex-1 p-4 sm:p-6'>
      <div className='flex items-start gap-3'>
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#232A52] text-[#7C8CF5]'>
          <k.icon className='h-5 w-5' />
        </span>
        <div>
          <div className='text-[17px] font-semibold text-white'>{k.title}</div>
          <div className='mt-0.5 max-w-[440px] text-[12px] leading-snug text-[#c6c1d6]'>{k.desc}</div>
        </div>
      </div>
      <div className='mt-5 flex items-center gap-2'>
        <div className='flex h-[38px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#5c5183] bg-[#261f3a] px-3 text-[12px] text-[#9d96b3] sm:max-w-[300px]'>
          <RiSearchLine className='h-3.5 w-3.5' />
          Search
        </div>
        <span className='hidden items-center gap-1.5 text-[12px] text-[#c6c1d6] sm:flex'>
          <span className='h-3.5 w-3.5 rounded border border-[#7e72a8]' />
          Created by me
        </span>
        <span className='flex-1' />
        <span data-cursor='btn-create-blank' className='relative flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#5c5183] bg-[#261f3a] text-white'>
          <RiFileAddLine className='h-4 w-4' />
          <Tip show={s.cursor === 'btn-create-blank' && !s.modal}>Create from Blank</Tip>
        </span>
        <span className='hidden h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#5c5183] bg-[#261f3a] text-white sm:flex'>
          <RiUpload2Line className='h-4 w-4' />
        </span>
      </div>
      <div className='mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#5c5183] py-10 text-center'>
        <div className='text-[14px] font-semibold text-white'>No apps found</div>
        <div className='mt-1 text-[12px] text-[#9d96b3]'>New here? This is the fastest way to get started →</div>
        <Btn primary className='mt-4'>+ Create app</Btn>
      </div>

      <AnimatePresence>
        {s.modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 z-10 flex items-center justify-center bg-[rgba(4,3,16,0.6)] p-4'
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className='w-full max-w-[420px] rounded-2xl border border-[#7e72a8] bg-[#32294d] p-5 shadow-2xl'
            >
              <div className='text-[15px] font-semibold text-white'>{k.modal}</div>
              <div className='mt-4 flex items-end gap-3'>
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[20px]' style={{ background: k.emojiBg }}>{k.emoji}</span>
                <div className='min-w-0 flex-1'>
                  <div className='mb-1 text-[11.5px] font-medium text-[#c6c1d6]'>App Name</div>
                  <div data-cursor='field-name' className={cn('flex h-9 items-center rounded-lg border bg-[#261f3a] px-3 text-[12.5px]', s.cursor === 'field-name' ? 'border-[#5a9ef6]' : 'border-[#5c5183]')}>
                    {s.name ? <span className='truncate text-white'>{s.name}</span> : <span className='text-[#7e7795]'>App Name</span>}
                    {s.cursor === 'field-name' && <span className='ml-px h-4 w-px shrink-0 animate-pulse bg-white' />}
                  </div>
                </div>
              </div>
              <div className='mb-1 mt-3 text-[11.5px] font-medium text-[#c6c1d6]'>
                Description
                {' '}
                <span className='text-[#9d96b3]'>(Optional)</span>
              </div>
              <div data-cursor='field-desc' className={cn('h-16 rounded-lg border bg-[#261f3a] px-3 py-2 text-[12.5px]', s.cursor === 'field-desc' ? 'border-[#5a9ef6]' : 'border-[#5c5183]')}>
                {s.desc ? <span className='text-white'>{s.desc}</span> : <span className='text-[#7e7795]'>Description</span>}
                {s.cursor === 'field-desc' && <span className='ml-px inline-block h-4 w-px translate-y-[3px] animate-pulse bg-white' />}
              </div>
              <div className='mt-5 flex justify-end gap-2'>
                <Btn>Cancel</Btn>
                <Btn id='btn-create' primary>
                  Create
                  <span className='rounded bg-white/20 px-1 text-[10px]'>⌘</span>
                  <span className='rounded bg-white/20 px-1 text-[10px]'>↵</span>
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Editor top bar (as in the app: app pill · Preview/Run · Logs · Publish) */

const TopBar = ({ s }: { s: S }) => {
  const k = KIND[s.kind]
  const wf = s.kind === 'workflow'
  return (
    <div className='relative flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#453d63] px-3 sm:px-4'>
      <div className='flex min-w-0 items-center gap-2'>
        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[15px]' style={{ background: k.emojiBg }}>{k.emoji}</span>
        <span className='min-w-0'>
          <span className='block truncate text-[13px] font-semibold leading-tight text-white'>{wf ? WF_NAME : AGENT_NAME}</span>
          <span className='block text-[9.5px] font-medium tracking-wide text-[#9d96b3]'>{k.type}</span>
        </span>
        <RiArrowDownSLine className='h-4 w-4 shrink-0 text-[#9d96b3]' />
      </div>
      <div className='relative flex items-center gap-3'>
        <span data-cursor={wf ? 'btn-run' : 'btn-preview'} className={cn('flex items-center gap-1 text-[12.5px] font-medium', (wf ? s.runOpen : s.previewOpen) ? 'text-white' : 'text-[#c6c1d6]')}>
          {wf && <RiPlayFill className='h-3.5 w-3.5' />}
          {wf ? 'Run' : 'Preview'}
        </span>
        <span className='hidden text-[12.5px] font-medium text-[#c6c1d6] sm:inline'>Logs</span>
        <span className='hidden h-5 w-px bg-[#453d63] sm:block' />
        <Btn id={wf ? undefined : 'btn-publish'} primary className='hidden sm:inline-flex'>
          {!wf && s.published ? 'Published' : 'Publish Changes'}
          <RiArrowDownSLine className='h-3.5 w-3.5' />
        </Btn>

        <AnimatePresence>
          {!wf && s.publishOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className='absolute right-0 top-11 z-30 w-[270px] rounded-xl border border-[#7e72a8] bg-[#3d335f] p-3 shadow-2xl'
            >
              <div className='text-[12px] font-semibold text-white'>External API</div>
              {[
                { id: 'toggle-voice', t: 'Voice calls', d: 'Allow starting voice calls with the API key', on: s.voiceOn },
                { id: undefined, t: 'Conversation history over API', d: '', on: false },
              ].map(r => (
                <div key={r.t} className='mt-2.5 flex items-start justify-between gap-3'>
                  <div>
                    <div className='text-[12px] text-white'>{r.t}</div>
                    {r.d && <div className='text-[10.5px] leading-snug text-[#9d96b3]'>{r.d}</div>}
                  </div>
                  <span data-cursor={r.id} className={cn('relative mt-0.5 h-4 w-7 shrink-0 rounded-full transition-colors', r.on ? 'bg-[#1966ca]' : 'bg-[#5c5183]')}>
                    <span className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all', r.on ? 'left-3.5' : 'left-0.5')} />
                  </span>
                </div>
              ))}
              <span data-cursor='btn-publish-confirm' className={cn('mt-3 flex h-8 items-center justify-center gap-1 rounded-lg text-[12px] font-medium text-white', s.published ? 'bg-emerald-600' : 'bg-[#1966ca]')}>
                {s.published && <RiCheckLine className='h-3.5 w-3.5' />}
                {s.published ? 'Published' : 'Publish Changes'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Phones hide Publish in the top bar; during the publish chapter a slim
// action bar at the foot of the canvas carries it instead.
const MobilePublish = ({ s }: { s: S }) => (
  s.kind === 'agent' && s.chapter === 3
    ? (
      <div className='absolute inset-x-3 bottom-3 z-10 sm:hidden'>
        <span data-cursor='btn-publish' className={cn('flex h-9 items-center justify-center rounded-lg text-[12px] font-medium text-white', s.published ? 'bg-emerald-600' : 'bg-[#1966ca]')}>
          {s.published ? 'Published' : 'Publish Changes'}
        </span>
      </div>
    )
    : null
)

/* ── Side panels: Preview (agent chat) and Run (workflow) ─────────────── */

const SidePanel = ({ title, children, onTopRight }: { title: ReactNode; children: ReactNode; onTopRight?: ReactNode }) => (
  <motion.div
    initial={{ x: 40, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 40, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    className='absolute inset-x-2 bottom-2 top-[45%] z-20 flex flex-col rounded-xl border border-[#7e72a8] bg-[#261f3a] shadow-2xl lg:inset-x-auto lg:bottom-3 lg:right-3 lg:top-3 lg:w-[300px]'
  >
    <div className='flex h-10 shrink-0 items-center justify-between border-b border-[#453d63] px-3'>
      <span className='text-[12.5px] font-semibold text-white'>{title}</span>
      <span className='flex items-center gap-2 text-[#9d96b3]'>
        {onTopRight}
        <RiCloseLine className='h-4 w-4' />
      </span>
    </div>
    {children}
  </motion.div>
)

// Stage of a Preview message: 0 loading dots · 1 "Using Knowledge" ·
// 2 "Used Knowledge" and the answer streaming · 4 finished.
const Dots = ({ size, bounce }: { size: string; bounce?: boolean }) => (
  <span className='flex items-center gap-1'>
    {[0, 150, 300].map(d => (
      <span key={d} className={cn(size, 'rounded-full bg-[#9d96b3]', bounce ? 'animate-bounce' : 'animate-pulse')} style={{ animationDelay: `${d}ms` }} />
    ))}
  </span>
)

const ToolPill = ({ done }: { done: boolean }) => (
  <div className='flex items-center self-start rounded-xl border-l-[0.25px] border-[#453d63] bg-[#1f1a33] px-2.5 py-2 text-[11px] font-medium text-[#9d96b3]'>
    {done ? <RiHammerFill className='mr-1 h-3.5 w-3.5' /> : <RiLoader2Line className='mr-1 h-3.5 w-3.5 animate-spin' />}
    {done ? 'Used' : 'Using'}
    <span className='mx-1 text-[#e9e7f1]'>Knowledge</span>
    <RiArrowRightSLine className='h-3.5 w-3.5' />
  </div>
)

const PreviewPanel = ({ s }: { s: S }) => {
  const responding = s.sent && s.run < 4
  return (
    <SidePanel title='Preview' onTopRight={<RiRefreshLine className='h-3.5 w-3.5' />}>
      <div className='flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden p-3'>
        {!s.sent && (
          <div className='m-auto flex w-[220px] flex-col items-center rounded-xl border border-dashed border-[#5c5183] bg-[#1f1a33] px-4 py-5 text-center'>
            <RiChat3Line className='h-5 w-5 text-[#9d96b3]' />
            <div className='mt-2 text-[12.5px] font-semibold text-white'>Nothing to test yet</div>
            <div className='mt-1 text-[11px] text-[#9d96b3]'>{`Send a message below to see how ${AGENT_NAME} responds.`}</div>
          </div>
        )}
        {s.sent && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='max-w-[88%] self-end bg-[#3d335f] px-3.5 py-2.5 text-[11.5px] text-white'>
            {QUERY}
          </motion.div>
        )}
        {s.sent && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex max-w-[95%] flex-col gap-2 self-start bg-[#2a2342] px-3.5 py-2.5 text-[11.5px] leading-snug text-white'>
            {s.run === 0 && <span className='flex h-5 w-6 items-center'><Dots size='h-1 w-1' /></span>}
            {s.run >= 1 && <ToolPill done={s.run >= 2} />}
            {s.answer && <span>{s.answer}</span>}
            {s.run >= 4 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-1'>
                <div className='mb-1.5 flex items-center text-[10px] font-medium text-[#9d96b3]'>
                  CITATIONS
                  <span className='ml-2 h-px grow bg-[#453d63]' />
                </div>
                <span className='inline-flex h-6 items-center gap-1.5 rounded-lg bg-[#32294d] px-2 text-[10.5px] text-[#9d96b3]'>
                  <RiFileTextLine className='h-3 w-3' />
                  Practice handbook.pdf
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
        {s.run >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex gap-0.5 text-[#9d96b3]'>
            {[RiFileList3Line, RiClipboardLine, RiResetLeftLine].map((I, i) => (
              <span key={i} className='flex h-6 w-6 items-center justify-center rounded-md'>
                <I className='h-3.5 w-3.5' />
              </span>
            ))}
          </motion.div>
        )}
      </div>
      <div className='shrink-0 border-t border-[#453d63] bg-[#1f1a33] px-3 pb-3 pt-2.5'>
        {responding && (
          <div className='mb-2 flex items-center justify-between'>
            <span className='flex items-center gap-2 text-[11.5px] font-medium text-[#c6c1d6]'>
              Agent is thinking
              <Dots size='h-1.5 w-1.5' bounce />
            </span>
            <span className='flex items-center gap-1 text-[11px] text-[#9d96b3]'>
              <RiStopCircleLine className='h-3.5 w-3.5' />
              Stop
            </span>
          </div>
        )}
        <div className='flex h-9 items-center gap-2 border-b border-[#5c5183] pl-1 pr-1'>
          <span data-cursor='preview-input' className='min-w-0 flex-1 truncate text-[11.5px]'>
            {!s.sent && s.query ? <span className='text-white'>{s.query}</span> : <span className='text-[#7e7795]'>Ask something to test the agent</span>}
          </span>
          <span data-cursor='preview-send' className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1966ca] text-white'>
            <RiArrowUpLine className='h-4 w-4' />
          </span>
        </div>
      </div>
    </SidePanel>
  )
}

/* ── Autonomous Agent canvas + configuration dock ─────────────────────── */

// The synthetic agent graph the app draws (components/shell/app/flow-canvas):
// four inputs feed AI Agent, which feeds Output.
const AGENT_AT = {
  wide: { trigger: [0, 187], instructions: [240, 0], knowledge: [240, 124], tools: [240, 250], vision: [240, 374], agent: [480, 187], output: [720, 187] },
  // Phones: top to bottom, two inputs above AI Agent and two below it.
  tall: { trigger: [102, 0], instructions: [0, 116], knowledge: [204, 116], agent: [102, 236], tools: [0, 356], vision: [204, 356], output: [102, 476] },
} as const

const agentGraph = (s: S, narrow: boolean): { nodes: GNode[]; edges: GEdge[] } => {
  const at = narrow ? AGENT_AT.tall : AGENT_AT.wide
  // This canvas never runs (flow-canvas/index.tsx): Preview messages leave
  // it exactly as it is. Only selection and configuration change it.
  const base = (id: keyof typeof at, title: string, sub: string, icon: GNode['icon'], color: string, extra: Partial<GNode> = {}): GNode => ({
    id,
    x: at[id][0],
    y: at[id][1],
    title,
    sub,
    icon,
    color,
    configured: true,
    selected: s.selected === id,
    ...extra,
  })
  const nodes = [
    base('trigger', 'Trigger', 'No variables defined', RiFlashlightFill, '#296dff', { output: true }),
    base('instructions', 'Instructions', s.instr ? `${s.instr.length} chars` : 'No instructions set', RiFileTextLine, '#7B4BB8', { output: true, configured: s.instr.length > 0, cursorId: 'node-instructions' }),
    base('knowledge', 'Knowledge', s.kbAdded ? '1 dataset' : 'No datasets', RiBook2Line, '#2E7FA8', { output: true, cursorId: 'node-knowledge' }),
    base('tools', 'Tools', '0 tool(s) enabled', RiToolsLine, '#9A3F92', { output: true }),
    base('vision', 'Vision', 'Vision & file settings', RiEyeLine, '#5B4BC4', { output: true }),
    base('agent', 'AI Agent', 'gpt-4o-mini', RiRobot2Fill, '#3B6FE0', { input: true, output: true }),
    base('output', 'Output', 'Final response', RiFlag2Fill, '#C24E7A', { input: true }),
  ]
  const edges: GEdge[] = [
    { from: 'trigger', to: 'agent' },
    { from: 'instructions', to: 'agent' },
    { from: 'knowledge', to: 'agent' },
    { from: 'tools', to: 'agent', reverse: narrow },
    { from: 'vision', to: 'agent', reverse: narrow },
    { from: 'agent', to: 'output' },
  ]
  return { nodes, edges }
}

// The configuration dock (config-dock.tsx): tabs, then the selected node's
// sub-tabs and form.
const Dock = ({ s }: { s: S }) => (
  <AnimatePresence>
    {s.dock && (
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className='absolute inset-x-2 bottom-2 z-20 rounded-xl border border-[#7e72a8] bg-[#261f3a] shadow-2xl lg:inset-x-3 lg:bottom-3'
      >
        <div className='flex items-center gap-4 border-b border-[#453d63] px-3 pt-2 text-[11.5px] font-medium'>
          <span className='border-b-2 border-[#5a99eb] pb-1.5 text-white'>Configurations</span>
          <span className='pb-1.5 text-[#9d96b3]'>Agent Settings</span>
        </div>
        <div className='flex gap-1.5 px-3 pt-2'>
          {(s.dock === 'instructions' ? ['Instructions', 'Knowledge Prompt', 'Tool Prompt'] : ['Knowledge']).map((t, i) => (
            <span key={t} className={cn('rounded-md px-2 py-0.5 text-[10.5px]', i === 0 ? 'bg-[#1f2b5e] text-white' : 'text-[#9d96b3]')}>{t}</span>
          ))}
        </div>
        <div className='relative p-3'>
          {s.dock === 'instructions'
            ? (
              <div data-cursor='dock-input' className={cn('h-[72px] rounded-lg border bg-[#32294d] p-2 text-[11.5px] leading-snug', s.cursor === 'dock-input' ? 'border-[#5a9ef6]' : 'border-[#5c5183]')}>
                {s.instr ? <span className='text-white'>{s.instr}</span> : <span className='text-[#7e7795]'>Tell the agent who it is and how to behave…</span>}
                {s.cursor === 'dock-input' && <span className='ml-px inline-block h-3.5 w-px translate-y-[2px] animate-pulse bg-white' />}
              </div>
            )
            : (
              <div className='flex h-[72px] items-center justify-between gap-3 rounded-lg border border-[#5c5183] bg-[#32294d] px-3'>
                {s.kbAdded
                  ? (
                    <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className='flex items-center gap-2 text-[12px] text-white'>
                      <span className='flex h-6 w-6 items-center justify-center rounded-md bg-[#2E7FA8]'>
                        <RiBook2Line className='h-3.5 w-3.5' />
                      </span>
                      Practice handbook
                      <span className='text-[10.5px] text-[#9d96b3]'>214 docs</span>
                    </motion.span>
                  )
                  : <span className='text-[11.5px] text-[#9d96b3]'>No datasets yet</span>}
                <span data-cursor='kb-add' className='flex items-center gap-1 rounded-md border border-[#5c5183] px-2 py-1 text-[11px] text-white'>
                  <RiAddLine className='h-3.5 w-3.5' />
                  Add
                </span>
                <AnimatePresence>
                  {s.kbPicker && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className='absolute bottom-[88px] right-3 w-[220px] rounded-lg border border-[#7e72a8] bg-[#3d335f] p-1.5 shadow-2xl'>
                      {['Practice handbook', 'Pricing FAQ'].map((d, i) => (
                        <div key={d} data-cursor={i === 0 ? 'kb-pick' : undefined} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-[11.5px] text-white', i === 0 && s.cursor === 'kb-pick' && 'bg-[#1f2b5e]')}>
                          <RiBook2Line className='h-3.5 w-3.5 text-[#2E7FA8]' />
                          {d}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

const AgentCanvas = ({ s }: { s: S }) => {
  const narrow = useIsNarrow()
  const { nodes, edges } = agentGraph(s, narrow)
  return (
    <div className='xl-app-canvas relative flex-1 overflow-hidden'>
      <Graph
        nodes={nodes}
        edges={edges}
        vertical={narrow}
        edgeStyle='accent'
        className={cn('inset-0', s.dock && 'bottom-[150px] lg:bottom-[170px]', s.previewOpen && 'max-lg:bottom-[55%] lg:right-[316px]')}
      />
      <Dock s={s} />
      <AnimatePresence>{s.previewOpen && <PreviewPanel s={s} />}</AnimatePresence>
      <MobilePublish s={s} />
    </div>
  )
}

/* ── Workflow canvas: built block by block with the "+" on each node ──── */

const WF_BLOCKS = [
  { id: 'trigger', title: 'Trigger', sub: 'Workflow input', icon: RiFlashlightFill, color: '#296dff', time: '4.212 ms', tokens: 0 },
  { id: 'http', title: 'HTTP Request', sub: 'Fetch tomorrow’s bookings', icon: RiGlobalLine, color: '#ee46bc', time: '312.408 ms', tokens: 0 },
  { id: 'ai', title: 'AI Model', sub: 'Write each reminder · gpt-4o', icon: RiBrainFill, color: '#6172f3', time: '1.604 s', tokens: 812 },
  { id: 'end', title: 'End', sub: 'Return the result', icon: RiFlag2Fill, color: '#f04438', time: '2.117 ms', tokens: 0 },
]

const workflowGraph = (s: S, narrow: boolean): { nodes: GNode[]; edges: GEdge[] } => {
  const pos = (i: number) => (narrow ? { x: 0, y: i * 116 } : { x: i * 236, y: 0 })
  if (s.wfNodes === 0) {
    return {
      nodes: [{ id: 'start', ...pos(0), title: 'Pick a start node', sub: 'Defines what triggers the run', icon: RiFlashlightFill, color: '#296dff', cursorId: 'wf-start', dashed: true }],
      edges: [],
    }
  }
  const status = (i: number): NodeStatus => {
    if (!s.runOpen)
      return 'idle'
    if (s.wfRun > i)
      return 'done'
    return s.wfRun === i ? 'running' : 'idle'
  }
  const nodes: GNode[] = WF_BLOCKS.slice(0, s.wfNodes).map((b, i) => {
    const last = i === s.wfNodes - 1
    const plusId = last && s.wfNodes < 4 ? `plus-wf-${i}` : undefined
    return {
      ...b,
      ...pos(i),
      configured: true,
      input: i > 0,
      output: i < 3,
      status: status(i),
      // Not yet reached in a run: dimmed, as the app does with _waitingRun.
      waiting: s.runOpen && s.wfRun < i && s.wfRun < 4,
      plusId,
      hovered: !!plusId && (s.cursor === plusId || s.picker),
      fresh: last && !s.runOpen && i > 0,
    }
  })
  const edges = nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id }))
  return { nodes, edges }
}

type PickRow = { n: string; g: string; i: GNode['icon']; c: string; id?: string }
const PICKER: { group: string; rows: PickRow[] }[] = [
  { group: 'AI', rows: [{ n: 'AI Model', g: 'Prompt a model', i: RiBrainFill, c: '#6172f3', id: 'pick-ai' }, { n: 'Intent Classifier', g: 'Route by what was meant', i: RiSparkling2Fill, c: '#6172f3' }] },
  { group: 'Knowledge', rows: [{ n: 'Knowledge Search', g: 'Look up your content', i: RiSearchEyeFill, c: '#17b26a' }] },
  { group: 'Logic', rows: [{ n: 'Condition', g: 'Branch on a rule', i: RiGitBranchFill, c: '#06aed4' }] },
  { group: 'Tools', rows: [{ n: 'HTTP Request', g: 'Call any endpoint', i: RiGlobalLine, c: '#ee46bc', id: 'pick-http' }] },
  { group: 'Output', rows: [{ n: 'End', g: 'Return the result', i: RiFlag2Fill, c: '#f04438', id: 'pick-end' }] },
]

const Picker = ({ s }: { s: S }) => (
  <AnimatePresence>
    {s.picker && (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className='absolute left-1/2 top-3 z-20 w-[250px] -translate-x-1/2 rounded-xl border border-[#7e72a8] bg-[#3d335f] p-2.5 shadow-2xl lg:left-auto lg:right-6 lg:translate-x-0'
      >
        <div className='text-[12px] font-semibold text-white'>Add a step</div>
        <div className='mt-2 flex h-8 items-center gap-2 rounded-lg bg-[#261f3a] px-2.5 text-[11.5px] text-[#9d96b3]'>
          <RiSearchLine className='h-3.5 w-3.5' />
          Search steps and tools
        </div>
        <div className='mt-2 flex gap-1'>
          {['All', 'AI', 'Logic', 'Transform', 'Tools'].map((c, i) => (
            <span key={c} className={cn('rounded-md px-1.5 py-0.5 text-[10.5px]', i === 0 ? 'bg-[#1f2b5e] text-white' : 'text-[#c6c1d6]')}>{c}</span>
          ))}
        </div>
        {PICKER.map(g => (
          <div key={g.group} className='mt-1.5'>
            <div className='px-1 text-[10px] font-semibold uppercase tracking-wide text-[#9d96b3]'>{g.group}</div>
            {g.rows.map(r => (
              <div key={r.n} data-cursor={r.id} className={cn('flex items-center gap-2 rounded-lg px-1.5 py-1', r.id && s.pickHover === r.id && 'bg-[#1f2b5e]')}>
                <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white' style={{ background: r.c }}>
                  <r.i className='h-3 w-3' />
                </span>
                <span className='text-[11.5px] font-medium text-white'>{r.n}</span>
                <span className='truncate text-[10.5px] text-[#9d96b3]'>{r.g}</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
)

const StartPanel = ({ s }: { s: S }) => (
  <AnimatePresence>
    {s.wfStartOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className='absolute left-1/2 top-3 z-20 w-[270px] -translate-x-1/2 rounded-xl border border-[#7e72a8] bg-[#3d335f] p-3 shadow-2xl'
      >
        <div className='text-[12.5px] font-semibold text-white'>Pick a start node</div>
        <div className='mt-0.5 text-[10.5px] leading-snug text-[#9d96b3]'>The start node defines what triggers your workflow to run.</div>
        {[
          { id: 'pick-trigger', n: 'Trigger', g: 'Start the flow', i: RiFlashlightFill },
          { id: undefined, n: 'Webhook Trigger', g: 'When an endpoint is called', i: RiWebhookLine },
          { id: undefined, n: 'Custom App Trigger', g: 'e.g. new mail arriving', i: RiMailLine },
        ].map(r => (
          <div key={r.n} data-cursor={r.id} className={cn('mt-2 flex items-center gap-2 rounded-lg px-1.5 py-1.5', r.id && s.cursor === r.id && 'bg-[#1f2b5e]')}>
            <span className='flex h-6 w-6 items-center justify-center rounded-md bg-[#296dff] text-white'>
              <r.i className='h-3.5 w-3.5' />
            </span>
            <span>
              <span className='block text-[11.5px] font-medium text-white'>{r.n}</span>
              <span className='block text-[10px] text-[#9d96b3]'>{r.g}</span>
            </span>
          </div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
)

const Section = ({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) => (
  <div className='overflow-hidden rounded-xl border border-[#453d63]'>
    <div className='flex items-center gap-1.5 bg-[#2a2342] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#9d96b3]'>
      <RiArrowRightSLine className='h-3.5 w-3.5 rotate-90' />
      {title}
      {meta && <span className='text-[#7e7795]'>{meta}</span>}
    </div>
    <div className='p-1.5'>{children}</div>
  </div>
)

const RunPanel = ({ s }: { s: S }) => {
  const done = s.wfRun >= 4
  const started = s.wfRun >= 0
  const shown = Math.min(4, s.wfRun + 1)
  return (
    <SidePanel title={<>Run<span className='ml-1 font-medium text-[#7e7795]'>#1</span></>}>
      <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3'>
        {/* Outcome band (run-outcome.tsx) */}
        <div className={cn('flex items-center justify-between rounded-xl border border-[#453d63] px-3 py-2', done ? 'bg-[#28ac6a33]' : 'bg-[#1f2b5e66]')}>
          <span className='flex items-center gap-2 text-[12px] font-semibold text-white'>
            <span className={cn('h-2 w-2 rounded-full', done ? 'bg-[#28ac6a]' : 'bg-[#5a99eb]')} />
            {done ? 'Completed' : 'Running…'}
          </span>
          {done
            ? (
              <span className='flex items-center gap-2 text-[11px] tabular-nums text-[#c6c1d6]'>
                1.923s
                <span className='h-3 w-px bg-white/15' />
                812 tokens
              </span>
            )
            : <span className='h-2 w-16 rounded-sm bg-[#7e7795]/40' />}
        </div>

        {!started && (
          <div className='flex items-center gap-2 px-1 text-[11.5px] text-[#9d96b3]'>
            <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#453d63] border-t-[#5a99eb]' />
            Starting the run…
          </div>
        )}

        {done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Section title='Result'>
              <div className='rounded-lg bg-[#0a0826] p-2 font-mono text-[10.5px] leading-relaxed'>
                <div className='mb-1 font-sans text-[9.5px] font-semibold uppercase tracking-wide text-[#9d96b3]'>Output</div>
                <div className='text-[#c6c1d6]'>{'{'}</div>
                <div className='pl-3'>
                  <span className='text-[#a5b4fc]'>&quot;reminders_sent&quot;</span>
                  <span className='text-[#c6c1d6]'>: </span>
                  <span className='text-[#fbbf24]'>14</span>
                  <span className='text-[#c6c1d6]'>,</span>
                </div>
                <div className='pl-3'>
                  <span className='text-[#a5b4fc]'>&quot;channel&quot;</span>
                  <span className='text-[#c6c1d6]'>: </span>
                  <span className='text-[#6ee7b7]'>&quot;sms&quot;</span>
                </div>
                <div className='text-[#c6c1d6]'>{'}'}</div>
              </div>
            </Section>
          </motion.div>
        )}

        {started && (
          <Section title='Steps' meta={String(shown)}>
            <div className='space-y-1'>
              {WF_BLOCKS.slice(0, shown).map((b, i) => {
                const running = s.wfRun === i
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex items-center gap-1.5 rounded-[10px] border border-[#453d63] bg-[#0a0826] py-1.5 pl-1 pr-2.5'
                  >
                    <RiArrowRightSLine className='h-3.5 w-3.5 shrink-0 text-[#7e7795]' />
                    <span className='flex h-4 w-4 shrink-0 items-center justify-center rounded text-white' style={{ background: b.color }}>
                      <b.icon className='h-2.5 w-2.5' />
                    </span>
                    <span className='min-w-0 grow truncate text-[10.5px] font-semibold uppercase text-[#c6c1d6]'>{b.title}</span>
                    {running
                      ? (
                        <span className='flex items-center text-[11px] font-medium text-[#5a99eb]'>
                          <span className='mr-1.5'>Running</span>
                          <RiLoader2Line className='h-3.5 w-3.5 animate-spin' />
                        </span>
                      )
                      : (
                        <span className='flex items-center text-[10.5px] tabular-nums text-[#9d96b3]'>
                          {b.tokens ? `${b.tokens} tokens · ` : ''}
                          {b.time}
                          <RiCheckboxCircleFill className='ml-2 h-3.5 w-3.5 text-[#28ac6a]' />
                        </span>
                      )}
                  </motion.div>
                )
              })}
            </div>
          </Section>
        )}
      </div>
    </SidePanel>
  )
}

const WorkflowCanvas = ({ s }: { s: S }) => {
  const narrow = useIsNarrow()
  const { nodes, edges } = workflowGraph(s, narrow)
  return (
    <div className='xl-app-canvas relative flex-1 overflow-hidden'>
      <Graph nodes={nodes} edges={edges} vertical={narrow} className={cn('inset-0', s.runOpen && 'max-lg:bottom-[55%] lg:right-[316px]')} />
      <StartPanel s={s} />
      <Picker s={s} />
      <AnimatePresence>{s.runOpen && <RunPanel s={s} />}</AnimatePresence>
    </div>
  )
}

export const CanvasScene = ({ s }: { s: S }) => (
  <div className='relative flex flex-1 flex-col'>
    <TopBar s={s} />
    {s.kind === 'agent' ? <AgentCanvas s={s} /> : <WorkflowCanvas s={s} />}
  </div>
)

/* ── Channels › Phone Number ──────────────────────────────────────────── */

export const PhoneScene = ({ s }: { s: S }) => (
  <div className='relative flex-1 p-4 sm:p-6'>
    <div className='flex items-center justify-between'>
      <div className='text-[17px] font-semibold text-white'>Phone Number</div>
      <div className='hidden gap-1.5 sm:flex'>
        <Btn primary>Buy Number</Btn>
        <Btn>Batch Calls</Btn>
        <Btn>
          <RiRefreshLine className='h-3.5 w-3.5' />
          Refresh
        </Btn>
      </div>
    </div>
    <div className='mt-4 grid grid-cols-3 gap-2'>
      {[
        ['Phone Numbers', '1'],
        ['Assigned to Agents', s.assigned ? '1' : '0'],
        ['Outbound Enabled', '1'],
      ].map(([k, v]) => (
        <div key={k} className='rounded-xl border border-[#453d63] bg-[#261f3a] p-2.5 sm:p-3'>
          <div className='text-[10.5px] leading-tight text-[#9d96b3]'>{k}</div>
          <motion.div key={v} initial={{ scale: 1.3, color: '#5a99eb' }} animate={{ scale: 1, color: '#ffffff' }} className='mt-1 origin-left text-[18px] font-semibold'>{v}</motion.div>
        </div>
      ))}
    </div>

    <div className='mt-4 overflow-hidden rounded-xl border border-[#453d63]'>
      <div className='hidden grid-cols-[1.2fr_1.3fr_0.7fr_1.2fr_0.7fr] bg-[#261f3a] px-3 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-[#9d96b3] md:grid'>
        <span>Phone Number</span>
        <span>Capabilities</span>
        <span>Status</span>
        <span>Assigned Agent</span>
        <span>Actions</span>
      </div>
      <div className='grid grid-cols-2 items-center gap-2 bg-[#32294d] px-3 py-3 text-[12px] md:grid-cols-[1.2fr_1.3fr_0.7fr_1.2fr_0.7fr] md:gap-0'>
        <span className='font-medium text-white'>+1 (415) 555-0100</span>
        <span className='flex flex-wrap gap-1'>
          {['Inbound', 'Outbound', 'Krisp'].map(b => (
            <span key={b} className='rounded bg-[#1f2b5e] px-1.5 py-0.5 text-[10px] text-[#c6d6ff]'>{b}</span>
          ))}
        </span>
        <span className='flex items-center gap-1 text-emerald-300'>
          <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
          Active
        </span>
        <span>
          {s.assigned
            ? (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className='inline-flex items-center gap-1.5 text-white'>
                <span className='flex h-5 w-5 items-center justify-center rounded bg-[#EDE9FE] text-[10px]'>🤖</span>
                {AGENT_NAME}
              </motion.span>
            )
            : <span className='text-[#7e7795]'>—</span>}
        </span>
        <span>
          <Btn id='btn-assign' className='h-7'>{s.assigned ? 'Change' : 'Assign'}</Btn>
        </span>
      </div>
    </div>

    <AnimatePresence>
      {s.assignOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='absolute inset-0 z-10 flex items-center justify-center bg-[rgba(4,3,16,0.55)] p-4'
        >
          <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className='w-full max-w-[300px] rounded-2xl border border-[#7e72a8] bg-[#32294d] p-4 shadow-2xl'>
            <div className='text-[14px] font-semibold text-white'>Assign agent</div>
            {[
              { g: 'Autonomous Agent', n: AGENT_NAME, e: '🤖', bg: '#EDE9FE', id: 'pick-agent' },
              { g: 'Agent Flow', n: 'Intake flow', e: '🔀', bg: '#CCFBF1' },
              { g: 'AI Chatbot', n: 'Website helper', e: '💬', bg: '#E0F2FE' },
            ].map(r => (
              <div key={r.n} className='mt-3'>
                <div className='text-[10px] font-semibold uppercase tracking-wide text-[#9d96b3]'>{r.g}</div>
                <div data-cursor={r.id} className={cn('mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-white', r.id && s.cursor === r.id && 'bg-[#1f2b5e]')}>
                  <span className='flex h-6 w-6 items-center justify-center rounded-md text-[12px]' style={{ background: r.bg }}>{r.e}</span>
                  {r.n}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {s.live && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className='absolute inset-x-4 bottom-5 z-10 mx-auto flex max-w-[440px] items-center gap-3 rounded-2xl border border-emerald-400/40 bg-[#123027] p-3.5 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.45)]'
        >
          <span className='relative flex h-10 w-10 shrink-0 items-center justify-center'>
            <span className='xl-pulse-ring absolute inset-0 rounded-full bg-emerald-400/40' />
            <span className='relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500'>
              <RiPhoneFill className='h-5 w-5 text-white' />
            </span>
          </span>
          <div>
            <div className='text-[13.5px] font-semibold text-white'>{`${AGENT_NAME} is live`}</div>
            <div className='text-[12px] text-emerald-200/80'>It answers the next call to +1 (415) 555-0100.</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)
