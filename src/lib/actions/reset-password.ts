import { Auth } from 'aws-amplify';

export async function sendPasswordResetCode(email: string, slug: string) {
   try {
      const response = await Auth.forgotPassword(email, {
         arguments: JSON.stringify({ slug }),
      });
      return response;
   } catch (error) {
      console.error('error sending password reset mail', error);
      throw error;
   }
}

export async function enterPasswordResetCode(
   email: string,
   code: string,
   password: string,
) {
   try {
      const response = await Auth.forgotPasswordSubmit(email, code, password);
      return response;
   } catch (error) {
      console.error('error resetting password', error);
      throw error;
   }
}
