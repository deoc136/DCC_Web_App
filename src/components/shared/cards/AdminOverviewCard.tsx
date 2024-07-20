'use client';

import Image from 'next/image';
import { Values } from '../../../app/software-owner/management/clinics/create/values';
import { Catalog } from '@/types/catalog';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Button from '@/components/shared/Button';

type IAdminOverviewCard = {
   admin: Values['administrator'];
   code?: Catalog;
   action?: () => any;
   editing?: boolean;
};

export default function AdminOverviewCard({
   admin,
   code,
   editing = false,
   action,
}: IAdminOverviewCard) {
   return (
      <div
         className={`grid items-center gap-2 rounded-lg bg-foundation p-4 text-on-background-text shadow-lg ${
            editing ? 'grid-cols-[2fr_1fr_1fr_auto]' : 'grid-cols-[2fr_1fr_1fr]'
         }`}
      >
         <div className="flex gap-3">
            <div className="relative aspect-square h-max w-10 overflow-hidden rounded-full">
               <Image
                  src="/default_profile_picture.svg"
                  alt="Profile picture"
                  fill
               />
            </div>
            <div>
               <p className="mb-2 text-lg font-semibold">
                  {admin.names} {admin.lastNames}
               </p>
               <p>Administrador Master</p>
            </div>
         </div>
         <p>
            {code?.code} {admin.phone}
         </p>
         <p>{admin.email}</p>
         {editing && (
            <Button
               onPress={action}
               className="flex w-max items-center gap-2 bg-transparent !text-secondary"
            >
               <EditRoundedIcon /> Editar
            </Button>
         )}
      </div>
   );
}
