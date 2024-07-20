'use client';

import { useRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';

interface IMonthButton extends AriaButtonProps {
   className?: string;
}

export default function MonthButton({ className, ...props }: IMonthButton) {
   const { children } = props;

   const ref = useRef<HTMLButtonElement>(null);

   const { buttonProps } = useButton(props, ref);

   return (
      <button
         className={`active:bg-dark-gray disabled:bg-middle-gray disabled:active:bg-middle-gray rounded squared active:text-secondary-600 disabled:opacity-40 ${className}`}
         {...buttonProps}
      >
         {children}
      </button>
   );
}
