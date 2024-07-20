'use client';

import { useCalendar, useLocale } from 'react-aria';
import { CalendarStateOptions, Item, useCalendarState } from 'react-stately';
import { CalendarDate, createCalendar } from '@internationalized/date';
import MonthButton from './MonthButton';
import CalendarGrid from './CalendarGrid';
import ChevronRight from '@mui/icons-material/ChevronRightRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeftRounded';
import { Select } from '../inputs/Select';
import { arrayFromNumbers } from '@/lib/utils';
import CalendarHeader from './CalendarHeader';

type ICalendar = Omit<CalendarStateOptions, 'locale' | 'createCalendar'>;

export default function Calendar(props: ICalendar) {
   const { locale } = useLocale();
   const state = useCalendarState({
      ...props,
      locale,
      createCalendar,
   });

   const { calendarProps, prevButtonProps, nextButtonProps, title } =
      useCalendar(props, state);

   return (
      <div
         {...calendarProps}
         className="w-full p-5 text-sm lg:p-10 lg:text-base"
      >
         <CalendarHeader
            prevButtonProps={prevButtonProps}
            nextButtonProps={nextButtonProps}
            title={title}
            state={state}
         />
         <CalendarGrid state={state} />
      </div>
   );
}
