import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

/* ── Small inline SVGs ─────────────────────────────────────────────────── */
function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/* ── Lightbox Portal ────────────────────────────────────────────────────── */
function Lightbox({ photos, title, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const total = photos.length

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  // Keyboard inside lightbox
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Touch swipe inside lightbox
  const touchX = useRef(null)
  const handleTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const handleTouchEnd   = (e) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchX.current = null
  }

  return createPortal(
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo lightbox: ${title}`}
    >
      {/* Close */}
      <button className="lightbox-close" onClick={onClose} aria-label="Close lightbox">
        <CloseIcon />
      </button>

      {/* Counter */}
      <div className="lightbox-counter">{idx + 1} / {total}</div>

      {/* Image */}
      <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
        <img
          src={`/api/listings/media/${photos[idx]}`}
          alt={`${title} – photo ${idx + 1} of ${total}`}
          className="lightbox-img"
          draggable={false}
        />
      </div>

      {/* Prev / Next */}
      {total > 1 && (
        <>
          <button className="lightbox-nav lb-prev" onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous photo">
            <ChevronLeft />
          </button>
          <button className="lightbox-nav lb-next" onClick={e => { e.stopPropagation(); next() }} aria-label="Next photo">
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dot strip */}
      {total > 1 && (
        <div className="lightbox-dots" onClick={e => e.stopPropagation()}>
          {photos.map((_, i) => (
            <button
              key={i}
              className={`lightbox-dot ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}

/* ── Main Gallery Component ─────────────────────────────────────────────── */
const AUTOPLAY_MS = 5000

export default function PhotoGallery({ photos, title }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(null)
  const touchEndX   = useRef(null)

  const total = photos?.length ?? 0

  const goTo = useCallback((i) => {
    setActiveIndex((i + total) % total)
  }, [total])

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])

  // Autoplay — advances slides, paused on hover / touch / lightbox / reduced-motion
  useEffect(() => {
    if (lightboxOpen || isPaused || total <= 1) return
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const timer = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [lightboxOpen, isPaused, total, next])

  // Keyboard navigation (only when lightbox is closed)
  useEffect(() => {
    if (lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, lightboxOpen])

  // Touch / swipe handlers
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current   = null
    setIsDragging(false)
    setIsPaused(true)
  }
  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
    if (Math.abs(touchStartX.current - e.touches[0].clientX) > 10) setIsDragging(true)
  }
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) { setIsPaused(false); return }
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStartX.current = null
    touchEndX.current   = null
    setIsPaused(false)
  }

  // Empty state
  if (!photos || total === 0) {
    return (
      <div className="photo-gallery">
        <div className="no-photos">
          <span className="no-photos-emoji">🏞️</span>
          <p>No photos available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="photo-gallery">

        {/* ── Slide track ─────────────────────────────────────── */}
        <div
          className="gallery-track-wrapper"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="gallery-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {photos.map((photo, i) => (
              <div className="gallery-slide" key={i}>
                <img
                  src={`/api/listings/media/${photo}`}
                  alt={`${title} – photo ${i + 1}`}
                  draggable={false}
                  onClick={() => { if (!isDragging) setLightboxOpen(true) }}
                  style={{ cursor: 'zoom-in' }}
                />
              </div>
            ))}
          </div>

          {/* Autoplay progress bar */}
          {total > 1 && !lightboxOpen && (
            <div className="gallery-progress" aria-hidden="true">
              <div
                key={activeIndex}
                className="gallery-progress-bar"
                style={{
                  animationDuration: `${AUTOPLAY_MS}ms`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
              />
            </div>
          )}

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button className="gallery-nav prev" onClick={prev} aria-label="Previous photo">
                <ChevronLeft />
              </button>
              <button className="gallery-nav next" onClick={next} aria-label="Next photo">
                <ChevronRight />
              </button>
            </>
          )}

          {/* Counter badge (top-right) */}
          <div className="gallery-counter" aria-live="polite">
            {activeIndex + 1} / {total}
          </div>

          {/* Expand hint (bottom-right) */}
          <button
            className="gallery-expand"
            onClick={() => setLightboxOpen(true)}
            aria-label="Open fullscreen"
          >
            <ExpandIcon />
          </button>
        </div>

        {/* ── Dot indicators ──────────────────────────────────── */}
        {total > 1 && (
          <div className="gallery-dots" role="tablist" aria-label="Photo navigation">
            {photos.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Photo ${i + 1}`}
                className={`gallery-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}

        {/* ── Thumbnail strip ──────────────────────────────────── */}
        {total > 1 && (
          <div className="photo-thumbnails" aria-label="Photo thumbnails">
            {photos.map((photo, i) => (
              <button
                key={i}
                className={`thumbnail-btn ${i === activeIndex ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-pressed={i === activeIndex}
              >
                <img
                  src={`/api/listings/media/${photo}`}
                  alt={`Thumbnail ${i + 1}`}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

      </div>

      {/* ── Fullscreen Lightbox ───────────────────────────────── */}
      {lightboxOpen && (
        <Lightbox
          photos={photos}
          title={title}
          startIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
