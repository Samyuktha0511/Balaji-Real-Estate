import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PhotoGallery from './PhotoGallery'

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
    return <div className="container"><p>Loading...</p></div>
  }

  if (error || !listing) {
    return (
      <div className="container">
        <p>{error || 'Listing not found'}</p>
        <Link to="/">← Back to listings</Link>
      </div>
    )
  }

  const mapUrl = listing.latitude && listing.longitude
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.0975046289925!2d${listing.longitude}!3d${listing.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${listing.latitude}%2C${listing.longitude}!5e0!3m2!1sen!2sin!4v`
    : null

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="detail-wrapper">
        {/* Left: Photo Gallery */}
        <div className="detail-photos">
          <PhotoGallery photos={listing.photos} title={listing.title} />
        </div>

        {/* Right: Details */}
        <div className="detail-info">
          <h1>{listing.title}</h1>
          <p className="address">{listing.address}</p>

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
                  <span>Phone:</span>
                  <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                </div>
              )}
              {listing.email && (
                <div className="contact-item">
                  <span>Email:</span>
                  <a href={`mailto:${listing.email}`}>{listing.email}</a>
                </div>
              )}
            </div>

            <div className="contact-buttons">
              {listing.phone && (
                <>
                  <a className="btn btn-call" href={`tel:${listing.phone}`}>📞 Call Now</a>
                  <a className="btn btn-whatsapp" href={`https://wa.me/${listing.phone.replace(/\D/g,'')}?text=Hi, I'm interested in ${listing.title}`} target="_blank" rel="noreferrer">💬 WhatsApp</a>
                </>
              )}
              {listing.email && <a className="btn btn-email" href={`mailto:${listing.email}?subject=Interested in ${listing.title}`}>✉ Email</a>}
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
                  📄 {doc}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
