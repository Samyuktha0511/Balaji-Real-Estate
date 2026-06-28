/**
 * Cloudflare Worker bindings injected at runtime.
 * These must match the bindings declared in wrangler.toml.
 */
export interface Env {
  /** D1 SQLite database binding */
  DB: D1Database;
  /** R2 bucket for photos and documents */
  MEDIA: R2Bucket;
  /** Allowed CORS origin (set as var in wrangler.toml) */
  ALLOWED_ORIGIN: string;
}

/** Shape of a listing row as returned from D1 */
export interface ListingRow {
  id: number;
  title: string | null;
  address: string | null;
  /** Stored as TEXT to avoid float precision issues */
  price: string | null;
  area: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
}

/** Full listing shape returned to clients (includes photos + documents arrays) */
export interface Listing extends ListingRow {
  photos: string[];
  documents: string[];
}

/** Body expected when creating or updating a listing */
export interface ListingInput {
  title?: string;
  address?: string;
  price?: string | number;
  area?: string;
  description?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
}
