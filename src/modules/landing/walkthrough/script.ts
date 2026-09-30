'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/* ─────────────────────────────────────────────────────────────────────────
   The walkthrough's script: one timeline of small state changes (the
   cursor moving, a click, a character typed, a panel opening) that the
   scenes render. Everything the viewer sees is derived from this state, so
   jumping to a chapter is just replaying the script up to its start.
   ───────────────────────────────────────────────────────────────────────── */

export type Scene = 'list' | 'canvas' | 'phone'
export type Kind = 'agent' | 'workflow'

export type S = {
  chapter: number
  kind: Kind
  scene: Scene
  section: 'conv' | 'auto' | 'channels'
  modal: boolean
  name: string
  desc: string
  toast: string | null
  // Configure the agent (bottom dock)
  dock: 'instructions' | 'knowledge' | null
  selected: string | null
  instr: string
  kbPicker: boolean
  kbAdded: boolean
  // Test it (Preview)
  previewOpen: boolean
  query: string
  sent: boolean
  run: number // Preview: 0 loading · 1 using knowledge · 2 used, answer streaming · 4 done
  answer: string
  // Publish
  publishOpen: boolean
  voiceOn: boolean
  published: boolean
  // Give it a number
  assignOpen: boolean
  assigned: boolean
  live: boolean
  // Workflow
  wfStartOpen: boolean
  wfNodes: number // 0 = "Pick a start node", then trigger, http, ai, end
  picker: boolean
  pickHover: string | null
  runOpen: boolean
  wfRun: number // -1 starting · index of the step running · 4 finished
  // Cursor
  cursor: string
  click: number
}

export const INITIAL: S = {
  chapter: 0,
  kind: 'agent',
  scene: 'list',
  section: 'conv',
  modal: false,
  name: '',
  desc: '',
  toast: null,
  dock: null,
  selected: null,
  instr: '',
  kbPicker: false,
  kbAdded: false,
  previewOpen: false,
  query: '',
  sent: false,
  run: -1,
  answer: '',
  publishOpen: false,
  voiceOn: false,
  published: false,
  assignOpen: false,
  assigned: false,
  live: false,
  wfStartOpen: false,
  wfNodes: 0,
  picker: false,
  pickHover: null,
  runOpen: false,
  wfRun: -1,
  cursor: 'nav-agent',
  click: 0,
}

export const AGENT_NAME = 'Front desk'
export const AGENT_DESC = 'Answers calls and books appointments'
// The persona the app itself uses as its example (flow-schema-panel).
export const INSTR = 'You are Ada, a receptionist for a dental practice. Be brief and warm.'
export const QUERY = 'Can I move my cleaning to Friday?'
export const ANSWER = 'Of course. Friday has 10:30 or 2:15 open with Dr. Shah. Which works better for you?'
export const WF_NAME = 'Appointment reminders'

type Ev = { at: number; apply: (s: S) => Partial<S> }

