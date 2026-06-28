import { IRequest } from 'itty-router';
import { Env, Listing, ListingInput, ListingRow } from '../types';
import { errorResponse } from '../cors';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fetch photos and documents for a single listing from D1 */
async function fetchRelated(
  db: D1Database,
  listingId: number
): Promise<{ photos: string[]; documents: string[] }> {
  const [photoResult, docResult] = await Promise.all([
    db.prepare('SELECT photo FROM listing_photos WHERE listing_id = ?').bind(listingId).all<{ photo: string }>(),
    db.prepare('SELECT doc   FROM listing_docs    WHERE listing_id = ?').bind(listingId).all<{ doc: string }>(),
  ]);

  return {
    photos:    photoResult.results.map((r) => r.photo),
    documents: docResult.results.map((r) => r.doc),
  };
}

/** Attach photos + documents to a listing row */
async function hydrateListing(db: D1Database, row: ListingRow): Promise<Listing> {
  const related = await fetchRelated(db, row.id);
  return { ...row, ...related };
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/** GET /api/listings — return all listings (newest first) with photos + docs */
export async function getAllListings(_req: IRequest, env: Env): Promise<Response> {
  const { results } = await env.DB
    .prepare('SELECT * FROM listing ORDER BY created_at DESC')
    .all<ListingRow>();

  const listings = await Promise.all(results.map((row) => hydrateListing(env.DB, row)));
  return Response.json(listings);
}

/** GET /api/listings/:id — return a single listing with photos + docs */
export async function getListing(req: IRequest, env: Env): Promise<Response> {
  const { id } = req.params;
  const row = await env.DB
    .prepare('SELECT * FROM listing WHERE id = ?')
    .bind(id)
    .first<ListingRow>();

  if (!row) return errorResponse('Listing not found', 404);

  const listing = await hydrateListing(env.DB, row);
  return Response.json(listing);
}

/** POST /api/listings — create a new listing, return 201 */
export async function createListing(req: IRequest, env: Env): Promise<Response> {
  let body: ListingInput;
  try {
    body = await req.json<ListingInput>();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO listing (title, address, price, area, description, phone, email, latitude, longitude, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      body.title       ?? null,
      body.address     ?? null,
      body.price  != null ? String(body.price) : null,
      body.area        ?? null,
      body.description ?? null,
      body.phone       ?? null,
      body.email       ?? null,
      body.latitude    ?? null,
      body.longitude   ?? null,
      body.status      ?? 'available',
    )
    .run();

  const newRow = await env.DB
    .prepare('SELECT * FROM listing WHERE id = ?')
    .bind(result.meta.last_row_id)
    .first<ListingRow>();

  if (!newRow) return errorResponse('Failed to retrieve created listing', 500);

  return Response.json({ ...newRow, photos: [], documents: [] }, { status: 201 });
}

/** PUT /api/listings/:id — update specified fields of an existing listing */
export async function updateListing(req: IRequest, env: Env): Promise<Response> {
  const { id } = req.params;

  const existing = await env.DB
    .prepare('SELECT id FROM listing WHERE id = ?')
    .bind(id)
    .first<{ id: number }>();
  if (!existing) return errorResponse('Listing not found', 404);

  let body: ListingInput;
  try {
    body = await req.json<ListingInput>();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Build SET clause dynamically — only update fields present in the request body
  const setClauses: string[] = [];
  const values: (string | number | null)[] = [];

  const fieldMap: [keyof ListingInput, string][] = [
    ['title',       'title'],
    ['address',     'address'],
    ['price',       'price'],
    ['area',        'area'],
    ['description', 'description'],
    ['phone',       'phone'],
    ['email',       'email'],
    ['latitude',    'latitude'],
    ['longitude',   'longitude'],
    ['status',      'status'],
  ];

  for (const [bodyKey, colName] of fieldMap) {
    if (bodyKey in body) {
      setClauses.push(`${colName} = ?`);
      const val = body[bodyKey];
      values.push(bodyKey === 'price' && val != null ? String(val) : (val as string | number | null) ?? null);
    }
  }

  if (setClauses.length === 0) {
    return errorResponse('No updatable fields provided', 400);
  }

  values.push(id); // WHERE id = ?

  await env.DB
    .prepare(`UPDATE listing SET ${setClauses.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const updated = await env.DB
    .prepare('SELECT * FROM listing WHERE id = ?')
    .bind(id)
    .first<ListingRow>();

  if (!updated) return errorResponse('Failed to retrieve updated listing', 500);

  const listing = await hydrateListing(env.DB, updated);
  return Response.json(listing);
}

/** DELETE /api/listings/:id — delete listing, its DB rows, and its R2 objects */
export async function deleteListing(req: IRequest, env: Env): Promise<Response> {
  const { id } = req.params;

  const existing = await env.DB
    .prepare('SELECT id FROM listing WHERE id = ?')
    .bind(id)
    .first<{ id: number }>();
  if (!existing) return errorResponse('Listing not found', 404);

  // Collect all R2 keys that need to be deleted
  const [photoRows, docRows] = await Promise.all([
    env.DB.prepare('SELECT photo FROM listing_photos WHERE listing_id = ?').bind(id).all<{ photo: string }>(),
    env.DB.prepare('SELECT doc   FROM listing_docs    WHERE listing_id = ?').bind(id).all<{ doc: string }>(),
  ]);

  const r2Keys = [
    ...photoRows.results.map((r) => r.photo),
    ...docRows.results.map((r) => r.doc),
  ];

  // Delete R2 objects and the DB row in parallel
  // (ON DELETE CASCADE handles listing_photos / listing_docs rows)
  await Promise.all([
    ...r2Keys.map((key) => env.MEDIA.delete(key)),
    env.DB.prepare('DELETE FROM listing WHERE id = ?').bind(id).run(),
  ]);

  return new Response(null, { status: 204 });
}
