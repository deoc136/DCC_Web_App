import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { HiddenSelect, useSelect } from 'react-aria';
import { SelectStateOptions, useSelectState } from 'react-stately';
import Button from '../shared/Button';
import Popover from '../shared/Popover';
import { ListBox } from '../shared/ListBox';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface ISelect extends SelectStateOptions<object> {
   name?: string;
   className?: string;
   triggerContent?: ReactNode;
   staticWidth?: boolean;
}

export function Select(props: ISelect) {
   const dic = useDictionary();

   const state = useSelectState(props);

   const ref = useRef<HTMLButtonElement>(null);

   const { labelProps, triggerProps, valueProps, menuProps } = useSelect(
      { ...props, 'aria-label': 'select' },
      state,
      ref,
   );

   const [buttonWidth, setButtonWidth] = useState(0);

   useEffect(() => {
      if (ref.current?.offsetWidth) setButtonWidth(ref.current.offsetWidth);
   }, [ref.current?.offsetWidth]);

   return (
      <div aria-label={`${props.triggerContent} selector`}>
         {props.label && (
            <div className="mb-2" {...labelProps}>
               {props.label}
            </div>
         )}
         <HiddenSelect
            isDisabled={props.isDisabled}
            state={state}
            triggerRef={ref}
            label={props.label}
            name={props.name}
         />
         <Button
            className={`flex items-center justify-center gap-2 ${props.className}`}
            buttonRef={ref as any}
            {...triggerProps}
         >
            <span className="w-max truncate" {...valueProps}>
               {props.triggerContent !== undefined
                  ? props.triggerContent
                  : state.selectedItem
                  ? state.selectedItem.textValue
                  : dic.texts.various.select_an_option}
            </span>
            <span aria-hidden="true">
               {state.isOpen ? (
                  <ChevronLeftRounded fontSize="medium" className="rotate-90" />
               ) : (
                  <ChevronRightRounded
                     fontSize="medium"
                     className="rotate-90"
                  />
               )}
            </span>
         </Button>
         {state.isOpen && (
            <Popover
               offset={8}
               state={state}
               triggerRef={ref}
               placement="bottom start"
            >
               <ListBox
                  width={props.staticWidth ? buttonWidth : undefined}
                  className="rounded-lg shadow-xl"
                  {...menuProps}
                  state={state}
               />
            </Popover>
         )}
      </div>
   );
}
