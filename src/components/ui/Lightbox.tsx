import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Full-screen image lightbox with:
 *   - Touch swipe (drag horizontally past 80px triggers next/prev)
 *   - Keyboard arrows + Escape
 *   - Click outside image to close
 *   - Counter chip
 *   - Page-scroll lock while open
 *
 * Per DESIGN.md: no decorative animations, motion stays under
 * 320ms, escape closes, focus ring on close button.
 */

interface LightboxProps {
  images: string[]
  startIndex?: number
  open: boolean
  onClose: () => void
}

export function Lightbox({ images, startIndex = 0, open, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex)
  const [direction, setDirection] = useState(0)

  // Sync index when opened
  useEffect(() => {
    if (open) setIdx(startIndex)
  }, [open, startIndex])

  // Keyboard nav + escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft')  prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, idx, images.length])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [open])

  // Preload neighbors for snappy nav
  useEffect(() => {
    if (!open || images.length < 2) return
    const preload = (src: string) => { const i = new Image(); i.src = src }
    preload(images[(idx + 1) % images.length])
    preload(images[(idx - 1 + images.length) % images.length])
  }, [idx, images, open])

  function next() {
    if (images.length < 2) return
    setDirection(1)
    setIdx(i => (i + 1) % images.length)
  }
  function prev() {
    if (images.length < 2) return
    setDirection(-1)
    setIdx(i => (i - 1 + images.length) % images.length)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.96)' }}
          onClick={onClose}
        >
          {/* Image — swipeable */}
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.img
              key={idx}
              src={images[idx]}
              alt=""
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[94vw] max-h-[92vh] object-contain select-none"
              draggable={false}
              onClick={e => e.stopPropagation()}
              // Touch swipe
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) next()
                else if (info.offset.x > 80) prev()
              }}
            />
          </AnimatePresence>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-fg-primary bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] transition-[background] duration-base ease-standard active:scale-95"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Prev / Next — desktop only */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="上一张"
                className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center text-fg-primary bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] transition-[background] duration-base ease-standard active:scale-95"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="下一张"
                className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center text-fg-primary bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] transition-[background] duration-base ease-standard active:scale-95"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-caption font-medium tabular bg-white/[0.08] text-fg-primary border border-white/[0.12]">
              {idx + 1} / {images.length}
            </div>
          )}

          {/* Mobile hint */}
          {images.length > 1 && (
            <div className="md:hidden absolute top-5 left-5 px-3 py-1 rounded-md text-[10px] uppercase tracking-wider bg-white/[0.06] text-fg-secondary border border-white/[0.08]">
              左右滑动
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
