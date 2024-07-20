'use client';

import { Service } from '@/types/service';
import Card from './Card';
import { formatPrice, secondsToTimeExtended } from '@/lib/utils';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Button from '../Button';

interface IServiceOverviewCard {
   service: Service;
   deleteButtonAction?: () => any;
}

export default function ServiceOverviewCard({
   service,
   deleteButtonAction,
}: IServiceOverviewCard) {
   const clinicCurrency = useClinicCurrency();

   return (
      <Card isShadowed className="flex justify-between gap-10">
         <div className="flex flex-col sm:w-full flex-wrap gap-4 text-on-background-text sm:grid sm:grid-cols-4">
            <p className="truncate font-semibold text-black sm:w-full">
               {service.name}
            </p>
            <p className="truncate sm:w-full">
               {secondsToTimeExtended(Number(service.service_duration))}
            </p>
            <p className="truncate sm:w-full">
               {formatPrice(Number(service.price), clinicCurrency)}
            </p>
            <div className="hidden items-center gap-2 self-start truncate sm:flex sm:h-auto">
               <CircleRoundedIcon className="!fill-success" />
               Activo
            </div>
         </div>
         <div className="flex items-center gap-2 self-start truncate sm:hidden sm:h-auto">
            <CircleRoundedIcon className="!fill-success" />
            Activo
         </div>
         {!!deleteButtonAction && (
            <Button
               onPress={deleteButtonAction}
               className="!w-max !bg-transparent !p-0"
            >
               <DeleteRoundedIcon className="!fill-secondary" />
            </Button>
         )}
      </Card>
   );
}
