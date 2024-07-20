export class AuthError extends Error {
   public message: string;
   public code: string;

   constructor(error: any) {
      super();
      this.message = error.message ?? '';
      this.code = error.code ?? '';
   }
}
