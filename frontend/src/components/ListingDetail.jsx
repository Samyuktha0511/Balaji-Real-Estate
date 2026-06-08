import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PhotoGallery from './PhotoGallery'

function PinIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function WhatsappIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24zm-3.06 4.4c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41-.14-.01-.3-.01-.46-.01z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 19-7-7 7-7M19 12H5" />
    </svg>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`/api/listings/${id}`)
      .then(res => {
        setListing(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load listing details')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <div className="container"><p className="detail-state">Loading...</p></div>
  }

  if (error || !listing) {
    return (
      <div className="container">
        <p className="detail-state">
          {error || 'Listing not found'}<br />
          <Link to="/">← Back to listings</Link>
        </p>
      </div>
    )
  }

  const mapUrl = listing.latitude && listing.longitude
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.0975046289925!2d${listing.longitude}!3d${listing.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${listing.latitude}%2C${listing.longitude}!5e0!3m2!1sen!2sin!4v`
    : null

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate('/')}><BackIcon /> Back to listings</button>

      <div className="detail-wrapper">
        {/* Left: Photo Gallery */}
        <div className="detail-photos">
          <PhotoGallery photos={listing.photos} title={listing.title} />
        </div>

        {/* Right: Details */}
        <div className="detail-info">
          <h1>{listing.title}</h1>
          <p className="address"><PinIcon />{listing.address}</p>

          <div className="price-area">
            <div className="price-box">
              <span className="label">Price</span>
              <p className="price">₹{listing.price ? listing.price.toLocaleString('en-IN') : 'N/A'}</p>
            </div>
            <div className="area-box">
              <span className="label">Area</span>
              <p className="area">{listing.area} sq.ft</p>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h3>Contact</h3>
            <div className="contact-details">
              {listing.phone && (
                <div className="contact-item">
                  <span>Phone</span>
                  <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                </div>
              )}
              {listing.email && (
                <div className="contact-item">
                  <span>Email</span>
                  <a href={`mailto:${listing.email}`}>{listing.email}</a>
                </div>
              )}
            </div>

            <div className="contact-buttons">
              {listing.phone && (
                <>
                  <a className="btn btn-call" href={`tel:${listing.phone}`}><PhoneIcon /> Call Now</a>
                  <a className="btn btn-whatsapp" href={`https://wa.me/${listing.phone.replace(/\D/g,'')}?text=Hi, I'm interested in ${listing.title}`} target="_blank" rel="noreferrer"><WhatsappIcon /> WhatsApp</a>
                </>
              )}
              {listing.email && <a className="btn btn-email" href={`mailto:${listing.email}?subject=Interested in ${listing.title}`}><MailIcon /> Email</a>}
            </div>
          </div>

          {/* Status */}
          <div className="status-badge">
            <span className={`badge ${listing.status === 'available' ? 'available' : 'sold'}`}>
              {listing.status ? listing.status.toUpperCase() : 'AVAILABLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Location Map */}
      {mapUrl && (
        <div className="location-section">
          <h2>Location</h2>
          <p className="coordinates">Lat: {listing.latitude}, Lng: {listing.longitude}</p>
          <iframe
            width="100%"
            height="400"
            style={{ border: '0', borderRadius: '8px' }}
            loading="lazy"
            allowFullScreen=""
            src={mapUrl}
            title="Location Map"
          ></iframe>
        </div>
      )}

      {/* Documents */}
      {listing.documents && listing.documents.length > 0 && (
        <div className="documents-section">
          <h2>Documents</h2>
          <ul className="documents-list">
            {listing.documents.map((doc, idx) => (
              <li key={idx}>
                <a href={`/api/listings/media/${doc}`} download target="_blank" rel="noreferrer">
                  <DocIcon /> {doc}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
