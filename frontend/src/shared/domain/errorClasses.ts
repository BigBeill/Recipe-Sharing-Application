export class ErrorNotFound extends Error {
   constructor (message: string, options?: ErrorOptions) {
      super(message, options);
      this.name = 'Not Found Error';
   }
}

export class ErrorUnauthorized extends Error {
   constructor (message: string, options?: ErrorOptions) {
      super(message, options);
      this.name = 'Unauthorized Error';
   }
}

interface TypeProblemField {
   field: string
   reasonList: string[]
}

export class ErrorValidation extends Error {
   readonly rejectedFieldList: TypeProblemField[];

   constructor (message: string, rejectedFieldList: TypeProblemField[], options?: ErrorOptions) {
      super(message, options);
      this.name = 'Validation Error';
      this.rejectedFieldList = rejectedFieldList;
   }
}
