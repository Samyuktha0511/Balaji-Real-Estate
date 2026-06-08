import React, { useState } from 'react'

export default function PhotoGallery({ photos, title }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className="photo-gallery">
        <div className="no-photos">
          <p>No photos available</p>
        </div>
      </div>
    )
  }

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + photos.length) % photos.length)
  }

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % photos.length)
  }

  const currentPhoto = `/api/listings/media/${photos[activeIndex]}`

  return (
    <div className="photo-gallery">
      <div className="main-photo">
        <img src={currentPhoto} alt={`${title} - Photo ${activeIndex + 1}`} />
        
        {photos.length > 1 && (
          <>
            <button className="gallery-nav prev" onClick={handlePrev} aria-label="Previous photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="gallery-nav next" onClick={handleNext} aria-label="Next photo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="photo-thumbnails">
          {photos.map((photo, idx) => (
            <img
              key={idx}
              src={`/api/listings/media/${photo}`}
              alt={`Thumbnail ${idx + 1}`}
              className={`thumbnail ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      )}

      <p className="photo-counter">{activeIndex + 1} / {photos.length}</p>
    </div>
  )
}
