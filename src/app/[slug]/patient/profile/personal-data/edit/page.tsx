import type { Metadata } from 'next';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { getUserByCognitoId } from '@/services/user';
import EditionView from './view/EditionView';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const metadata: Metadata = {
   title: 'Editar información personal',
   description: meta_descriptions.profile_settings,
};
export const revalidate = 0;

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const { data: user } = await getUserByCognitoId(params.slug, username);

   return <EditionView slug={params.slug} user={user} />;
}
