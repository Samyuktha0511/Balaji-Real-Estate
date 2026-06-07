import React from 'react'
import { Link } from 'react-router-dom'

export default function ListingCard({ listing }) {
  // Get first photo if available
  const firstPhoto = listing.photos && listing.photos.length > 0 
    ? `/api/listings/media/${listing.photos[0]}`
    : 'https://via.placeholder.com/300x200?text=No+Photo'

  return (
    <article className="card">
      <div className="card-image">
        <img src={firstPhoto} alt={listing.title} />
      </div>
      
      <div className="card-content">
        <h2>{listing.title}</h2>
        <p className="addr">{listing.address}</p>
        <p className="price">₹{listing.price ? listing.price.toLocaleString('en-IN') : 'N/A'}</p>
        <p className="area">{listing.area} sq.ft</p>
        <p className="desc">{listing.description}</p>

        <div className="card-actions">
          <Link to={`/listing/${listing.id}`} className="btn btn-primary">View Details</Link>
          
          <div className="contacts">
            {listing.phone && <a className="btn btn-contact" href={`tel:${listing.phone}`} title="Call">☎</a>}
            {listing.phone && <a className="btn btn-contact" href={`https://wa.me/${listing.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" title="WhatsApp">💬</a>}
            {listing.email && <a className="btn btn-contact" href={`mailto:${listing.email}`} title="Email">✉</a>}
          </div>
        </div>
      </div>
    </article>
  )
}
