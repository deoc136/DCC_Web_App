import { Auth } from 'aws-amplify';

export async function signOut() {
   try {
      await Auth.signOut();
   } catch (error) {
      console.error('error signing in', error);
   }
}
