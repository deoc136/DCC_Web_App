'use client';

import { useOverlayTrigger } from 'react-aria';
import {
   OverlayTriggerProps,
   OverlayTriggerState,
   useOverlayTriggerState,
} from 'react-stately';
import Modal from './Modal';
import { cloneElement } from 'react';

export interface IModalTrigger extends OverlayTriggerProps {
   className?: string;
   children: (close: OverlayTriggerState['close']) => JSX.Element;
}

export default function ModalTrigger({
   className,
   children,
   ...props
}: IModalTrigger) {
   const state = useOverlayTriggerState(props);

   const { overlayProps } = useOverlayTrigger({ type: 'dialog' }, state);

   return (
      <>
         {state.isOpen && (
            <Modal className={className} {...props} state={state}>
               {cloneElement(children(state.close), overlayProps)}
            </Modal>
         )}
      </>
   );
}
