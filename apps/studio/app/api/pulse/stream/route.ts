import { NextRequest } from 'next/server';
import { PulseEngine } from '@aix/core';

/**
 * GET /api/pulse/stream
 *
 * Server-Sent Events endpoint — live AXIOM Nervous System dashboard.
 *
 * Streams the last 20 BusEvents from the Redis spine every 500 ms.
 * All 4 rings (Rust / Go / TS / ZK) are visible here in real-time.
 *
 * Client usage:
 *   const es = new EventSource('/api/pulse/stream');
 *   es.onmessage = (e) => console.log(JSON.parse(e.data));
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POLL_INTERVAL_MS = 500;
const EVENTS_PER_TICK  = 20;

export async function GET(_req: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial connection-confirmed comment (SSE spec)
      controller.enqueue(encoder.encode(': connected\n\n'));

      let lastTimestamp = 0;

      while (true) {
        try {
          const events = await PulseEngine.getLatest(EVENTS_PER_TICK);

          // Only push if there's something new
          const fresh = events.filter(e => e.timestamp > lastTimestamp);
          if (fresh.length > 0) {
            lastTimestamp = fresh[0].timestamp; // list is newest-first
            const payload = `data: ${JSON.stringify(fresh)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
        } catch (err) {
          // Emit error event so the client can show a reconnect banner
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`)
          );
        }

        await sleep(POLL_INTERVAL_MS);
      }
    },

    cancel() {
      // Client disconnected — stream closes automatically
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type'                : 'text/event-stream',
      'Cache-Control'               : 'no-cache, no-transform',
      'Connection'                  : 'keep-alive',
      'X-Accel-Buffering'           : 'no',  // Disable Nginx buffering
      'Access-Control-Allow-Origin' : '*',
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
