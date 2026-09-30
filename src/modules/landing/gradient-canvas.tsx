'use client'
import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

// "Voice aurora": soft ribbons of light in the brand palette, drawn with a
// small WebGL shader. Unlike a noise field it is made of smooth sine waves —
// no grid artefacts at any resolution — and it listens to the hero's demo
// call: while someone speaks the ribbons swell and ripple, cyan when the
// agent talks, violet when the caller does. The backdrop is part of the demo.
//
// Cost control: renders at half resolution (capped), at 30fps, stops while
// off screen or in a hidden tab, and draws one still frame under
// prefers-reduced-motion. It fades in over a static CSS version of itself
// (.xl-aurora-fallback), so the first paint already looks finished.

export type VoiceSignal = { speaking: 'caller' | 'agent' | null }

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uVoice;   // 0 = silence, 1 = someone speaking (smoothed)
uniform float uTone;    // 0 = agent (cyan), 1 = caller (violet) (smoothed)
uniform vec2 uPointer;

// One ribbon: a gaussian band around a slowly undulating centre line. While
// someone speaks, a faster, finer ripple rides on top — the "voice".
float ribbon(vec2 uv, float base, float amp, float freq, float speed, float phase, float width) {
  float t = uTime;
  // The field is skewed 12deg (see .xl-hero-field), which lifts its right
  // side toward the nav by tan(12deg) = 0.2126 px per px. Cancel that exactly
  // (scaled by the canvas aspect, so it holds at every screen size) and add a
  // gentle on-screen descent, so the ribbons flow down under the mock-ups
  // and never up behind the nav.
  float y = base - (0.2126 + 0.10) * uv.x * uRes.x / uRes.y
    + amp * sin(uv.x * freq + t * speed + phase)
    + amp * 0.45 * sin(uv.x * freq * 2.1 - t * speed * 1.4 + phase * 1.7)
    + uVoice * 0.028 * sin(uv.x * 26.0 - t * 7.0 + phase) * smoothstep(0.25, 0.9, uv.x);
  float d = (uv.y - y) / (width * (1.0 + 0.35 * uVoice));
  return exp(-d * d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 pp = (uPointer - 0.5) * 0.04;

  vec3 ground = vec3(0.024, 0.016, 0.098);  // #060419
  vec3 signal = vec3(0.098, 0.400, 0.792);  // #1966ca
  vec3 sky    = vec3(0.353, 0.600, 0.922);  // #5a99eb
  vec3 cyan   = vec3(0.133, 0.827, 0.933);  // #22d3ee
  vec3 violet = vec3(0.486, 0.361, 1.000);  // #7c5cff
  vec3 pink   = vec3(0.824, 0.361, 1.000);  // #d25cff

  float wide = ribbon(uv + pp, 0.62, 0.10, 1.7, 0.16, 1.0, 0.20);
  float mid  = ribbon(uv + pp, 0.56, 0.09, 2.4, 0.22, 2.2, 0.085);
  float main = ribbon(uv + pp * 1.5, 0.53, 0.07, 3.1, 0.30, 0.0, 0.045);
  float thin = ribbon(uv + pp * 2.0, 0.46, 0.06, 3.8, 0.40, 4.0, 0.022);

  vec3 voiceCol = mix(cyan, violet, uTone);
  vec3 col = ground;
  col += wide * mix(signal, violet, uv.x) * 0.38;
  col += mid  * mix(violet, sky, uv.x) * 0.55;
  col += main * mix(mix(signal, cyan, uv.x), voiceCol, uVoice * 0.8) * (0.85 + 0.35 * uVoice);
  col += thin * mix(pink, cyan, uv.x) * 0.5;
  // A bright core along the main ribbon, like light through glass.
  col += pow(main, 10.0) * vec3(0.85, 0.96, 1.0) * (0.25 + 0.35 * uVoice);

  // Keep the left (where the headline sits) and the top edge calm.
  col = mix(ground, col, smoothstep(0.02, 0.55, uv.x) * 0.85 + 0.15);
  col = mix(ground, col, smoothstep(1.0, 0.72, uv.y));

  gl_FragColor = vec4(col, 1.0);
}
`

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const s = gl.createShader(type)
  if (!s)
    return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s)
    return null
  }
  return s
}

const GradientCanvas = ({ className, voice }: { className?: string; voice?: MutableRefObject<VoiceSignal> }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas)
      return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl)
      return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog)
      return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uVoice = gl.getUniformLocation(prog, 'uVoice')
    const uTone = gl.getUniformLocation(prog, 'uTone')
    const uPointer = gl.getUniformLocation(prog, 'uPointer')

    // Smooth gradients upscale cleanly, so half resolution (capped) is free.
    const SCALE = 0.35
    const MAX_W = 640
    const resize = () => {
      const s = Math.min(SCALE, MAX_W / Math.max(1, canvas.clientWidth))
      const w = Math.max(1, Math.floor(canvas.clientWidth * s))
      const h = Math.max(1, Math.floor(canvas.clientHeight * s))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
    }

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth
      pointer.ty = 1 - e.clientY / window.innerHeight
    }
    const level = { voice: 0, tone: 0 }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = true
    let raf = 0
    let first = true
    const start = performance.now()
    const OFFSET = 12

    const draw = () => {
      resize()
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
      const speaking = voice?.current.speaking ?? null
      level.voice += ((speaking ? 1 : 0) - level.voice) * 0.08
      if (speaking)
        level.tone += ((speaking === 'caller' ? 1 : 0) - level.tone) * 0.1
      gl.uniform1f(uTime, OFFSET + (performance.now() - start) / 1000)
      gl.uniform1f(uVoice, level.voice)
      gl.uniform1f(uTone, level.tone)
      gl.uniform2f(uPointer, pointer.x, pointer.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (first) {
        first = false
        setReady(true)
      }
    }

    // The ribbons move slowly; 30fps is indistinguishable and halves the cost.
    const FRAME_MS = 1000 / 30
    let lastDraw = 0
    const loop = (now: number) => {
      if (now - lastDraw >= FRAME_MS) {
        lastDraw = now
        draw()
      }
      if (visible && !document.hidden)
        raf = requestAnimationFrame(loop)
    }
    const resume = () => {
      cancelAnimationFrame(raf)
      if (!reduce && visible && !document.hidden)
        raf = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      resume()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', resume)
    window.addEventListener('pointermove', onPointer, { passive: true })

    if (reduce)
      draw()
    else
      resume()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', resume)
      window.removeEventListener('pointermove', onPointer)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [voice])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
    />
  )
}

export default GradientCanvas
