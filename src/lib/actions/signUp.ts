import { Auth } from 'aws-amplify';

interface SignUpParameters {
   password: string;
   email: string;
   slug: string;
}

export async function signUp({ email, password, slug }: SignUpParameters) {
   try {
      const response = await Auth.signUp({
         username: email,
         password,
         autoSignIn: {
            enabled: false,
         },
         clientMetadata: {
            arguments: JSON.stringify({
               slug,
            }),
         },
      });
      return response;
   } catch (error) {
      console.error('error signing up:', error);
      throw error;
   }
}
