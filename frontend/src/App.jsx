import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import ListingCard from './components/ListingCard'
import ListingDetail from './components/ListingDetail'
import logo from './assets/logo.png'
import fatherPhotoPlaceholder from './assets/father-photo-placeholder.svg'

function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/listings')
      .then(res => {
        setListings(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-row">
            <div className="brand">
              <span className="brand-mark"><img src={logo} alt="Balaji Real Estate logo" width="46" height="46" /></span>
              <span>
                <span className="brand-name">Balaji Real Estate</span>
                <span className="brand-sub" style={{ display: 'block' }}>Coimbatore</span>
              </span>
            </div>
            <a className="header-contact" href="tel:+91">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Get in touch</span>
            </a>
          </div>
        </div>

        <div className="hero">
          <span className="hero-eyebrow">Premium Plot Resale</span>
          <h1>Find your <em>perfect plot</em> in Coimbatore</h1>
          <p>Hand-picked, verified plot resale listings with real photos, end-to-end support and guidance.</p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{loading ? '—' : listings.length}</div>
              <div className="lbl">Active Listings</div>
            </div>
            <div className="hero-stat">
              <div className="num">Verified</div>
              <div className="lbl">Owner Details</div>
            </div>
            <div className="hero-stat">
              <div className="num">Coimbatore</div>
              <div className="lbl">Prime Locations</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <main>
          <div className="section-head">
            <h2>Available Plots</h2>
            {!loading && listings.length > 0 && (
              <span className="count">{listings.length} {listings.length === 1 ? 'listing' : 'listings'}</span>
            )}
          </div>

          {loading ? (
            <p className="loading">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="no-listings">No listings available at the moment.</p>
          ) : (
            <div className="listings-grid">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>

      <section className="about-owner" aria-labelledby="about-owner-title">
        <div className="about-owner-inner">
          <div className="about-owner-photo">
            <img src={fatherPhotoPlaceholder} alt="Business owner portrait placeholder" />
          </div>
          <div className="about-owner-content">
            <span className="about-owner-eyebrow">About us</span>
            <h2 id="about-owner-title">Trusted land guidance built over 23 years</h2>
            <p>
              Murugesan K is a seasoned land broker and land promoter with
              about 23 years of hands-on experience across Coimbatore's land market. His
              work is rooted in clear guidance, practical local knowledge and long-term
              relationships with buyers, sellers and land owners.
            </p>
            <p>
              From identifying promising plots to helping families understand location,
              access and value, he brings a steady, personal approach to every property
              conversation.
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark"><img src={logo} alt="Balaji Real Estate logo" width="46" height="46" /></span>
            <span className="brand-name">Balaji Real Estate</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Balaji Real Estate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
