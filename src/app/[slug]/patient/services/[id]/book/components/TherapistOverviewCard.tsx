'use client';

import Image from 'next/image';
import { Catalog } from '@/types/catalog';
import { NewUser, User } from '@/types/user';
import { translateRole } from '@/lib/utils';
import Link from 'next/link';
import { GlobalRoute } from '@/lib/routes';
import { useShowDetails } from '@/lib/hooks/useShowDetails';
import { ReactNode } from 'react';

type ITherapistOverviewCard = {
   user: NewUser;
   url?: GlobalRoute;
   code?: Catalog;
   extra?: ReactNode;
};

export default function TherapistOverviewCard({
   user,
   url,
   code,
   extra,
}: ITherapistOverviewCard) {
   return (
      <div
         className={`flex items-center justify-between gap-2 rounded-lg p-3 text-on-background-text shadow-lg`}
      >
         <div className="flex gap-3">
            <div className="relative aspect-square h-max w-10 overflow-hidden rounded-full">
               <Image
                  src={
                     user.profile_picture.length
                        ? user.profile_picture
                        : '/default_profile_picture.svg'
                  }
                  alt="Profile picture"
                  fill
               />
            </div>
            <div>
               <p className="w-full truncate text-sm font-semibold text-black">
                  {user.names} {user.last_names}
               </p>
               <p className="text-xs lg:text-sm">{translateRole(user.role)}</p>
            </div>
         </div>
         <div>
            {url && (
               <Link href={url} className="w-max font-semibold !text-secondary">
                  Ver perfil
               </Link>
            )}
            {extra}
         </div>
      </div>
   );
}
