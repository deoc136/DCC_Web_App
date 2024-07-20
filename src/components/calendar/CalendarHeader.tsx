'use client';

import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import MonthButton from './MonthButton';
import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import { Select } from '../inputs/Select';
import { CalendarDate } from '@internationalized/date';
import { arrayFromNumbers } from '@/lib/utils';
import { CalendarState, Item, RangeCalendarState } from 'react-stately';
import { AriaButtonProps } from 'react-aria';

interface ICalendarHeader {
   prevButtonProps: AriaButtonProps<'button'>;
   nextButtonProps: AriaButtonProps<'button'>;
   title: string;
   state: RangeCalendarState | CalendarState;
}

export default function CalendarHeader({
   state,
   nextButtonProps,
   prevButtonProps,
   title,
}: ICalendarHeader) {
   const today = new Date();

   const { focusedDate, setFocusedDate, maxValue } = state;

   return (
      <div className="mb-7 grid w-full grid-cols-3 items-stretch gap-2">
         <div className="col-span-2 flex items-center justify-between rounded-lg bg-foundation p-2 text-secondary">
            <MonthButton {...prevButtonProps}>
               <ChevronLeft />
            </MonthButton>
            <p className="text-sm font-semibold lg:text-lg">
               {(month => {
                  return month.charAt(0).toUpperCase() + month.slice(1);
               })(
                  Intl.DateTimeFormat(undefined, { month: 'long' }).format(
                     new Date(focusedDate.month.toString()),
                  ),
               )}
            </p>
            <MonthButton {...nextButtonProps}>
               <ChevronRight />
            </MonthButton>
         </div>
         <Select
            className="bg-transparent !text-on-background-text shadow-md"
            staticWidth
            selectedKey={focusedDate.year.toString()}
            onSelectionChange={val => {
               if (!val) return;
               const aux = new CalendarDate(
                  Number(val),
                  focusedDate.month,
                  focusedDate.day,
               );
               setFocusedDate(aux);
            }}
         >
            {
               arrayFromNumbers(
                  -(today.getFullYear() - (state.minValue?.year ?? 0)),
                  10,
               )
                  .map(number => {
                     const year = today.getFullYear() + number;

                     return !maxValue || year <= maxValue?.year ? (
                        <Item
                           aria-label={year.toString()}
                           textValue={year.toString()}
                           key={year.toString()}
                        >
                           <div className="px-4 py-3 hover:bg-primary-100">
                              {year}
                           </div>
                        </Item>
                     ) : undefined;
                  })
                  .filter(el => el !== undefined) as any
            }
         </Select>
      </div>
   );
}
