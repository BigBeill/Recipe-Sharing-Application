import { Elysia } from "elysia";

/*
circuit breaker is a last resort against DDoS attacks
If an attack slips by IP filtering, Vercel, and Cloudflare. This function will bring down the service temporarily before damage gets too high.
*/

interface CircuitBreakerOptions {
  limit: number;
  windowMs: number;
  cooldownMs: number; 
}

export function circuitBreaker(opts: CircuitBreakerOptions) {
   let windowStart = Date.now();
   let requestCount = 0;
   let trippedUntil: number | null = null;

   return new Elysia({ name: "circuit-breaker" }).onRequest(({ set }) => {
      const now = Date.now();

      // if we're in cooldown, short-circuit immediately
      if (trippedUntil && now < trippedUntil) {
         set.status = 503;
         return "Service temporarily unavailable — too many requests.";
      }
      if (trippedUntil && now >= trippedUntil) {
         // cooldown expired, reset
         trippedUntil = null;
         windowStart = now;
         requestCount = 0;
      }

      // reset window if it's elapsed
      if (now - windowStart > opts.windowMs) {
         console.log("Request window ended, request count:", requestCount)
         windowStart = now;
         requestCount = 0;
      }

      requestCount++;

      if (requestCount > opts.limit) {
         trippedUntil = now + opts.cooldownMs;
         set.status = 503;
         return "Service temporarily unavailable — too many requests.";
      }
   });
}