'use client';

import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import ActivateAccountView from '@/views/ActivateAccount/ActivateAccountView';

export default function Page() {
   const clinic = useAppSelector(store => store.clinic);

   return (
      <ActivateAccountView
         imgSrc={clinic.profile_picture_url}
         loginRoute={clinicRoutes(clinic.slug).login}
         slug={clinic.slug}
      />
   );
}
