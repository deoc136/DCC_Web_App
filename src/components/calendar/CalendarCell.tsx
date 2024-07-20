'use client';

import { getDayOfWeek, isSameDay } from '@internationalized/date';
import { useEffect, useRef } from 'react';
import { AriaCalendarCellProps, useCalendarCell, useLocale } from 'react-aria';
import { CalendarState, RangeCalendarState } from 'react-stately';

interface ICalendarCell {
   date: AriaCalendarCellProps['date'];
   state: CalendarState | RangeCalendarState;
   index: number;
}

export default function CalendarCell({ date, state, index }: ICalendarCell) {
   const { locale } = useLocale();

   const ref = useRef(null);
   const {
      isInvalid,
      cellProps,
      buttonProps,
      isSelected,
      isDisabled,
      isUnavailable,
      formattedDate,
   } = useCalendarCell({ date }, state, ref);
   const stateTypedAsRange = state as RangeCalendarState;

   const isSelectionStart = stateTypedAsRange.highlightedRange
      ? isSameDay(date, stateTypedAsRange.highlightedRange?.start)
      : isSelected;
   const isSelectionEnd = stateTypedAsRange.highlightedRange
      ? isSameDay(date, stateTypedAsRange.highlightedRange?.end)
      : isSelected;

   const dayOfWeek = getDayOfWeek(date, locale);
   const isRoundedLeft =
      isSelected &&
      (isSelectionStart || dayOfWeek === 0 || (date.day === 1 && !isInvalid));
   const isRoundedRight =
      isSelected &&
      (isSelectionEnd ||
         dayOfWeek === 6 ||
         (date.day === date.calendar.getDaysInMonth(date) && !isInvalid));

   return (
      <td className="w-full" {...cellProps}>
         <div className="relative">
            <div
               className={` 
               absolute inset-0 z-0 
             ${
                isSelected &&
                !isDisabled &&
                !isUnavailable &&
                'bg-foundation-blue'
             }
             ${isSelectionStart && 'left-1/2 w-2/3'}
             ${isSelectionEnd && 'right-1/2 w-2/3'}
             ${isSelectionStart && isSelectionEnd && 'hidden'}
             ${isInvalid && 'bg-red-200'}
             ${isRoundedRight && 'rounded-r-full'}
             ${isRoundedLeft && 'rounded-l-full'}
          `}
            />
            <div
               {...buttonProps}
               ref={ref}
               className={`
               relative z-10 m-auto w-10 rounded-full p-1 text-center
               ${
                  !isDisabled &&
                  !isUnavailable &&
                  isSelected &&
                  (isSelectionStart || isSelectionEnd) &&
                  '!bg-secondary font-semibold text-white hover:!bg-secondary-600'
               }
               ${
                  isDisabled || isUnavailable
                     ? `cursor-default text-black-disabled ${
                          isInvalid && 'text-dark-gray'
                       }`
                     : 'hover:bg-secondary-100'
               }
            `}
            >
               {formattedDate}
            </div>
         </div>
      </td>
   );
}
