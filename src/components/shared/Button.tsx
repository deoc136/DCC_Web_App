'use client';

import { useButton, AriaButtonProps } from 'react-aria';
import { MutableRefObject, useRef } from 'react';
import Link from 'next/link';
import { GlobalRoute } from '@/lib/routes';

export enum Variant {
   primary,
   secondary,
   outlined,
}

type IButton = AriaButtonProps & {
   className?: string;
   buttonRef?: MutableRefObject<null>;
   variant?: Variant;
} & ({ href: GlobalRoute } | {});

export default function Button({
   className,
   buttonRef,
   href,
   ...props
}: IButton) {
   const { children, variant = Variant.primary, isDisabled } = props;

   const ref = useRef(null);

   const { buttonProps } = useButton(props, buttonRef ?? ref);

   const classes = `w-full rounded-md  font-semibold transition p-basic disabled:opacity-20 disabled:hover:brightness-100 ${className} ${
      variant === Variant.primary
         ? 'bg-secondary-500 text-white'
         : variant === Variant.outlined
         ? 'border border-secondary bg-transparent text-secondary'
         : 'bg-light-gray-background text-black'
   }
   ${
      !isDisabled &&
      'hover:translate-y-[-.1rem] hover:shadow hover:brightness-90'
   }`;

   return href && !isDisabled ? (
      <Link
         ref={buttonRef ?? ref}
         className={`${classes} text-center text-sm sm:text-base`}
         href={href}
         {...(buttonProps as any)}
      >
         {children}
      </Link>
   ) : (
      <button
         ref={buttonRef ?? ref}
         className={`${classes} text-sm sm:text-base`}
         {...buttonProps}
      >
         {children}
      </button>
   );
}
