import { getUserFullFilledById, getUserByCognitoId } from '@/services/user';
import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';
import DetailsView from './views/DetailsView';
import { Metadata } from 'next';
import { withSSRContext } from 'aws-amplify';
import { headers } from 'next/headers';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

export const revalidate = 0;

export const metadata: Metadata = {
   title: 'Mi perfil',
   description: meta_descriptions.profile_details,
};

export default async function Page({ params }: { params: { slug: string } }) {
   const SSR = withSSRContext({
      req: { headers: { cookie: headers().get('cookie') } },
   });

   const { username } = await SSR.Auth.currentAuthenticatedUser();

   const { id } = (await getUserByCognitoId(params.slug, username)).data;

   const data = (await getUserFullFilledById(params.slug, id.toString())).data;

   return <DetailsView data={data} slug={params.slug} />;
}
