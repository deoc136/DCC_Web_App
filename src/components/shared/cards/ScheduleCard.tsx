'use client';

import { Schedule } from '@/app/[slug]/administration/team/create/views/CreationView';
import Card from './Card';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { convertDaysIntoString } from '@/lib/utils';
import { useState } from 'react';
import PopoverTrigger from '../PopoverTrigger';
import Dialog from '@/components/modal/Dialog';
import { ListBox } from '../ListBox';
import { Item } from 'react-stately';
import Button from '../Button';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

interface IScheduleCard {
   schedule: Schedule;
   deleteAction: () => any;
   editAction: () => any;
}

export default function ScheduleCard({
   schedule,
   deleteAction,
   editAction,
}: IScheduleCard) {
   const { hours, week_days } = useAppSelector(store => store.catalogues);

   return (
      <Card className="flex flex-col gap-4" isShadowed>
         <div className="grid grid-cols-[1fr_auto]">
            <p className="w-full truncate font-semibold">
               {convertDaysIntoString(schedule.work_days, week_days)}
            </p>
            <SeeMoreButton
               deleteAction={deleteAction}
               editAction={editAction}
            />
         </div>
         <p className="w-full truncate text-sm text-on-background-text">
            {schedule.hours
               .map(
                  range =>
                     `${hours.find(hour => hour.code === range.start_hour)
                        ?.display_name} - ${hours.find(
                        hour => hour.code === range.end_hour,
                     )?.display_name}`,
               )
               .join(' / ')}
         </p>
      </Card>
   );
}

function SeeMoreButton({
   deleteAction,
   editAction,
}: {
   deleteAction: () => any;
   editAction: () => any;
}) {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <PopoverTrigger
         isOpen={isOpen}
         onOpenChange={setIsOpen}
         trigger={<MoreVertRoundedIcon className="!fill-on-background-text" />}
      >
         <Dialog className="rounded">
            <ListBox className="right-0 !p-0 !py-2 shadow-xl">
               <Item textValue="Editar">
                  <Button
                     aria-label="edit button"
                     onPress={() => {
                        editAction();
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-on-background-text"
                  >
                     Editar
                  </Button>
               </Item>
               <Item aria-label="delete button" textValue="Eliminar">
                  <Button
                     onPress={() => {
                        deleteAction();
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-secondary"
                  >
                     Eliminar
                  </Button>
               </Item>
            </ListBox>
         </Dialog>
      </PopoverTrigger>
   );
}
