'use client';

import { DateValue, useLocale, useRangeCalendar } from 'react-aria';
import {
   Item,
   RangeCalendarStateOptions,
   useRangeCalendarState,
} from 'react-stately';
import { createCalendar } from '@internationalized/date';
import { useRef } from 'react';
import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';

type IRangeCalendar = Omit<
   RangeCalendarStateOptions<DateValue>,
   'locale' | 'createCalendar'
>;

export default function RangeCalendar(props: IRangeCalendar) {
   const { locale } = useLocale();

   const state = useRangeCalendarState({ ...props, locale, createCalendar });

   const ref = useRef(null);

   const { prevButtonProps, nextButtonProps, calendarProps, title } =
      useRangeCalendar(props, state, ref);

   return (
      <div
         {...calendarProps}
         ref={ref}
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
