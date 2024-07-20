import { findSoftwareOwnerByCognitoId } from '@/services/software-owner';
import { CognitoUser } from '@/types/amplify';
import { withSSRContext } from 'aws-amplify';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import SettingsView from './view/SettingsView';
import { redirect } from 'next/navigation';
import { SORoutes } from '@/lib/routes';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Configuración',
   description: meta_descriptions.profile_settings,
};

export const revalidate = 0;

export default async function Page() {
   try {
      const SSR = withSSRContext({
         req: { headers: { cookie: headers().get('cookie') } },
      });
      const user: CognitoUser = await SSR.Auth.currentAuthenticatedUser();

      const attributes = (await findSoftwareOwnerByCognitoId(user.username))
         .data;

      return <SettingsView attributes={attributes} />;
   } catch (error) {
      redirect(SORoutes.management_clinics);
   }
}
