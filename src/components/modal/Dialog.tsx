'use client';

import { useRef } from 'react';
import { AriaDialogProps, useDialog } from 'react-aria';

export interface IDialog extends AriaDialogProps {
   children: React.ReactNode;
   className?: string;
}

export default function Dialog({ className, children, ...props }: IDialog) {
   const ref = useRef(null);
   const { dialogProps } = useDialog(props, ref);

   return (
      <div
         {...dialogProps}
         ref={ref}
         className={`bg-white ${className} max-h-[80vh] overflow-auto shadow-md`}
      >
         {children}
      </div>
   );
}
