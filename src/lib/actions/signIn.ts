import { CognitoUser } from '@/types/amplify';
import { Auth } from 'aws-amplify';

type SignInParameters = {
   email: string;
   password: string;
};

export async function signIn({ email, password }: SignInParameters) {
   try {
      const user = await Auth.signIn(email, password);
      return user as CognitoUser;
   } catch (error) {
      console.error('error signing in', error);
      throw error;
   }
}
