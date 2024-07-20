import { useRef } from 'react';
import { TimeValue, AriaTimeFieldProps } from 'react-aria';
import { useDateSegment, useLocale, useTimeField } from 'react-aria';
import { DateFieldState, DateSegment, useTimeFieldState } from 'react-stately';

interface MyTimeFieldProps extends AriaTimeFieldProps<TimeValue> {
   label?: string;
   description?: string;
   errorMessage?: string;
}

export function TimeField({ errorMessage, ...props }: MyTimeFieldProps) {
   const { locale } = useLocale();
   const state = useTimeFieldState({
      ...props,
      locale,
   });

   const ref = useRef(null);
   const { labelProps, fieldProps, errorMessageProps } = useTimeField(
      props,
      state,
      ref,
   );

   return (
      <div className={`${props.isDisabled && 'opacity-40'} grid`}>
         {props.label && (
            <span
               className="mb-2 text-on-background-text label"
               {...labelProps}
            >
               {props.label}
            </span>
         )}
         <div
            {...fieldProps}
            ref={ref}
            className="placeholder:text-placeholder flex rounded-md bg-foundation p-basic"
         >
            {state.segments.map((segment, i) => (
               <DateSegment key={i} segment={segment} state={state} />
            ))}
            {state.validationState === 'invalid' && (
               <span aria-hidden="true">🚫</span>
            )}
         </div>
         {errorMessage && (
            <div className="mt-4 text-error" {...errorMessageProps}>
               {errorMessage}
            </div>
         )}
      </div>
   );
}

interface IDateSegment {
   state: DateFieldState;
   segment: DateSegment;
}

function DateSegment({ segment, state }: IDateSegment) {
   const ref = useRef(null);
   const { segmentProps } = useDateSegment(segment, state, ref);

   return (
      <div
         {...segmentProps}
         ref={ref}
         className={`segment ${segment.isPlaceholder ? 'placeholder' : ''}`}
      >
         {segment.text}
      </div>
   );
}
