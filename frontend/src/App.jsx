import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function App(){
  const [listings, setListings] = useState([])

  useEffect(()=>{
    axios.get('/api/listings')
      .then(res => setListings(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="container">
      <header>
        <h1>Balaji Real Estate</h1>
        <p>Plot resale listings</p>
      </header>

      <main>
        <div className="listings">
          {listings.map(l => (
            <article key={l.id} className="card">
              <h2>{l.title}</h2>
              <p className="addr">{l.address}</p>
              <p className="price">₹{l.price}</p>
              <p className="area">{l.area}</p>
              <p className="desc">{l.description}</p>

              <div className="contacts">
                {l.phone && <a className="btn" href={`tel:${l.phone}`}>Call</a>}
                {l.phone && <a className="btn" href={`https://wa.me/${l.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">WhatsApp</a>}
                {l.email && <a className="btn" href={`mailto:${l.email}`}>Email</a>}
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer>
        <p>&copy; Balaji Real Estate</p>
      </footer>
    </div>
  )
}
