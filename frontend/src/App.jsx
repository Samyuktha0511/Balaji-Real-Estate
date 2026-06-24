import React, { useEffect, useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import ListingCard from './components/ListingCard'
import ListingDetail from './components/ListingDetail'
import {
  Phone, Search, ArrowRight, ChevronUp, Check, Leaf,
  ShieldLeaf, Handshake, MapPinned, Mail, Pin, Whatsapp, Sprout, Tag,
} from './components/Icons'
import logo from './assets/logo.png'
import fatherPhotoPlaceholder from './assets/father-photo-placeholder.svg'

/* Reveal-on-scroll: adds .in when an element enters the viewport */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  })
}

/* ── Navbar ───────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <a className="brand" href="#top">
          <span className="brand-logo"><img src={logo} width={44} height={44} alt="Balaji Real Estate logo" /></span>
          <span className="brand-text">
            <span className="brand-name">Balaji Real Estate</span>
            <span className="brand-sub">Rooted in Coimbatore</span>
          </span>
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#why">Why us</a>
          <a className="nav-link" href="#plots">Plots</a>
          <a className="nav-link" href="#sell">Sell a plot</a>
          <a className="nav-link" href="#about">About</a>
          <a className="nav-cta" href="#about"><Phone s={15} /> Get in touch</a>
        </div>
      </div>
    </nav>
  )
}

/* ── Hero ─────────────────────────────────────────────────── */
function Hero({ count, loading }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x: py * -10, y: px * 14 })
  }
  const reset = () => setTilt({ x: 0, y: 0 })

  return (
    <header className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow"><span className="dot" /> Premium plot resale</span>
          <h1>Where families put down <em>roots</em>.</h1>
          <p className="lead">
            Hand-picked, verified plots across Coimbatore — chosen with the same
            care a tree gives its soil. Real photos, honest guidance and a steady
            hand from first visit to final paperwork.
          </p>
          <div className="hero-actions">
            <a className="btn-primary" href="#plots">Browse plots <ArrowRight /></a>
            <a className="btn-ghost" href="#about">Meet the broker</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">{loading ? '—' : count}</div>
              <div className="lbl">Active listings</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="num">23+</div>
              <div className="lbl">Years of trust</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="num">100%</div>
              <div className="lbl">Verified owners</div>
            </div>
          </div>
        </div>

        <div className="hero-art" onMouseMove={onMove} onMouseLeave={reset}>
          <div className="hero-glow" aria-hidden="true" />
          <span className="leaf-float lf1" aria-hidden="true"><Leaf s={24} /></span>
          <span className="leaf-float lf2" aria-hidden="true"><Leaf s={16} /></span>
          <span className="leaf-float lf3" aria-hidden="true"><Leaf s={19} /></span>

          <div
            className="hero-signboard"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <div className="board-face">
              <span className="board-tag">For sale · plots</span>
              <img className="board-logo" src={logo} alt="Balaji Real Estate logo" />
              <span className="board-name">Balaji Real Estate</span>
              <span className="board-sub">Rooted in Coimbatore</span>
            </div>
            <span className="board-bolt tl" /><span className="board-bolt tr" />
            <span className="board-bolt bl" /><span className="board-bolt br" />
            <div className="board-post" />
            <div className="board-ground" />
          </div>

          <div className="hero-chip c1" style={{ transform: `translate(${tilt.y * 0.6}px, ${tilt.x * -0.6}px)` }}>
            <span className="ico"><ShieldLeaf s={18} /></span>
            Verified land titles
          </div>
          <div className="hero-chip c2" style={{ transform: `translate(${tilt.y * -0.8}px, ${tilt.x * 0.8}px)` }}>
            <span className="ico"><MapPinned s={18} /></span>
            Prime Coimbatore zones
          </div>
        </div>
      </div>
    </header>
  )
}

