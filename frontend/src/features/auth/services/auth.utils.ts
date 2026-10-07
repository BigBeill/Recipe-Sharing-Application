import { ErrorValidation } from "@/shared/domain/errorClasses";

export function checkValidUsername(username: string): void {
   let reasonList: string[] = []

   if (username.length < 6) { reasonList.push("Must be at least 6 characters long"); }
   if (username.length > 256) { reasonList.push("Must be less than 128 characters long"); }

   if (reasonList. length != 0) {
      throw new ErrorValidation('Register validation failed', [{ field: 'password', reasonList }]);
   }
}

const ELYSIA_EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export function checkValidEmail(email: string): void {
   if (!ELYSIA_EMAIL_REGEX.test(email)) {
      throw new ErrorValidation('Register validation failed', [{ field: 'email', reasonList: ['invalid'] }]);
   }
}

//? not real validation, this just tells the client in advance if a server will reject the request or not.
export function checkValidPassword(password: string): void {
   let reasonList: string[] = []

   if (password.length < 6) { reasonList.push("Must be at least 6 characters long"); }
   if (password.length > 256) { reasonList.push("Must be less than 128 characters long"); }

   if (!/[a-z]/.test(password)) { reasonList.push("Must contain at least one lowercase letter"); }
   if (!/[A-Z]/.test(password)) { reasonList.push("Must contain at least one uppercase letter"); }
   if (!/[0-9]/.test(password)) { reasonList.push("Must contain at least one number"); }
   if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) { reasonList.push("Must contain at least one special character"); }

   if (/\s/.test(password)) { reasonList.push("Must not contain whitespace"); }

   if (reasonList. length != 0) {
      throw new ErrorValidation('Register validation failed', [{ field: 'password', reasonList }]);
   }
}