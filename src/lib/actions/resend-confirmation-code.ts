import { Auth } from 'aws-amplify';

type ResendConfCodeParameters = {
   email: string;
   slug: string;
};

export async function resendConfirmationCode({
   email,
   slug,
}: ResendConfCodeParameters) {
   try {
      await Auth.resendSignUp(email, { arguments: JSON.stringify({ slug }) });
   } catch (err) {
      console.error('error resending code: ', err);
   }
}