const buildScript = () => {
  const ev: Ev[] = []
  const starts: number[] = []
  let t = 0
  const at = (dt: number, apply: Ev['apply']) => {
    t += dt
    ev.push({ at: t, apply })
  }
  const move = (dt: number, id: string) => at(dt, () => ({ cursor: id }))
  const click = (dt: number, apply: (s: S) => Partial<S> = () => ({})) => at(dt, s => ({ ...apply(s), click: s.click + 1 }))
  const type = (per: number, text: string, key: 'name' | 'desc' | 'query' | 'instr') => {
    for (const ch of text)
      at(per, s => ({ [key]: s[key] + ch }))
  }
  const chapter = (dt: number, n: number, extra: Partial<S> = {}) => {
    at(dt, () => ({ chapter: n, ...extra }))
    starts.push(t)
  }
  const pick = (plusId: string, pickId: string, nodes: number) => {
    move(600, plusId)
    click(600, () => ({ picker: true }))
    move(600, pickId)
    at(200, () => ({ pickHover: pickId }))
    click(400, () => ({ picker: false, pickHover: null, wfNodes: nodes }))
  }

  // 1 · Create an agent
  starts.push(t)
  move(500, 'nav-agent')
  click(700)
  move(600, 'btn-create-blank')
  click(1000, () => ({ modal: true }))
  move(500, 'field-name')
  click(400)
  type(75, AGENT_NAME, 'name')
  move(300, 'field-desc')
  click(400)
  type(30, AGENT_DESC, 'desc')
  move(400, 'btn-create')
  click(700, () => ({ modal: false, scene: 'canvas', toast: 'App created' }))

  // 2 · Configure it: instructions, then knowledge, in the bottom dock
  chapter(900, 1)
  at(600, () => ({ toast: null }))
  move(100, 'node-instructions')
  click(700, () => ({ dock: 'instructions', selected: 'instructions' }))
  move(600, 'dock-input')
  click(400)
  type(26, INSTR, 'instr')
  move(500, 'node-knowledge')
  click(700, () => ({ dock: 'knowledge', selected: 'knowledge' }))
  move(600, 'kb-add')
  click(600, () => ({ kbPicker: true }))
  move(600, 'kb-pick')
  click(600, () => ({ kbPicker: false, kbAdded: true }))
  at(1000, () => ({ dock: null, selected: null }))

  // 3 · Test it: ask in Preview, watch each block run, read the answer
  chapter(700, 2)
  move(0, 'btn-preview')
  click(800, () => ({ previewOpen: true }))
  move(700, 'preview-input')
  click(500)
  type(34, QUERY, 'query')
  move(300, 'preview-send')
  click(500, () => ({ sent: true, run: 0 }))
  at(450, () => ({ run: 1 }))
  at(700, () => ({ run: 2 }))
  for (const w of ANSWER.split(' '))
    at(55, s => ({ answer: s.answer ? `${s.answer} ${w}` : w }))
  at(200, () => ({ run: 3 }))
  at(300, () => ({ run: 4 }))

  // 4 · Publish
  chapter(2200, 3, { previewOpen: false })
  move(300, 'btn-publish')
  click(800, () => ({ publishOpen: true }))
  move(700, 'toggle-voice')
  click(700, () => ({ voiceOn: true }))
  move(600, 'btn-publish-confirm')
  click(700, () => ({ published: true }))
  at(900, () => ({ publishOpen: false, toast: 'Published' }))

  // 5 · Give it a number
  chapter(1200, 4, { toast: null })
  move(0, 'nav-phone')
  click(900, () => ({ section: 'channels', scene: 'phone' }))
  move(800, 'btn-assign')
  click(800, () => ({ assignOpen: true }))
  move(700, 'pick-agent')
  click(800, () => ({ assignOpen: false, assigned: true, toast: 'Agent assigned' }))
  at(900, () => ({ live: true, toast: null }))

  // 6 · Automate with a workflow: build it node by node, run it, read it
  chapter(2600, 5, { live: false })
  move(0, 'nav-workflow')
  click(900, () => ({ section: 'auto', kind: 'workflow', scene: 'list', name: '', desc: '' }))
  move(700, 'btn-create-blank')
  click(900, () => ({ modal: true }))
  move(500, 'field-name')
  click(400)
  type(50, WF_NAME, 'name')
  move(400, 'btn-create')
  click(700, () => ({ modal: false, scene: 'canvas', toast: 'App created' }))
  at(700, () => ({ toast: null }))
  move(100, 'wf-start')
  click(700, () => ({ wfStartOpen: true }))
  move(700, 'pick-trigger')
  click(600, () => ({ wfStartOpen: false, wfNodes: 1 }))
  // The "+" appears on a block's output handle when it is hovered.
  pick('plus-wf-0', 'pick-http', 2)
  pick('plus-wf-1', 'pick-ai', 3)
  pick('plus-wf-2', 'pick-end', 4)
  move(800, 'btn-run')
  click(700, () => ({ runOpen: true, wfRun: -1 }))
  at(600, () => ({ wfRun: 0 }))
  at(500, () => ({ wfRun: 1 }))
  at(900, () => ({ wfRun: 2 }))
  at(1500, () => ({ wfRun: 3 }))
  at(400, () => ({ wfRun: 4 }))

  return { ev, starts, end: t + 4500 }
}

export const SCRIPT = buildScript()

export const stateAt = (t: number) =>
  SCRIPT.ev.filter(e => e.at < t).reduce<S>((s, e) => ({ ...s, ...e.apply(s) }), INITIAL)

export const chapterLen = (i: number) => (SCRIPT.starts[i + 1] ?? SCRIPT.end) - SCRIPT.starts[i]

export const CHAPTERS = [
  { title: 'Create an agent', blurb: 'Pick Autonomous Agent in the sidebar and create it from blank. Name it, and its canvas opens.' },
  { title: 'Configure it', blurb: 'Click Instructions and write how it should behave. Click Knowledge and add your documents.' },
  { title: 'Test it', blurb: 'Ask it something in Preview. It searches your knowledge, answers, and cites the document it used.' },
  { title: 'Publish', blurb: 'Publish Changes, and switch on voice calls for the agent’s API.' },
  { title: 'Give it a number', blurb: 'Under Channels › Phone Number, assign the agent. It answers the very next call.' },
  { title: 'Automate with a workflow', blurb: 'Build a workflow block by block with the + on each node, press Run, and watch it go step by step to the result.' },
]

/** Plays the script while the section is on screen; chapters can be jumped to. */
export const useWalkthrough = (rootRef: RefObject<HTMLElement | null>) => {
  const [state, setState] = useState<S>(INITIAL)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const clock = useRef({ t: 0, startedAt: 0 })
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const playFrom = useCallback((t0: number) => {
    clear()
    clock.current = { t: t0, startedAt: performance.now() }
    setState(stateAt(t0))
    SCRIPT.ev.filter(e => e.at >= t0).forEach((e) => {
      timers.current.push(setTimeout(() => setState(s => ({ ...s, ...e.apply(s) })), e.at - t0))
    })
    timers.current.push(setTimeout(() => {
      setRun(r => r + 1)
      playFrom(0)
    }, SCRIPT.end - t0))
  }, [])

  const pause = useCallback(() => {
    clock.current.t += performance.now() - clock.current.startedAt
    clear()
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el)
      return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState(stateAt(SCRIPT.starts[3] - 1))
      return
    }
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => {
      io.disconnect()
      clear()
    }
  }, [rootRef])

  useEffect(() => {
    if (playing)
      playFrom(clock.current.t)
    else
      pause()
  }, [playing, playFrom, pause])

  const jump = (chapter: number) => {
    setRun(r => r + 1)
    if (playing) {
      playFrom(SCRIPT.starts[chapter])
    }
    else {
      clock.current.t = SCRIPT.starts[chapter]
      setState(stateAt(SCRIPT.starts[chapter]))
    }
  }

  return { state, playing, run, jump }
}
