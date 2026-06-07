import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import ListingCard from './components/ListingCard'
import ListingDetail from './components/ListingDetail'

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
    <div className="container">
      <header>
        <h1>Balaji Real Estate</h1>
        <p>Premium plot resale listings in Coimbatore</p>
      </header>

      <main>
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

      <footer>
        <p>&copy; Balaji Real Estate | All rights reserved</p>
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
