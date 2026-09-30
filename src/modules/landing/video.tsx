'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RiPlayFill } from '@remixicon/react'
import cn from '@/lib/classnames'
import { Reveal, SectionHeading } from './ui'

// Product videos, first one featured. Add more here and the showcase grows a
// playlist rail automatically.
export const VIDEOS = [
  {
    id: 'fhEUtJx_W6Q',
    title: 'Getting Started with Xpectrum AI',
    blurb: 'A guided tour of the workspace: build your first agent, ground it in your knowledge and put it live.',
  },
]

const poster = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`

// youtube-nocookie and nothing loaded until play is pressed: the page stays
// fast and no YouTube cookies are set for visitors who never watch.
const embedSrc = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`

const PlayButton = ({ size = 'lg' }: { size?: 'lg' | 'sm' }) => (
  <span className={cn('relative flex items-center justify-center', size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-12 w-12')}>
    <span className='xl-pulse-ring absolute inset-0 rounded-full bg-white/30' />
    <span className='xl-pulse-ring bg-[var(--xl-cyan)]/30 absolute inset-0 rounded-full [animation-delay:1.2s]' />
    <span className='relative flex h-full w-full items-center justify-center rounded-full bg-white/95 text-[#0a0826] shadow-[0_10px_40px_rgba(34,211,238,0.5)] transition-transform duration-300 group-hover:scale-110'>
      <RiPlayFill className={cn('translate-x-[2px]', size === 'lg' ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-5 w-5')} />
    </span>
  </span>
)

/** 16:9 player: poster and play button until clicked, then the video. */
const VideoPlayer = ({ video }: { video: typeof VIDEOS[number] }) => {
  const [playing, setPlaying] = useState(false)
  useEffect(() => setPlaying(false), [video.id])

  return (
    <div className='relative aspect-video w-full overflow-hidden bg-black'>
      {playing
        ? (
          <iframe
            src={embedSrc(video.id)}
            title={video.title}
            className='absolute inset-0 h-full w-full'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            referrerPolicy='strict-origin-when-cross-origin'
            allowFullScreen
          />
        )
        : (
          <button
            type='button'
            onClick={() => setPlaying(true)}
            className='group absolute inset-0 h-full w-full'
            aria-label={`Play video: ${video.title}`}
          >
            <img src={poster(video.id)} alt='' className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]' />
            <span className='absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,38,0.15)_0%,rgba(10,8,38,0.35)_55%,rgba(10,8,38,0.9)_100%)]' />
            <span className='absolute inset-0 flex items-center justify-center'>
              <PlayButton />
            </span>
            <span className='absolute inset-x-0 bottom-0 p-4 text-left sm:p-7'>
              <span className='block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--xl-cyan)]'>Watch</span>
              <span className='xl-display mt-1 block text-lg font-semibold text-white sm:text-2xl'>{video.title}</span>
            </span>
          </button>
        )}
    </div>
  )
}

/** The showcase section: a cinematic framed player that tilts up into place. */
const VideoShowcase = () => {
  const [current, setCurrent] = useState(0)
  const video = VIDEOS[current]

  return (
    <section id='watch' className='relative py-16 lg:py-20'>
      <div className='pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[60%] max-w-[1100px] rounded-full bg-[radial-gradient(closest-side,rgba(90,153,235,0.28),rgba(124,92,255,0.14)_60%,transparent)] blur-2xl' aria-hidden />
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6'>
        <SectionHeading
          className='mx-auto text-center'
          eyebrow='See it in action'
          title='Watch an agent come to life'
          body='From an empty workspace to an agent that answers for you. See how it all fits together.'
        />

        <motion.div
          initial={{ opacity: 0, rotateX: 22, scale: 0.9, y: 60 }}
          whileInView={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformPerspective: 1400 }}
          className='relative mx-auto mt-12 max-w-[1040px]'
        >
          {/* Rotating conic border — the frame's light source. */}
          <div className='xl-video-frame rounded-[22px] p-[1.5px] sm:rounded-[26px]'>
            <div className='overflow-hidden rounded-[20px] bg-[#0b0922] sm:rounded-[24px]'>
              <div className='flex items-center gap-2 border-b border-white/10 px-4 py-2.5'>
                <span className='h-2.5 w-2.5 rounded-full bg-[#ff5f57]' />
                <span className='h-2.5 w-2.5 rounded-full bg-[#febc2e]' />
                <span className='h-2.5 w-2.5 rounded-full bg-[#28c840]' />
                <span className='mx-auto hidden max-w-[60%] truncate rounded-md bg-white/5 px-10 py-1 text-[11px] text-[var(--xl-txt4)] sm:block'>
                  xpectrum.ai · {video.title}
                </span>
              </div>
              <VideoPlayer key={video.id} video={video} />
            </div>
          </div>
        </motion.div>

        <Reveal className='mx-auto mt-6 max-w-[1040px]'>
          <p className='text-center text-[15px] text-[var(--xl-txt3)]'>{video.blurb}</p>
          {VIDEOS.length > 1 && (
            <div className='mt-6 flex gap-3 overflow-x-auto pb-2'>
              {VIDEOS.map((v, i) => (
                <button
                  key={v.id}
                  type='button'
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'group flex w-[240px] shrink-0 items-center gap-3 rounded-xl border p-2 text-left transition-colors',
                    i === current ? 'border-[var(--xl-cyan)] bg-white/[0.06]' : 'border-[var(--xl-border-subtle)] hover:bg-white/[0.04]',
                  )}
                >
                  <span className='relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg'>
                    <img src={poster(v.id)} alt='' className='h-full w-full object-cover' />
                    <span className='absolute inset-0 flex items-center justify-center bg-black/30'>
                      <RiPlayFill className='h-5 w-5 text-white' />
                    </span>
                  </span>
                  <span className='line-clamp-2 text-[13px] font-medium text-white'>{v.title}</span>
                </button>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export default VideoShowcase
