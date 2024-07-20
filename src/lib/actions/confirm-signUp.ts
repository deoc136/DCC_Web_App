import { Auth } from 'aws-amplify';

type ConfirmSignUpParameters = {
   email: string;
   code: string;
};

export async function confirmSignUp({ email, code }: ConfirmSignUpParameters) {
   try {
      await Auth.confirmSignUp(email, code);
   } catch (error) {
      console.error('error confirming sign up: ', error);
      throw error;
   }
}

export async function resendVerificationCode(email: string, slug: string) {
   try {
      await Auth.resendSignUp(email, { arguments: JSON.stringify({ slug }) });
   } catch (error) {
      console.error('error resending verification code: ', error);
      throw error;
   }
}
