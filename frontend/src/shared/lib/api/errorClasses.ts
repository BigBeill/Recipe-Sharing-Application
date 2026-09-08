export class ErrorNotFound extends Error {
   constructor () {
      super('Resource Not Found');
      this.name = 'Not Found Error';
   }
}

export class ErrorUnauthorized extends Error {
   constructor (message: string = 'Unauthorized access') {
      super(message);
      this.name = 'Unauthorized Error';
   }
}

interface ErrorValidationType {
   field: string
   issueList: string[]
}

export class ErrorValidation extends Error {
   readonly errorList: ErrorValidationType[];

   constructor (ErrorValidationList: ErrorValidationType[]) {
      super('Form Validation Failed')
      this.name = 'Validation Error';
      this.errorList = ErrorValidationList;
   }
}
