'use client';

import { SORoutes } from '@/lib/routes';
import ActivateAccountView from '@/views/ActivateAccount/ActivateAccountView';

export default function Page() {
   return (
      <ActivateAccountView
         imgSrc="/agenda_ahora_logo.png"
         loginRoute={SORoutes.login}
         slug="software-owner"
      />
   );
}
