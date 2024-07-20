'use client';

import Image from 'next/image';
import { Catalog } from '@/types/catalog';
import { FullFilledUser, User } from '@/types/user';
import { convertDaysIntoString, cutFullName, translateRole } from '@/lib/utils';
import Link from 'next/link';
import { GlobalRoute } from '@/lib/routes';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import WatchLaterRoundedIcon from '@mui/icons-material/WatchLaterRounded';
import Card from './Card';
import { useRouter } from 'next/navigation';
import Button, { Variant } from '../Button';

type IUserOverviewCard = {
   data: Omit<FullFilledUser, 'services'>;
   url: GlobalRoute;
   code?: Catalog;
};

export default function EmployeeCard({ data, url, code }: IUserOverviewCard) {
   const { schedules, user } = data;

   const { week_days, hours } = useAppSelector(store => store.catalogues);

   const router = useRouter();

   return (
      <Card isShadowed className="grid gap-4 text-on-background-text">
         <div className="flex w-full justify-start gap-3 overflow-hidden">
            <div className="relative aspect-square h-max w-16 overflow-hidden rounded-full">
               <Image
                  src={
                     user.profile_picture.length
                        ? user.profile_picture
                        : '/default_profile_picture.svg'
                  }
                  className="rounded-full object-cover object-center"
                  alt="Profile picture"
                  fill
               />
            </div>
            <div className="truncate font-semibold">
               <p className="text-lg text-black">
                  {cutFullName(user.names, user.last_names)}
               </p>
               <p>{translateRole(data.user.role)}</p>
            </div>
         </div>
         <div className="flex w-full items-center gap-2 truncate">
            <EmailRoundedIcon /> {user.email}
         </div>
         <div className="flex w-full items-center gap-2 truncate">
            <LocalPhoneRoundedIcon /> {code?.code} {user.phone}
         </div>
         <div className="flex w-full items-center gap-2 truncate">
            <WatchLaterRoundedIcon />{' '}
            <p className="w-full truncate">
               {schedules
                  .map(
                     (schedule, i) =>
                        `${convertDaysIntoString(
                           schedule.days.map(({ day }) => day.toString()),
                           week_days,
                        )}
                  ${schedule.hour_ranges
                     .map(
                        range =>
                           `${hours.find(hour => hour.code === range.start_hour)
                              ?.display_name} - ${hours.find(
                              hour => hour.code === range.end_hour,
                           )?.display_name}`,
                     )
                     .join(' / ')}`,
                  )
                  .join(' / ')}
            </p>
         </div>
         <Button variant={Variant.secondary} href={url}>
            Abrir perfil del personal
         </Button>
      </Card>
   );
}
