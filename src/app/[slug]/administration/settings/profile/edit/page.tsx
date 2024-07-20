import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import ProfileSettingsEdit from '../views/ProfileSettingsEdit';

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const user = (await getUserByCognitoId(params.slug, username)).data;

   return <ProfileSettingsEdit user={user} slug={params.slug} />;
}
