'use client';

import { useRef } from 'react';
import { DateValue, useDateRangePicker } from 'react-aria';
import {
   DateRangePickerStateOptions,
   useDateRangePickerState,
} from 'react-stately';
import DateField from './DateField';
import Button from '../shared/Button';
import CalendarRoundedIcon from '@spectrum-icons/workflow/Calendar';
import Popover from '../shared/Popover';
import Dialog from '../modal/Dialog';
import Card from '../shared/cards/Card';
import RangeCalendar from '../calendar/RangeCalendar';
import { CalendarMonthRounded } from '@mui/icons-material';

export default function DateRangePicker(
   props: DateRangePickerStateOptions<DateValue>,
) {
   const state = useDateRangePickerState(props);
   const ref = useRef(null);

   const {
      groupProps,
      labelProps,
      buttonProps,
      dialogProps,
      calendarProps,
      startFieldProps,
      endFieldProps,
      errorMessageProps,
   } = useDateRangePicker(
      { ...props, 'aria-label': 'date range picker' },
      state,
      ref,
   );

   return (
      <div className="flex flex-col">
         {props.label && (
            <label
               className="mb-2 text-sm text-on-background-text label lg:text-base"
               {...labelProps}
            >
               {props.label}
            </label>
         )}
         <div
            {...groupProps}
            ref={ref}
            className="grid w-full grid-cols-[1fr_1fr_auto]"
         >
            <DateField {...startFieldProps} />
            <DateField squared {...endFieldProps} />
            <Button
               isDisabled={props.isDisabled}
               className="h-min rounded-l-none !bg-foundation !text-on-background-text"
               {...buttonProps}
            >
               <CalendarMonthRounded className="!text-xl" />
            </Button>
         </div>
         {props.errorMessage && (
            <div className="mt-4 text-error" {...errorMessageProps}>
               {props.errorMessage}
            </div>
         )}
         {state.isOpen && (
            <Popover state={state} triggerRef={ref}>
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 lg:bg-transparent">
                  <Dialog
                     className="w-[26rem] max-w-[90vw] animate-appear rounded-xl p-0"
                     {...dialogProps}
                  >
                     <RangeCalendar {...calendarProps} />
                  </Dialog>
               </div>
            </Popover>
         )}
      </div>
   );
}
