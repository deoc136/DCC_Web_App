import { Amplify, Auth } from 'aws-amplify';
import aws_config from '../../aws-exports';

export function setUp_amplify() {
   try {
      Amplify.configure({
         ...aws_config,
         ssr: true,
         Auth: {
            cookieStorage: {
               domain:
                  process.env.NODE_ENV === 'development'
                     ? 'localhost'
                     : 'devfront.agendaahora.com',
               // :  'localhost',
               expires: 365,
               path: '/',
               secure: false,
            },
         },
      });
      Amplify.register(Auth);
   } catch (error) {}
}
