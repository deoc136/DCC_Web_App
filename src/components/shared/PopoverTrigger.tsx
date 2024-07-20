'use client';

import { useRef, DetailedReactHTMLElement, cloneElement } from 'react';
import { useOverlayTrigger } from 'react-aria';
import { OverlayTriggerProps, useOverlayTriggerState } from 'react-stately';
import Popover from './Popover';
import Button from './Button';

interface IPopoverTrigger extends OverlayTriggerProps {
   children: any;
   trigger: React.ReactNode;
   isNonModal?: boolean;
   className?: string;
   isDisabled?: boolean;
}

export default function PopoverTrigger({
   children,
   trigger,
   isNonModal,
   className,
   isDisabled,
   ...props
}: IPopoverTrigger) {
   const ref = useRef(null);
   const state = useOverlayTriggerState(props);

   const { triggerProps, overlayProps } = useOverlayTrigger(
      { type: 'dialog' },
      state,
      ref,
   );

   return (
      <>
         <Button
            isDisabled={isDisabled}
            className={`w-max rounded-md bg-transparent !p-0 text-black ${className}`}
            {...triggerProps}
            buttonRef={ref}
            aria-label="open button"
         >
            {trigger}
         </Button>

         {state.isOpen && (
            <Popover
               isNonModal={isNonModal}
               {...props}
               triggerRef={ref}
               state={state}
            >
               {cloneElement(children, overlayProps)}
            </Popover>
         )}
      </>
   );
}
