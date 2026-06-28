import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PhotoGallery from './PhotoGallery'
import { Pin, Phone, Whatsapp, Mail, Doc, ArrowLeft } from './Icons'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    axios.get(`/api/listings/${id}`)
      .then(res => {
        setListing(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load listing details')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <div className="container"><p className="state" style={{ marginTop: 60 }}>Loading…</p></div>
  }

  if (error || !listing) {
    return (
      <div className="container">
        <div className="state" style={{ marginTop: 60 }}>
          <span className="emoji">🌿</span>
          <p>{error || 'Listing not found'}</p>
          <Link to="/" className="lcard-view" style={{ marginTop: 16, display: 'inline-flex' }}>
            <ArrowLeft s={15} /> Back to listings
          </Link>
        </div>
      </div>
    )
  }

  const status = (listing.status || 'available').toLowerCase()
  const phoneDigits = listing.phone ? listing.phone.replace(/\D/g, '') : ''
  const mapUrl = listing.latitude && listing.longitude
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.0975046289925!2d${listing.longitude}!3d${listing.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${listing.latitude}%2C${listing.longitude}!5e0!3m2!1sen!2sin!4v`
    : null

  return (
    <div className="detail-wrap">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/')}><ArrowLeft s={15} /> Back to listings</button>

        <div className="detail-grid">
          <div className="detail-media">
            <div className="detail-status">
              <span className={`pill ${status}`}>{status.toUpperCase()}</span>
            </div>
            <PhotoGallery photos={listing.photos} title={listing.title} />
          </div>

          <div className="detail-info">
            <h1>{listing.title}</h1>
            <p className="detail-addr"><Pin s={17} />{listing.address}</p>

            <div className="detail-facts">
              <div className="fact-box">
                <span className="label">Price</span>
                <div className="val">₹{listing.price ? Number(listing.price).toLocaleString('en-IN') : 'N/A'}</div>
              </div>
              <div className="fact-box">
                <span className="label">Area</span>
                <div className="val">{listing.area || 'N/A'}{listing.area ? ' sq.ft' : ''}</div>
              </div>
            </div>

            {listing.description && (
              <div className="detail-block">
                <h3>Description</h3>
                <p>{listing.description}</p>
              </div>
            )}

            <div className="detail-block">
              <h3>Contact</h3>
              <div className="contact-rows">
                {listing.phone && (
                  <div className="contact-row">
                    <span>Phone</span>
                    <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                  </div>
                )}
                {listing.email && (
                  <div className="contact-row">
                    <span>Email</span>
                    <a href={`mailto:${listing.email}`}>{listing.email}</a>
                  </div>
                )}
              </div>

              <div className="contact-actions">
                {phoneDigits && (
                  <>
                    <a className="cbtn call" href={`tel:${listing.phone}`}><Phone s={17} /> Call now</a>
                    <a className="cbtn whatsapp" href={`https://wa.me/${phoneDigits}?text=Hi, I'm interested in ${encodeURIComponent(listing.title)}`} target="_blank" rel="noreferrer"><Whatsapp s={17} /> WhatsApp</a>
                  </>
                )}
                {listing.email && (
                  <a className="cbtn email" href={`mailto:${listing.email}?subject=Interested in ${encodeURIComponent(listing.title)}`}><Mail s={17} /> Email</a>
                )}
              </div>
            </div>
          </div>
        </div>

        {mapUrl && (
          <div className="detail-section detail-map">
            <h2>Location</h2>
            <p className="coords">Lat: {listing.latitude}, Lng: {listing.longitude}</p>
            <iframe
              width="100%"
              height="400"
              loading="lazy"
              allowFullScreen
              src={mapUrl}
              title="Location Map"
            ></iframe>
          </div>
        )}

        {listing.documents && listing.documents.length > 0 && (
          <div className="detail-section">
            <h2>Documents</h2>
            <ul className="docs-list">
              {listing.documents.map((doc, idx) => (
                <li key={idx}>
                  <a href={`/api/listings/media/${doc}`} download target="_blank" rel="noreferrer">
                    <Doc s={18} /> {doc}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
