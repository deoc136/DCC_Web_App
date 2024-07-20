'use client';

import { getClinicBySlug } from '@/services/clinic';
import { getUserByCognitoId } from '@/services/user';
import { signOut } from '@/lib/actions/signOut';
import { clinicRoutes } from '@/lib/routes';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface IPreventLoginAuthenticated {
   slug: string;
}

export default function PreventLoginAuthenticated({
   slug,
}: IPreventLoginAuthenticated) {
   const router = useRouter();

   useEffect(() => {
      (async () => {
         try {
            const { username } = await Auth.currentAuthenticatedUser();
            const user = (await getUserByCognitoId(slug, username)).data;
            const { clinic } = (await getClinicBySlug(slug)).data;

            switch (user.role) {
               case 'ADMINISTRATOR':
                  if (clinic.administrator_id !== username) {
                     throw Error;
                  } else {
                     router.push(clinicRoutes(slug).admin_services);
                  }
                  break;
               case 'THERAPIST':
                  router.push(
                     clinicRoutes(clinic.slug).therapist_appointments_actives,
                  );
                  break;
               case 'RECEPTIONIST':
                  router.push(
                     clinicRoutes(clinic.slug)
                        .receptionist_appointments_actives,
                  );
               case 'PATIENT':
                  router.push(clinicRoutes(clinic.slug).patient_services);
               default:
                  break;
            }
         } catch (error) {
            signOut();
         }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return <></>;
}
