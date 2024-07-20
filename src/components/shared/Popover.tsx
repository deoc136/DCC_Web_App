'use client';

import { useRef } from 'react';
import {
   AriaPopoverProps,
   DismissButton,
   Overlay,
   usePopover,
} from 'react-aria';
import { OverlayTriggerState } from 'react-stately';

interface IPopover extends Omit<AriaPopoverProps, 'popoverRef'> {
   children: React.ReactNode;
   state: OverlayTriggerState;
   popoverRef?: React.RefObject<HTMLDivElement>;
}

export default function Popover(props: IPopover) {
   const ref = useRef<HTMLDivElement>(null);
   const { popoverRef = ref, state, children, isNonModal } = props;

   const { popoverProps, underlayProps } = usePopover(
      {
         ...props,
         popoverRef,
      },
      state,
   );

   return (
      <Overlay>
         {!isNonModal && <div {...underlayProps} className="fixed inset-0" />}
         <div {...popoverProps} ref={popoverRef}>
            {children}
            <DismissButton onDismiss={state.close} />
         </div>
      </Overlay>
   );
}
