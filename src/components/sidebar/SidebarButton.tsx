'use client';

import { GlobalRoute } from '@/lib/routes';
import Link from 'next/link';
import { useRef } from 'react';
import { AriaButtonProps, useButton } from 'react-aria';

interface ISidebarButton extends AriaButtonProps<'button'> {
   className?: string;
   children: React.ReactNode;
   role?: string;
   href?: GlobalRoute;
}

export default function SidebarButton({
   className,
   role,
   href,
   ...props
}: ISidebarButton) {
   const { children } = props;

   const ref = useRef(null);

   const { buttonProps } = useButton(props, ref);

   const classes = `flex w-full items-center justify-between p-3 ${className}`;

   return href ? (
      <Link
         ref={ref}
         role={role}
         className={classes}
         href={href}
         {...(buttonProps as any)}
      >
         {children}
      </Link>
   ) : (
      <button role={role} ref={ref} className={classes} {...buttonProps}>
         {children}
      </button>
   );
}
