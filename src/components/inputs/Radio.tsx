'use client';

import { ReactNode, createContext, useContext, useRef } from 'react';
import {
   AriaRadioGroupProps,
   AriaRadioProps,
   useRadio,
   useRadioGroup,
} from 'react-aria';
import { RadioGroupState, useRadioGroupState } from 'react-stately';

const RadioContext = createContext<RadioGroupState | null>(null);

interface IRadioGroup extends AriaRadioGroupProps {
   children: ReactNode;
}

export function RadioGroup(props: IRadioGroup) {
   const { children, label, description, errorMessage, validationState } =
      props;
   const state = useRadioGroupState(props);
   const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } =
      useRadioGroup(props, state);

   return (
      <div {...radioGroupProps}>
         <span {...labelProps}>{label}</span>
         <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
         {description && <div {...descriptionProps}>{description}</div>}
         {errorMessage && validationState === 'invalid' && (
            <div {...errorMessageProps}>{errorMessage}</div>
         )}
      </div>
   );
}

interface IRadio extends AriaRadioProps {
   className?: string;
   vanish?: boolean;
}

export function Radio({ className, vanish, ...props }: IRadio) {
   const { children } = props;
   const state = useContext(RadioContext);
   const ref = useRef(null);
   const { inputProps, isSelected, isDisabled } = useRadio(
      props,
      state as RadioGroupState,
      ref,
   );

   return (
      <label
         className={`flex items-center gap-2 lg:gap-4
         ${vanish ? !isSelected && 'opacity-50' : isSelected && 'bg-foundation'}
         ${!isDisabled && 'cursor-pointer'}
         ${className}
         `}
      >
         <input className="flex-none" {...inputProps} ref={ref} />
         {children}
      </label>
   );
}
