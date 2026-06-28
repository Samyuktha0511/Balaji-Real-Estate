import { IRequest } from 'itty-router';
import { Env } from '../types';
import { errorResponse, withCors } from '../cors';

// ─── MIME type lookup ─────────────────────────────────────────────────────────

const MIME_TYPES: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg:  'image/svg+xml',
  pdf:  'application/pdf',
  doc:  'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls:  'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * POST /api/listings/:id/photos
 *
 * Accepts multipart/form-data with field name "files".
 * Uploads each file to R2 with a UUID key, then records the key in D1.
 * Returns the array of stored R2 keys.
 */
export async function uploadPhotos(req: IRequest, env: Env): Promise<Response> {
  const { id } = req.params;

  // Verify listing exists
  const listing = await env.DB
    .prepare('SELECT id FROM listing WHERE id = ?')
    .bind(id)
    .first<{ id: number }>();
  if (!listing) return errorResponse('Listing not found', 404);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse('Failed to parse multipart form data', 400);
  }

  const files = formData.getAll('files');
  if (!files || files.length === 0) {
    return errorResponse('No files provided — use field name "files"', 400);
  }

  const savedKeys: string[] = [];

  for (const entry of files) {
    // Duck-type check: File has `size` and `name`; string entries don't
    if (typeof entry === 'string' || !('size' in entry) || (entry as File).size === 0) continue;
    const file = entry as File;

    // Build a UUID-based R2 key preserving the original extension
    const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
    const key = crypto.randomUUID() + ext;

    const contentType = file.type || getContentType(file.name);

    // Upload to R2
    await env.MEDIA.put(key, file.stream(), {
      httpMetadata: { contentType },
    });

    // Record in D1
    await env.DB
      .prepare('INSERT INTO listing_photos (listing_id, photo) VALUES (?, ?)')
      .bind(id, key)
      .run();

    savedKeys.push(key);
  }

  return Response.json(savedKeys);
}

/**
 * GET /api/listings/media/:filename
 *
 * Streams the R2 object back to the client with the correct Content-Type.
 * Adds long-lived Cache-Control since file keys are content-addressed (UUID).
 */
export async function serveMedia(req: IRequest, env: Env): Promise<Response> {
  const { filename } = req.params;

  // Guard against path traversal
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return errorResponse('Invalid filename', 400);
  }

  const object = await env.MEDIA.get(filename);
  if (!object) return errorResponse('File not found', 404);

  const contentType = object.httpMetadata?.contentType ?? getContentType(filename);

  // Stream the R2 object body directly — no buffering needed
  return withCors(
    new Response(object.body, {
      headers: {
        'Content-Type':  contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag':          object.etag,
        'Content-Length': String(object.size),
      },
    })
  );
}
