'use client';

import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import ResetPasswordGeneralView from '@/views/ResetPassword/ResetPasswordView';

export default function Page() {
   const clinic = useAppSelector(store => store.clinic);

   return (
      <ResetPasswordGeneralView
         imgSrc={clinic.profile_picture_url}
         redirectionRoute={clinicRoutes(clinic.slug).login}
         slug={clinic.slug}
      />
   );
}
