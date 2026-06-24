import React from 'react'
import { Link } from 'react-router-dom'
import { Pin, Phone, Whatsapp, Mail, ArrowRight } from './Icons'

export default function ListingCard({ listing }) {
  const firstPhoto = listing.photos && listing.photos.length > 0
    ? `/api/listings/media/${listing.photos[0]}`
    : null

  const status = (listing.status || 'available').toLowerCase()
  const phoneDigits = listing.phone ? listing.phone.replace(/\D/g, '') : ''

  return (
    <article className="lcard">
      <div className="lcard-media">
        {firstPhoto ? (
          <img src={firstPhoto} alt={listing.title} loading="lazy" />
        ) : (
          <div className="no-photos"><span className="no-photos-emoji">🏞️</span></div>
        )}
        <span className={`lcard-badge ${status}`}>{status.toUpperCase()}</span>
        {listing.area && <span className="lcard-area">{listing.area} sq.ft</span>}
      </div>

      <div className="lcard-body">
        <h3>{listing.title}</h3>
        <p className="lcard-addr"><Pin s={15} />{listing.address}</p>
        <p className="lcard-price">
          ₹{listing.price ? Number(listing.price).toLocaleString('en-IN') : 'N/A'}
        </p>
        {listing.description && <p className="lcard-desc">{listing.description}</p>}

        <div className="lcard-foot">
          <Link to={`/listing/${listing.id}`} className="lcard-view">
            View details <ArrowRight s={15} />
          </Link>
          <div className="lcard-contacts">
            {phoneDigits && (
              <a className="icon-btn" href={`tel:${listing.phone}`} title="Call" aria-label="Call"><Phone s={17} /></a>
            )}
            {phoneDigits && (
              <a className="icon-btn" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" title="WhatsApp" aria-label="WhatsApp"><Whatsapp s={17} /></a>
            )}
            {listing.email && (
              <a className="icon-btn" href={`mailto:${listing.email}`} title="Email" aria-label="Email"><Mail s={17} /></a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
