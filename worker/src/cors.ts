/**
 * CORS utilities for the Balaji Real Estate Worker.
 *
 * Used by the itty-router `cors()` helper via AutoRouter config.
 * Standalone helpers are also exported for use in special responses
 * (e.g. 404 from media handler) that bypass the router pipeline.
 */

/** Default CORS headers applied to every response */
export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Wrap an existing Response with CORS headers.
 * Use this in handlers that need to return non-JSON responses
 * (e.g. media streaming) where the router's corsify finaliser
 * may not automatically fire.
 */
export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Convenience: JSON error response with CORS headers */
export function errorResponse(message: string, status: number): Response {
  return withCors(
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}
