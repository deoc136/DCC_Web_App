'use client';

import Image from 'next/image';
import { Catalog } from '@/types/catalog';
import { NewUser, User } from '@/types/user';
import { cutFullName, translateRole } from '@/lib/utils';
import Link from 'next/link';
import { GlobalRoute } from '@/lib/routes';
import { useShowDetails } from '@/lib/hooks/useShowDetails';
import { ReactNode } from 'react';

type IUserOverviewCard = {
   user: NewUser;
   url?: GlobalRoute;
   code?: Catalog;
   extra?: ReactNode;
};

export default function UserOverviewCard({
   user,
   url,
   code,
   extra,
}: IUserOverviewCard) {
   const show_details = useShowDetails();

   return (
      <div
         className={`grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-foundation p-4 text-on-background-text shadow-lg ${
            show_details
               ? 'lg:grid-cols-[2fr_1fr_1fr_auto]'
               : 'lg:grid-cols-[1fr_auto]'
         }`}
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
                  className="object-cover"
                  fill
               />
            </div>
            <div>
               <p className="mb-1 w-full truncate font-semibold text-black lg:text-lg">
                  {cutFullName(user.names, user.last_names)}
               </p>
               <p className="text-xs lg:text-base">
                  {translateRole(user.role)}
               </p>
            </div>
         </div>
         {show_details && (
            <>
               <p className="hidden w-full truncate lg:block">
                  {code?.code} {user.phone}
               </p>
               <p className="hidden w-full truncate lg:block">{user.email}</p>
            </>
         )}
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
