'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { RiCheckLine } from '@remixicon/react'
import { RiCheckboxCircleFill, RiLoader2Line } from '@remixicon/react'
import cn from '@/lib/classnames'

/* ─────────────────────────────────────────────────────────────────────────
   A replica of the real editor canvas. Every visual rule here is taken from
   the app, so the demo behaves like the product:

   Node card (modules/flows/nodes/_base/components/node-card-shell.tsx)
   - idle: transparent border, accent ring + glow
       box-shadow: 0 0 0 1px <accent>, 0 0 16px 0 <accent @ 33%>
   - selected: blue option-card ring (#5289ff) with a wide soft halo
   - running: #5a99eb border/ring/glow, and in the top-right of the card a
     20px circle (#1f2b5e) with a spinning 12px RiLoader2Line
   - succeeded: #1f8552 border/ring/glow, circle #1c3428 with a #28ac6a check
   - not yet reached during a run: 70% opacity (_waitingRun)
   - no durations on the card; times live only in the run panel
   - the green "Configured" pill never changes because of a run

   Edges (modules/flows/custom-edge.tsx, utils/edge.ts)
   - never animated: no dashes, no flow. (The code passes an `xp-edge-flow`
     class, but React Flow's BaseEdge drops it, so it never renders.)
   - workflow idle: #5c5183, 1.5px; reached: a static gradient from the
     source status colour to the target status colour (succeeded #28ac6a,
     running #5a99eb), 3px, drop-shadow(0 0 4px #5a99eb); orthogonal
     routing with rounded corners
   - agent settings canvas: the source node's accent, 2px, round cap,
     drop-shadow(0 0 2.5px accent); static, and it never reacts to runs
   ───────────────────────────────────────────────────────────────────────── */

export type NodeStatus = 'idle' | 'running' | 'done'

export type GNode = {
  id: string
  x: number
  y: number
  title: string
  sub: string
  icon: typeof RiCheckLine
  color: string
  configured?: boolean
  status?: NodeStatus
  // Dimmed while a run is in progress and this node hasn't started yet.
  waiting?: boolean
  input?: boolean
  output?: boolean
  // Cursor target for clicking the node itself.
  cursorId?: string
  // Cursor target for the "+" on the output handle; shown while hovered.
  plusId?: string
  hovered?: boolean
  selected?: boolean
  // Just added: pops in.
  fresh?: boolean
  dashed?: boolean
}

// reverse: on the vertical layout, run from the top of `from` up to the
// bottom of `to` (for inputs placed below the node they feed).
export type GEdge = { from: string; to: string; reverse?: boolean }

export const NODE_W = 176
export const NODE_H = 88

const SEL = '#5289ff'
const RUN = { running: '#5a99eb', done: '#1f8552' }
const GLYPH = {
  running: { bg: '#1f2b5e', fg: '#5a99eb' },
  done: { bg: '#1c3428', fg: '#28ac6a' },
}
const EDGE_IDLE = '#5c5183'
const EDGE_STATUS = { done: '#28ac6a', running: '#5a99eb' }

const ringFor = (n: GNode) => {
  if (n.selected)
    return { border: '#7e72a8', shadow: `0 0 0 2px ${SEL}, 0 0 0 6px ${SEL}4d, 0 0 26px 5px ${SEL}80` }
  if (n.status && n.status !== 'idle') {
    const c = RUN[n.status]
    return { border: c, shadow: `0 0 0 1px ${c}, 0 0 16px 0 ${c}54` }
  }
  return { border: 'transparent', shadow: `0 0 0 1px ${n.color}, 0 0 16px 0 ${n.color}54` }
}

