'use client';

import { getWeeksInMonth } from '@internationalized/date';
import { AriaCalendarGridProps, useCalendarGrid, useLocale } from 'react-aria';
import { CalendarState, RangeCalendarState } from 'react-stately';
import CalendarCell from './CalendarCell';

interface ICalendarGrid extends AriaCalendarGridProps {
   state: CalendarState | RangeCalendarState;
}

export default function CalendarGrid({ state, ...props }: ICalendarGrid) {
   const { locale } = useLocale();
   const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

   const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

   const weeks = Array.from(Array(weeksInMonth).keys());

   return (
      <table cellPadding="0" className="w-full" {...gridProps}>
         <thead {...headerProps}>
            <tr className="mb-4 flex w-full justify-around">
               {weekDays.map((day, index) => (
                  <th key={index}>{day}</th>
               ))}
            </tr>
         </thead>
         <tbody>
            {weeks.map((weekIndex, _, array) => (
               <tr
                  className={`flex w-full justify-around ${
                     weekIndex < array.length - 1 && 'mb-4'
                  }`}
                  key={weekIndex}
               >
                  {state
                     .getDatesInWeek(weekIndex)
                     .map((date, i) =>
                        date ? (
                           <CalendarCell
                              key={i}
                              state={state}
                              date={date}
                              index={i}
                           />
                        ) : (
                           <td key={i} />
                        ),
                     )}
               </tr>
            ))}
         </tbody>
      </table>
   );
}
