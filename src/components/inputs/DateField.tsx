'use client';

import { useRef } from 'react';
import { useDateSegment, useDateField, useLocale, DateValue } from 'react-aria';
import {
   DateFieldState,
   DateFieldStateOptions,
   DateSegment,
   useDateFieldState,
} from 'react-stately';
import { createCalendar } from '@internationalized/date';

type IDateField = Omit<
   DateFieldStateOptions<DateValue>,
   'locale' | 'createCalendar'
> & {
   squared?: boolean;
};

export default function DateField({ squared, ...props }: IDateField) {
   const { locale } = useLocale();
   const state = useDateFieldState({ ...props, locale, createCalendar });

   const ref = useRef(null);
   const { labelProps, fieldProps } = useDateField(props, state, ref);

   return (
      <div className="flex w-full flex-col">
         <span className="label" {...labelProps}>
            {props.label}
         </span>
         <div
            className={`placeholder:text-placeholder flex rounded-md rounded-r-none bg-foundation text-sm p-basic lg:text-base ${
               squared && 'rounded-l-none'
            }`}
            {...fieldProps}
            ref={ref}
         >
            {state.segments.map((segment, i) => (
               <DateSegment key={i} segment={segment} state={state} />
            ))}
            {state.validationState === 'invalid' && (
               <span aria-hidden="true">🚫</span>
            )}
         </div>
      </div>
   );
}

interface IDateSegment {
   segment: DateSegment;
   state: DateFieldState;
}

function DateSegment({ segment, state }: IDateSegment) {
   const ref = useRef(null);
   const { segmentProps } = useDateSegment(segment, state, ref);

   return (
      <div {...segmentProps} ref={ref}>
         {segment.text}
      </div>
   );
}
