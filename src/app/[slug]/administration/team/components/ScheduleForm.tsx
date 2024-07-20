'use client';

import ComboBox from '@/components/inputs/ComboBox';
import MenuButton from '@/components/inputs/MenuButton';
import Button, { Variant } from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { convertDaysIntoString } from '@/lib/utils';
import { Catalog } from '@/types/catalog';
import { AddRounded } from '@mui/icons-material';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { Item } from 'react-stately';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import TimePicker from '@/components/inputs/TimePicker';

interface Values {
   work_days: string[];
   hours: {
      start_hour: Catalog | null;
      end_hour: Catalog | null;
   }[];
}

interface IScheduleForm {
   values: Values;
   setValues: Dispatch<SetStateAction<Values>>;
}

export default function ScheduleForm({ values, setValues }: IScheduleForm) {
   const { week_days, hours } = useAppSelector(store => store.catalogues);

   return (
      <div className="grid grid-cols-2 gap-5">
         <div className="col-span-2">
            <MenuButton
               label="Días hábiles"
               selectionMode="multiple"
               content={(() =>
                  convertDaysIntoString(values.work_days, week_days))()}
               selectedKeys={values.work_days}
               onSelectionChange={vals =>
                  setValues(prev => ({
                     ...prev,
                     work_days: Array.from(vals) as string[],
                  }))
               }
            >
               {[...week_days]
                  .sort((a, b) => a.code.localeCompare(b.code))
                  .map(day => (
                     <Item key={day.code}>{day.display_name}</Item>
                  ))}
            </MenuButton>
         </div>
         <label className="col-span-2 text-on-background-text label">
            Rango horario
         </label>
         {values.hours.map(({ start_hour, end_hour }, i) => (
            <div
               className="col-span-2 grid w-full grid-cols-[1fr_1fr_auto] gap-5"
               key={i}
            >
               <TimePicker
                  aria-label="start hour selector"
                  placeholder="7:00 AM"
                  selectedKey={start_hour?.code ?? null}
                  onSelectionChange={val =>
                     setValues(prev => {
                        const aux = { ...prev };

                        aux.hours[i].start_hour =
                           hours.find(hour => hour.code === val) ?? null;

                        const { start_hour, end_hour } = aux.hours[i];

                        if (
                           start_hour &&
                           end_hour &&
                           Number(start_hour.code) >= Number(end_hour.code)
                        ) {
                           aux.hours[i].end_hour = null;
                        }

                        return aux;
                     })
                  }
               />
               <TimePicker
                  start_hour={
                     start_hour !== null ? Number(start_hour.code) : undefined
                  }
                  aria-label="end hour selector"
                  isDisabled={!start_hour}
                  placeholder="5:00 PM"
                  selectedKey={end_hour?.code ?? null}
                  onSelectionChange={val =>
                     setValues(prev => {
                        const aux = { ...prev };

                        aux.hours[i].end_hour =
                           hours.find(hour => hour.code === val) ?? null;

                        return aux;
                     })
                  }
               />
               {i > 0 && (
                  <Button
                     aria-label="delete button"
                     className="w-min"
                     onPress={() => {
                        setValues(prev => {
                           const aux = [...prev.hours];

                           aux.splice(i, 1);

                           return { ...prev, hours: aux };
                        });
                     }}
                  >
                     <DeleteRoundedIcon className="!text-white" />
                  </Button>
               )}
            </div>
         ))}
         <Button
            className="flex items-center justify-center gap-2"
            variant={Variant.outlined}
            onPress={() =>
               setValues(prev => ({
                  ...prev,
                  hours: [...prev.hours, { start_hour: null, end_hour: null }],
               }))
            }
         >
            <AddRounded /> Agregar rango horario
         </Button>
         <div />
      </div>
   );
}
