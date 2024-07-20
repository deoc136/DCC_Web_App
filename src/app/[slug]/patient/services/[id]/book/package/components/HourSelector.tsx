'use client';

import Button from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Catalog } from '@/types/catalog';

interface IHourSelector {
   filteredHours: Catalog[];
   setHour: (code: string) => any;
   selectedHour: string;
}

export default function HourSelector({
   filteredHours,
   setHour,
   selectedHour,
}: IHourSelector) {
   const hours = useAppSelector(store => store.catalogues.hours);

   return (
      <div className="grid grid-cols-2 gap-5 text-xs lg:grid-cols-3 lg:text-sm">
         {hours.map(hour => {
            const aux = `${hour.name} - ${(hour =>
               hour ? hour.name : '11:00 PM')(
               hours.find(({ code }) => Number(code) === Number(hour.code) + 1),
            )}`;

            const isAvailable = filteredHours.some(
               ({ code }) => code === hour.code,
            );

            return (
               <Button
                  onPress={() => setHour(hour.code)}
                  isDisabled={!isAvailable}
                  className={`!rounded-full !text-black ${
                     hour.code === selectedHour
                        ? '!bg-primary'
                        : '!bg-foundation'
                  }`}
                  key={hour.code}
               >
                  {aux}
               </Button>
            );
         })}
      </div>
   );
}
