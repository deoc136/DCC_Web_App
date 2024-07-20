'use client';

import { ToggleStateOptions } from '@react-stately/toggle';
import { useRef } from 'react';
import { useCheckbox } from 'react-aria';
import { useToggleState } from 'react-stately';

interface ICheckbox extends ToggleStateOptions {
   className?: string;
   children?: React.ReactNode;
   'aria-label'?: string;
}

export default function Checkbox({ className, children, ...props }: ICheckbox) {
   const state = useToggleState(props);
   const ref = useRef(null);
   const { inputProps } = useCheckbox(props, state, ref);

   return (
      <label
         className={`${className} flex items-center gap-2 text-on-background-text label`}
      >
         <input {...inputProps} ref={ref} />
         {children}
      </label>
   );
}
