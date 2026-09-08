import { ErrorValidation } from "@/shared/lib/api/errorClasses";

export function checkValidUsername(username: string): void {
   let issueList: string[] = []

   if (username.length < 6) { issueList.push("Must be at least 6 characters long"); }
   if (username.length > 256) { issueList.push("Must be less than 128 characters long"); }

   if (issueList. length != 0) {
      throw new ErrorValidation([{ field: 'password', issueList }]);
   }
}

const ELYSIA_EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export function checkValidEmail(email: string): void {
   if (!ELYSIA_EMAIL_REGEX.test(email)) {
      throw new ErrorValidation([{ field: 'email', issueList: ['invalid'] }]);
   }
}

//? not real validation, this just tells the client in advance if a server will reject the request or not.
export function checkValidPassword(password: string): void {
   let issueList: string[] = []

   if (password.length < 6) { issueList.push("Must be at least 6 characters long"); }
   if (password.length > 256) { issueList.push("Must be less than 128 characters long"); }

   if (!/[a-z]/.test(password)) { issueList.push("Must contain at least one lowercase letter"); }
   if (!/[A-Z]/.test(password)) { issueList.push("Must contain at least one uppercase letter"); }
   if (!/[0-9]/.test(password)) { issueList.push("Must contain at least one number"); }
   if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) { issueList.push("Must contain at least one special character"); }

   if (/\s/.test(password)) { issueList.push("Must not contain whitespace"); }

   if (issueList. length != 0) {
      throw new ErrorValidation([{ field: 'password', issueList }]);
   }
}