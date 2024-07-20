'use client';

import { useRef } from 'react';
import { DateValue, useDatePicker } from 'react-aria';
import { DatePickerStateOptions, useDatePickerState } from 'react-stately';
import DateField from './DateField';
import Button from '../shared/Button';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import Popover from '../shared/Popover';
import Dialog from '../modal/Dialog';
import Calendar from '../calendar/Calendar';

export default function DatePicker(props: DatePickerStateOptions<DateValue>) {
   const state = useDatePickerState(props);
   const ref = useRef(null);

   const {
      groupProps,
      labelProps,
      fieldProps,
      buttonProps,
      dialogProps,
      calendarProps,
      errorMessageProps,
   } = useDatePicker({ ...props, 'aria-label': 'date picker' }, state, ref);

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
            className={`grid w-full grid-cols-[1fr_auto] ${
               props.isDisabled && 'opacity-40'
            }`}
         >
            <DateField {...fieldProps} />
            <Button
               isDisabled={props.isDisabled}
               className="h-min rounded-l-none !bg-foundation !text-on-background-text"
               {...buttonProps}
            >
               <CalendarMonthRoundedIcon className="!text-xl" />
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
                     <Calendar {...calendarProps} />
                  </Dialog>
               </div>
            </Popover>
         )}
      </div>
   );
}
