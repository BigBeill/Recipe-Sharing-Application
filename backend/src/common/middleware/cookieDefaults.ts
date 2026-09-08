import Elysia from "elysia";

export const authController = new Elysia({ 
   prefix: '/auth',
   cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
   }
});