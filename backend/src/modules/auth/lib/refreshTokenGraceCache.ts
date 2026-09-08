type TypeGraceEntry = { 
   token: string; 
   userId: string; 
   timeout: ReturnType<typeof setTimeout>;
};

class GraceCache {
   private store = new Map<string, TypeGraceEntry>();

   set(oldHash: string, token: string, userId: string, ttlMs: number) {
      
      // clear any existing timer for this key before overwriting
      this.store.get(oldHash)?.timeout && clearTimeout(this.store.get(oldHash)!.timeout);

      const timeout = setTimeout(() => this.store.delete(oldHash), ttlMs);
      this.store.set(oldHash, { token, userId, timeout });
   }

   get(oldHash: string): { token: string; userId: string } | undefined {
      const entry = this.store.get(oldHash);
      return entry ? { token: entry.token, userId: entry.userId } : undefined;
   }
}

export const graceCache = new GraceCache();