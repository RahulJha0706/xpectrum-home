'use client'
import { useEffect, useRef, useState } from 'react'
import { Button } from './button'
import { AnimatePresence, motion } from 'framer-motion'

// On phones the hero CTA scrolls away within a second. Once it has, a slim
// bar keeps the next step one thumb-tap away — and it steps aside again when
// the closing call to action is on screen, so there are never two at once.
const MobileCta = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const scroller = ref.current?.closest('.xp-landing')
    if (!scroller)
      return
    const onScroll = () => {
      const closing = document.getElementById('get-started')
      const closingVisible = closing ? closing.getBoundingClientRect().top < window.innerHeight : false
      // Also step aside while the walkthrough fills the screen: its caption
      // strip sits at the bottom, exactly where this bar would cover it.
      const walk = document.getElementById('how-it-works')?.getBoundingClientRect()
      const walkthroughInView = walk ? walk.top < window.innerHeight * 0.5 && walk.bottom > window.innerHeight * 0.5 : false
      setShow(scroller.scrollTop > window.innerHeight * 0.9 && !closingVisible && !walkthroughInView)
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={ref} className='lg:hidden'>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className='fixed inset-x-3 z-40 pb-[env(safe-area-inset-bottom)]'
            style={{ bottom: 12 }}
          >
            <div className='flex items-center gap-3 rounded-2xl border border-white/15 bg-[rgba(22,18,54,0.97)] p-2 pl-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]'>
              <div className='min-w-0 flex-1'>
                <div className='truncate text-[14px] font-semibold text-white'>Never miss a call again</div>
                <div className='truncate text-[12px] text-[var(--xl-txt4)]'>Build your agent in minutes</div>
              </div>
              <Button href='/auth/signup' size='sm' className='shrink-0'>Start</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileCta
