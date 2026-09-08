import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import mongoose from 'mongoose';
import { app } from '../../app';
import { UserModel } from '../../common/mongo-db/schemas/user.schema';

describe('Auth module', () => {
   beforeAll(async () => {
      await mongoose.connect(process.env.MONGODB_URI_TEST!);
   });

   afterAll(async () => {
      await mongoose.disconnect();
   });

   beforeEach(async () => {
      await UserModel.deleteMany({});
   });

   it('registers a new user', async () => {
      const response = await app.handle(
         new Request('http://localhost/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               email: 'test@example.com',
               password: 'securepass123',
               name: 'Test User',
            }),
         }),
      );
   })

   it('rejects duplicate emails', async () => {
      const payload = {
         email: 'dup@example.com',
         password: 'securepass123',
         name: 'Dup',
      };
      const make = () => app.handle(
         new Request('http://localhost/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         }),
      );
      await make();
      const res = await make();
      expect(res.status).toBe(409);
   });
});