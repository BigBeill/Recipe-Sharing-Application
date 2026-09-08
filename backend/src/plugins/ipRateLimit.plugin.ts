import { Elysia } from "elysia";

interface IpRateLimitOptions {
  limit: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  windowStart: number;
}

export function ipRateLimit(opts: IpRateLimitOptions) {
   const buckets = new Map<string, Bucket>();

   // periodic cleanup so the map doesn't grow forever with stale IPs
   setInterval(() => {
      const now = Date.now();
      for (const [ip, bucket] of buckets) {
         if (now - bucket.windowStart > opts.windowMs) buckets.delete(ip);
      }
   }, opts.windowMs);

   return new Elysia({ name: "ip-rate-limit" }).onRequest(({ request, set }) => {
      const ip = getClientIp(request);
      const now = Date.now();

      let bucket = buckets.get(ip);
      if (!bucket || now - bucket.windowStart > opts.windowMs) {
         bucket = { count: 0, windowStart: now };
         buckets.set(ip, bucket);
      }

      bucket.count++;

      if (bucket.count > opts.limit) {
         set.status = 429;
         return "Too many requests — slow down.";
      }
   });
}

function getClientIp(request: Request): string {
   // Railway sits behind a proxy — the real client IP is in this header
   const forwarded = request.headers.get("x-forwarded-for");
   if (forwarded) { return forwarded.split(",")[0]?.trim() || "unknown"; }
   return "unknown";
}