/* ── Why us / description section ──────────────────────────── */
function WhyUs() {
  const items = [
    { icon: <ShieldLeaf />, title: 'Verified & clear', text: 'Every plot is vetted for clean titles and genuine ownership before it ever reaches this page.' },
    { icon: <Handshake />, title: 'Honest guidance', text: 'No pressure, no jargon — just practical advice on location, access and real long-term value.' },
    { icon: <MapPinned />, title: 'Local roots', text: 'Two decades of on-the-ground knowledge of Coimbatore’s neighbourhoods and growth corridors.' },
  ]
  return (
    <section className="section values values-bg" id="why">
      <div className="container">
        <div className="section-head reveal">
          <span className="section-eyebrow">Why Balaji Real Estate</span>
          <h2 className="section-title">Land deals that grow on trust, not pressure</h2>
          <p className="section-lead">
            The logo says it all — a tree held up by two open hands. We help families
            plant something lasting, with transparency at every step.
          </p>
        </div>
        <div className="value-grid">
          {items.map((it, i) => (
            <article className="value-card reveal" style={{ transitionDelay: `${i * 90}ms` }} key={it.title}>
              <div className="value-ico">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Listings with sort + filter ───────────────────────────── */
const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) },
  priceLow: { label: 'Price: low to high', fn: (a, b) => num(a.price) - num(b.price) },
  priceHigh: { label: 'Price: high to low', fn: (a, b) => num(b.price) - num(a.price) },
  areaHigh: { label: 'Area: large to small', fn: (a, b) => num(b.area) - num(a.area) },
}
function num(v) {
  if (v == null) return 0
  const n = parseFloat(String(v).replace(/[^\d.]/g, ''))
  return isNaN(n) ? 0 : n
}

function Listings({ listings, loading }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  const visible = useMemo(() => {
    let out = [...listings]
    if (filter !== 'all') out = out.filter(l => (l.status || 'available').toLowerCase() === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      out = out.filter(l =>
        [l.title, l.address, l.description].filter(Boolean).join(' ').toLowerCase().includes(q)
      )
    }
    out.sort(SORTS[sort].fn)
    return out
  }, [listings, query, filter, sort])

  const filters = [
    { key: 'all', label: 'All plots' },
    { key: 'available', label: 'Available' },
    { key: 'sold', label: 'Sold' },
  ]

  return (
    <section className="section listings-bg" id="plots">
      <div className="container">
        <div className="section-head reveal">
          <span className="section-eyebrow">The collection</span>
          <h2 className="section-title">Available plots</h2>
          <p className="section-lead">Filter by status, search a locality, and sort to find the plot that fits your plans.</p>
        </div>

        <div className="toolbar reveal">
          <div className="toolbar-left">
            <label className="search-field">
              <Search s={16} />
              <input
                type="text"
                placeholder="Search title, area or locality…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search plots"
              />
            </label>
            <div className="chip-group" role="group" aria-label="Filter by status">
              {filters.map(f => (
                <button
                  key={f.key}
                  className={`chip ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-right">
            <span className="sort-label">Sort</span>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort plots">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        {!loading && (
          <p className="result-count" style={{ marginBottom: 22 }}>
            Showing <strong>{visible.length}</strong> of {listings.length} {listings.length === 1 ? 'plot' : 'plots'}
          </p>
        )}

        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => <div className="skeleton" key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="state">
            <span className="emoji">🌱</span>
            <p>{listings.length === 0 ? 'No listings available just yet — check back soon.' : 'No plots match your filters. Try clearing the search.'}</p>
          </div>
        ) : (
          <div className="listings-grid">
            {visible.map((listing, i) => (
              <div className="reveal" style={{ transitionDelay: `${Math.min(i, 6) * 70}ms` }} key={listing.id}>
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── About owner ──────────────────────────────────────────── */
function About() {
  const points = ['Land broking', 'Plot promotion', 'Clean-title verification', 'On-site guidance']
  return (
    <section className="section about-bg" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-photo reveal">
            <div className="about-photo-frame">
              <img src={fatherPhotoPlaceholder} alt="Murugesan K, land broker and promoter" />
            </div>
            <div className="badge-years">
              <div className="n">23</div>
              <div className="t">Years</div>
            </div>
          </div>
          <div className="about-content reveal">
            <span className="section-eyebrow">About us</span>
            <h2>Trusted land guidance, built one family at a time</h2>
            <p>
              Murugesan K is a seasoned land broker and promoter with around 23 years of
              hands-on experience across Coimbatore’s land market. His work is rooted in
              clear guidance, practical local knowledge and long-term relationships with
              buyers, sellers and land owners.
            </p>
            <p>
              From identifying promising plots to helping families understand location,
              access and value, he brings a steady, personal approach to every conversation.
            </p>
            <div className="about-points">
              {points.map(p => (
                <span className="about-point" key={p}>
                  <span className="tick"><Check s={13} /></span>{p}
                </span>
              ))}
            </div>
            <div className="about-name">
              <div className="nm">Murugesan K</div>
              <div className="rl">Land Broker & Promoter · Coimbatore</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Sell your plot invitation ────────────────────────────── */
function SellPlot() {
  const steps = [
    { icon: <Phone s={20} />, title: 'Reach out', text: 'Call or message with a few basic details about your plot.' },
    { icon: <MapPinned s={20} />, title: 'Free assessment', text: 'Get an honest, local view of your plot’s value and demand.' },
    { icon: <Handshake s={20} />, title: 'Find the right buyer', text: 'We connect you with genuine, verified buyers — no pressure.' },
  ]
  return (
    <section className="section sell-bg" id="sell">
      <div className="container">
        <div className="sell-card reveal">
          <div className="sell-leaf" aria-hidden="true"><Leaf s={22} /></div>
          <div className="sell-leaf two" aria-hidden="true"><Leaf s={16} /></div>
          <div className="sell-inner">
            <div className="sell-copy">
              <span className="section-eyebrow">Have land to sell?</span>
              <h2 className="section-title">Sell your plot with someone you can trust</h2>
              <p className="section-lead">
                Looking to sell your plot in Coimbatore? Murugesan K will personally guide
                you — from a fair valuation to connecting you with serious, verified buyers.
                Honest advice, clear communication and over two decades of local know-how.
              </p>
              <div className="sell-actions">
                <a className="btn-primary" href="tel:+91"><Phone s={16} /> Call to list your plot</a>
                <a className="btn-ghost" href="https://wa.me/91" target="_blank" rel="noreferrer"><Whatsapp s={16} /> Message on WhatsApp</a>
              </div>
            </div>
            <div className="sell-steps">
              {steps.map((s, i) => (
                <div className="sell-step" key={s.title}>
                  <span className="sell-step-ico">{s.icon}</span>
                  <div>
                    <div className="sell-step-num">Step {i + 1}</div>
                    <h4>{s.title}</h4>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="brand" href="#top">
              <span className="brand-logo"><img src={logo} width={44} height={44} alt="Balaji Real Estate logo" /></span>
              <span className="brand-text">
                <span className="brand-name">Balaji Real Estate</span>
                <span className="brand-sub">Rooted in Coimbatore</span>
              </span>
            </a>
            <p className="footer-about">
              Helping families across Coimbatore find verified plots and put down
              roots with confidence — for over two decades.
            </p>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <a href="#why">Why us</a>
            <a href="#plots">Available plots</a>
            <a href="#about">About the broker</a>
          </div>
          <div className="footer-col">
            <h4>Get in touch</h4>
            <a href="tel:+91"><Phone s={15} /> Call us</a>
            <a href="mailto:"><Mail s={15} /> Email us</a>
            <p><Pin s={15} /> Coimbatore, Tamil Nadu</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Balaji Real Estate. All rights reserved.</span>
          <span>Grown with <span className="heart">♥</span> in Coimbatore</span>
        </div>
      </div>
    </footer>
  )
}

/* ── Back to top ──────────────────────────────────────────── */
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      className={`to-top ${show ? 'show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <ChevronUp />
    </button>
  )
}

/* ── Home ─────────────────────────────────────────────────── */
function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  useReveal()

  useEffect(() => {
    axios.get('/api/listings')
      .then(res => { setListings(Array.isArray(res.data) ? res.data : []); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  return (
    <div>
      <Navbar />
      <Hero count={listings.length} loading={loading} />
      <WhyUs />
      <Listings listings={listings} loading={loading} />
      <SellPlot />
      <About />
      <Footer />
      <BackToTop />
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
