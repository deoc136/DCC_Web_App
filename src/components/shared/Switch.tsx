import { useToggleState } from 'react-stately';
import {
   AriaSwitchProps,
   useFocusRing,
   useSwitch,
   VisuallyHidden,
} from 'react-aria';
import { ReactNode, useRef } from 'react';

interface ISwitch extends AriaSwitchProps {
   children?: ReactNode;
}

export default function Switch({ children, ...props }: ISwitch) {
   const state = useToggleState(props);
   const ref = useRef(null);
   const { inputProps } = useSwitch(props, state, ref);
   const { isFocusVisible, focusProps } = useFocusRing();

   return (
      <label
         className={`flex items-center ${
            props.isDisabled ? 'opacity-40' : 'cursor-pointer'
         }`}
      >
         <VisuallyHidden>
            <input {...inputProps} {...focusProps} ref={ref} />
         </VisuallyHidden>
         <svg
            width={40}
            height={24}
            aria-hidden="true"
            className="mr-1 scale-125"
         >
            <rect
               x={4}
               y={4}
               width={32}
               height={16}
               rx={8}
               className={`${
                  state.isSelected
                     ? 'fill-secondary'
                     : 'fill-on-background-disabled'
               }`}
            />
            <circle
               cx={state.isSelected ? 28 : 12}
               cy={12}
               r={5}
               className="fill-white"
            />
            {isFocusVisible && (
               <rect
                  x={1}
                  y={1}
                  width={38}
                  height={22}
                  rx={11}
                  className="fill-none stroke-secondary"
                  strokeWidth={2}
               />
            )}
         </svg>
         {children}
      </label>
   );
}
