'use client';

import { SORoutes } from '@/lib/routes';
import ResetPasswordGeneralView from '@/views/ResetPassword/ResetPasswordView';
import { useSearchParams } from 'next/navigation';

export default function Page() {
   const searchParams = useSearchParams();
   const step = searchParams.get('step');

   return (
      <ResetPasswordGeneralView
         imgSrc="/agenda_ahora_logo.png"
         redirectionRoute={SORoutes.login}
         slug="software-owner"
      />
   );
}
