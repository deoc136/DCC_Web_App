import type { Metadata } from 'next';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import DetailsView from './views/DetailsView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Información personal',
   description: meta_descriptions.profile_details,
};
export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const { data: user } = await getUserByCognitoId(params.slug, username);

   return <DetailsView slug={params.slug} user={user} />;
}
