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
            <button className="gallery-nav prev" onClick={handlePrev}>❮</button>
            <button className="gallery-nav next" onClick={handleNext}>❯</button>
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
