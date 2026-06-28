/**
 * Balaji Real Estate – Cloudflare Worker Entry Point
 *
 * Stack:
 *   - itty-router v5 (AutoRouter) for routing + CORS
 *   - Cloudflare D1 (SQLite) for data persistence
 *   - Cloudflare R2 for binary file storage (photos, documents)
 *
 * API surface (mirrors the original Spring Boot backend):
 *
 *   GET    /api/listings                  → list all listings
 *   GET    /api/listings/:id              → get single listing
 *   POST   /api/listings                  → create listing
 *   PUT    /api/listings/:id              → update listing fields
 *   DELETE /api/listings/:id              → delete listing + R2 objects
 *   POST   /api/listings/:id/photos       → upload photos (multipart)
 *   GET    /api/listings/media/:filename  → serve photo / document from R2
 */

import { AutoRouter, cors, error, IRequest } from 'itty-router';
import { Env } from './types';
import {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from './handlers/listings';
import { uploadPhotos, serveMedia } from './handlers/media';

// Set up CORS — preflight handler + corsify response finaliser
const { preflight, corsify } = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

// AutoRouter automatically:
//  - runs `before` hooks before route matching
//  - runs `finally` hooks on every response (including errors)
//  - returns a 404 for unmatched routes
const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
  before:  [preflight],
  finally: [corsify],
  catch:   (err) => error(500, (err as Error).message ?? 'Internal Server Error'),
});

// ── Routes ────────────────────────────────────────────────────────────────────
// IMPORTANT: /api/listings/media/:filename MUST be registered before
// /api/listings/:id, otherwise "media" gets captured as the :id parameter.

router
  // Media (no auth needed — publicly served files)
  .get('/api/listings/media/:filename', serveMedia)

  // Listings — public reads
  .get('/api/listings',     getAllListings)
  .get('/api/listings/:id', getListing)

  // Listings — writes (add auth middleware here when ready)
  .post(  '/api/listings',           createListing)
  .put(   '/api/listings/:id',       updateListing)
  .delete('/api/listings/:id',       deleteListing)

  // Photo upload (multipart)
  .post('/api/listings/:id/photos',  uploadPhotos);

// ── Export ────────────────────────────────────────────────────────────────────
export default {
  fetch: router.fetch,
} satisfies ExportedHandler<Env>;
