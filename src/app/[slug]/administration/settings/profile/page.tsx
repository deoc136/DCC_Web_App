import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import ProfileSettingsOverview from './views/ProfileSettingsOverview';

export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const user = (await getUserByCognitoId(params.slug, username)).data;

   return <ProfileSettingsOverview user={user} slug={params.slug} />;
}