const GraphNode = ({ n, vertical, w }: { n: GNode; vertical: boolean; w: number }) => {
  const ring = ringFor(n)
  const glyph = n.status && n.status !== 'idle' ? GLYPH[n.status] : null
  return (
    <motion.div
      initial={n.fresh ? { opacity: 0, scale: 0.85 } : false}
      animate={{ opacity: n.waiting ? 0.7 : 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      data-cursor={n.cursorId}
      className={cn('absolute rounded-[13px] border bg-[#32294d] shadow-xs', n.dashed && '!border-dashed !border-[#7e72a8]')}
      style={{ left: n.x, top: n.y, width: w, height: NODE_H, borderColor: ring.border, boxShadow: n.dashed ? undefined : ring.shadow }}
    >
      {/* Top row: icon tile left; run glyph right (ml-auto), as in the shell. */}
      <div className='flex items-start px-3 pt-2.5'>
        <span className='flex h-6 w-6 items-center justify-center rounded-md border-[0.5px] border-white/10 text-white shadow-md' style={{ background: n.color }}>
          <n.icon className='h-3.5 w-3.5' />
        </span>
        {glyph && (
          <span className='ml-auto flex h-5 w-5 items-center justify-center rounded-full' style={{ background: glyph.bg, color: glyph.fg }}>
            {n.status === 'running' ? <RiLoader2Line className='h-3 w-3 animate-spin' /> : <RiCheckboxCircleFill className='h-3 w-3' />}
          </span>
        )}
      </div>
      {/* Status slot: its own right-aligned row between icon and title. */}
      <div className='flex h-[18px] justify-end px-3 pt-0.5'>
        {n.configured && (
          <span className='flex items-center gap-1 rounded-md bg-[#1c3428] px-1.5 py-0.5 text-[9px] font-medium text-[#28ac6a]'>
            <RiCheckboxCircleFill className='h-2.5 w-2.5' />
            Configured
          </span>
        )}
      </div>
      <div className='px-3 pt-0.5'>
        <div className='truncate text-[11.5px] font-semibold text-white'>{n.title}</div>
        <div className='truncate text-[9.5px] text-[#9d96b3]'>{n.sub}</div>
      </div>

      {/* Handles */}
      {n.input && <span className={cn('absolute h-2 w-2 rounded-full border border-[#32294d] bg-[#9d96b3]', vertical ? 'left-1/2 top-[-4px] -translate-x-1/2' : 'left-[-4px] top-1/2 -translate-y-1/2')} />}
      {(n.output || n.plusId) && (
        <span className={cn('absolute h-2 w-2 rounded-full border border-[#32294d] bg-[#9d96b3]', vertical ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : 'right-[-4px] top-1/2 -translate-y-1/2')} />
      )}
      {n.plusId && (
        <span
          data-cursor={n.plusId}
          className={cn(
            'absolute flex h-5 w-5 items-center justify-center rounded-full bg-[#1966ca] text-[13px] font-bold leading-none text-white shadow-lg transition-all duration-200',
            vertical ? 'bottom-[-10px] left-1/2 -translate-x-1/2' : 'right-[-10px] top-1/2 -translate-y-1/2',
            n.hovered ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        >
          +
        </span>
      )}
    </motion.div>
  )
}

// v: the edge leaves and enters through top/bottom rather than the sides.
type Pt = { x1: number; y1: number; x2: number; y2: number; v: boolean }

const endpoints = (a: GNode, b: GNode, vertical: boolean, reverse: boolean | undefined, W: number): Pt => {
  if (vertical && reverse)
    return { x1: a.x + W / 2, y1: a.y, x2: b.x + W / 2, y2: b.y + NODE_H, v: true }
  if (vertical)
    return { x1: a.x + W / 2, y1: a.y + NODE_H, x2: b.x + W / 2, y2: b.y, v: true }
  // Side to side when the target is clear to the right or left; otherwise
  // bottom to top (or top to bottom), so no edge ever doubles back.
  if (b.x >= a.x + W)
    return { x1: a.x + W, y1: a.y + NODE_H / 2, x2: b.x, y2: b.y + NODE_H / 2, v: false }
  if (b.x + W <= a.x)
    return { x1: a.x, y1: a.y + NODE_H / 2, x2: b.x + W, y2: b.y + NODE_H / 2, v: false }
  if (b.y >= a.y)
    return { x1: a.x + W / 2, y1: a.y + NODE_H, x2: b.x + W / 2, y2: b.y, v: true }
  return { x1: a.x + W / 2, y1: a.y, x2: b.x + W / 2, y2: b.y + NODE_H, v: true }
}

// The agent settings canvas draws smooth curves.
const curve = ({ x1, y1, x2, y2, v }: Pt) => {
  if (v) {
    const my = (y1 + y2) / 2
    return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
  }
  const mx = (x1 + x2) / 2
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
}

// The workflow canvas routes orthogonally with two rounded corners.
const orthogonal = ({ x1, y1, x2, y2, v }: Pt) => {
  const r = 10
  if (v) {
    if (Math.abs(x1 - x2) < 1)
      return `M${x1},${y1} L${x2},${y2}`
    const my = (y1 + y2) / 2
    const sy = Math.sign(y2 - y1) || 1
    const dx = Math.sign(x2 - x1) * r
    return `M${x1},${y1} L${x1},${my - sy * r} Q${x1},${my} ${x1 + dx},${my} L${x2 - dx},${my} Q${x2},${my} ${x2},${my + sy * r} L${x2},${y2}`
  }
  if (Math.abs(y1 - y2) < 1)
    return `M${x1},${y1} L${x2},${y2}`
  const mx = (x1 + x2) / 2
  const sx = Math.sign(x2 - x1) || 1
  const dy = Math.sign(y2 - y1) * r
  return `M${x1},${y1} L${mx - sx * r},${y1} Q${mx},${y1} ${mx},${y1 + dy} L${mx},${y2 - dy} Q${mx},${y2} ${mx + sx * r},${y2} L${x2},${y2}`
}

/** The zoom control in the canvas' bottom-left corner. */
const Zoom = ({ scale }: { scale: number }) => (
  <div className='absolute bottom-3 left-3 z-10 hidden w-8 flex-col items-center rounded-lg border border-[#453d63] bg-[#1a1535] py-1.5 text-[#c6c1d6] sm:flex'>
    <span className='text-[13px] leading-4'>+</span>
    <span className='relative my-1.5 h-12 w-[2px] rounded-full bg-[#453d63]'>
      <span className='absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-[#5a99eb] bg-[#1a1535] transition-all duration-500' style={{ bottom: `calc(${Math.round(scale * 100)}% - 5px)` }} />
    </span>
    <span className='text-[13px] leading-4'>−</span>
    <span className='mt-1 border-t border-[#453d63] pt-1 text-[9px] tabular-nums'>{`${Math.round(scale * 100)}%`}</span>
  </div>
)

/**
 * Lays out nodes in their own coordinate space and scales that space to fit
 * the container (never above 100%), centred — like React Flow's fitView.
 * `edges`: 'accent' for the agent settings canvas, 'run' for flow canvases.
 */
export const Graph = ({
  nodes,
  edges,
  vertical = false,
  className,
  zoom = true,
  pad = 36,
  edgeStyle = 'run',
  nodeW = NODE_W,
}: {
  nodes: GNode[]
  edges: GEdge[]
  vertical?: boolean
  className?: string
  // The zoom control belongs to the editor replica; small previews drop it.
  zoom?: boolean
  pad?: number
  edgeStyle?: 'accent' | 'run'
  // Node card width; the hero uses narrower cards to fit a landscape canvas.
  nodeW?: number
}) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ s: 1, x: 0, y: 0 })

  const gw = Math.max(...nodes.map(n => n.x + nodeW)) + 12
  const gh = Math.max(...nodes.map(n => n.y + NODE_H)) + 12

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box)
      return
    const place = () => {
      const s = Math.min(1, (box.clientWidth - pad * 2) / gw, (box.clientHeight - pad * 2) / gh)
      setFit({ s, x: (box.clientWidth - gw * s) / 2, y: (box.clientHeight - gh * s) / 2 })
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(box)
    return () => ro.disconnect()
  }, [gw, gh, pad])

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]))
  const gradId = useRef(`xl-edge-${Math.random().toString(36).slice(2, 8)}`).current

  return (
    <div ref={boxRef} className={cn('absolute overflow-hidden transition-[inset] duration-500', className)}>
      <motion.div
        className='absolute left-0 top-0 origin-top-left'
        style={{ width: gw, height: gh }}
        animate={{ x: fit.x, y: fit.y, scale: fit.s }}
        transition={{ type: 'spring', stiffness: 170, damping: 26 }}
      >
        <svg className='absolute inset-0 overflow-visible' width={gw} height={gh} aria-hidden>
          <defs>
            {edges.map((e, i) => {
              const a = byId[e.from]
              const b = byId[e.to]
              if (!a || !b || edgeStyle !== 'run' || a.status !== 'done' || !b.status || b.status === 'idle')
                return null
              const p = endpoints(a, b, vertical, e.reverse, nodeW)
              return (
                <linearGradient key={i} id={`${gradId}-${i}`} gradientUnits='userSpaceOnUse' x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}>
                  <stop offset='0' stopColor={EDGE_STATUS.done} />
                  <stop offset='1' stopColor={EDGE_STATUS[b.status]} />
                </linearGradient>
              )
            })}
          </defs>
          {edges.map((e, i) => {
            const a = byId[e.from]
            const b = byId[e.to]
            if (!a || !b)
              return null
            const p = endpoints(a, b, vertical, e.reverse, nodeW)
            if (edgeStyle === 'accent') {
              return (
                <path
                  key={i}
                  d={curve(p)}
                  fill='none'
                  stroke={a.color}
                  strokeWidth={2}
                  strokeLinecap='round'
                  style={{ filter: `drop-shadow(0 0 2.5px ${a.color})` }}
                />
              )
            }
            const reached = a.status === 'done' && !!b.status && b.status !== 'idle'
            return (
              <path
                key={i}
                d={orthogonal(p)}
                fill='none'
                stroke={reached ? `url(#${gradId}-${i})` : EDGE_IDLE}
                strokeWidth={reached ? 3 : 1.5}
                strokeLinecap='round'
                strokeLinejoin='round'
                opacity={b.waiting ? 0.7 : 1}
                style={reached ? { filter: 'drop-shadow(0 0 4px #5a99eb)' } : undefined}
              />
            )
          })}
        </svg>
        {nodes.map(n => <GraphNode key={n.id} n={n} vertical={vertical} w={nodeW} />)}
      </motion.div>
      {zoom && <Zoom scale={fit.s} />}
    </div>
  )
}
