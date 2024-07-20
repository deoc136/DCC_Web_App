'use client';

import { useRef } from 'react';
import { AriaModalOverlayProps, Overlay, useModalOverlay } from 'react-aria';
import { OverlayTriggerState } from 'react-stately';

export interface IModal extends AriaModalOverlayProps {
   children: React.ReactNode;
   state: OverlayTriggerState;
   className?: string;
}

export default function Modal({
   className,
   state,
   children,
   ...props
}: IModal) {
   const ref = useRef(null);

   const { modalProps, underlayProps } = useModalOverlay(props, state, ref);

   return (
      <Overlay>
         <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            {...underlayProps}
         >
            <div
               {...modalProps}
               ref={ref}
               className={`rounded-3xl bg-white ${className}`}
            >
               {children}
            </div>
         </div>
      </Overlay>
   );
}
