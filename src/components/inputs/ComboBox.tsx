'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { AriaComboBoxProps, useComboBox, useFilter } from 'react-aria';
import { useComboBoxState } from 'react-stately';
import Button from '../shared/Button';
import Popover from '../shared/Popover';
import { ListBox } from '../shared/ListBox';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMore';

interface IComboBox extends AriaComboBoxProps<object> {}

export default function ComboBox(props: IComboBox) {
   const { contains } = useFilter({ sensitivity: 'base' });
   const state = useComboBoxState({ ...props, defaultFilter: contains });

   const buttonRef = useRef(null);
   const inputRef = useRef<HTMLInputElement>(null);
   const listBoxRef = useRef<HTMLUListElement>(null);
   const popoverRef = useRef(null);

   const {
      buttonProps,
      inputProps,
      listBoxProps,
      labelProps,
      errorMessageProps,
   } = useComboBox(
      {
         ...props,
         inputRef,
         buttonRef,
         listBoxRef,
         popoverRef,
      },
      state,
   );

   const [inputWidth, setInputWidth] = useState(0);

   useEffect(() => {
      if (inputRef.current?.offsetWidth)
         setInputWidth(inputRef.current.offsetWidth);
   }, [inputRef.current?.offsetWidth]);

   return (
      <div className="flex flex-col">
         {props.label && (
            <label
               className="mb-2 text-sm text-on-background-text label lg:text-base"
               {...labelProps}
            >
               {props.label}
            </label>
         )}
         <div className="grid w-full grid-cols-[1fr_auto]">
            <input
               {...inputProps}
               ref={inputRef}
               className={`placeholder:text-placeholder w-full rounded-l-md bg-foundation text-sm p-basic lg:text-base ${
                  props.isDisabled && 'opacity-40'
               }`}
            />
            <Button
               className={`h-min !rounded-l-none !bg-foundation !text-on-background-text ${
                  props.isDisabled && 'opacity-40'
               }`}
               {...buttonProps}
               buttonRef={buttonRef}
            >
               {state.isOpen ? (
                  <ExpandLessRoundedIcon />
               ) : (
                  <ExpandMoreRoundedIcon />
               )}
            </Button>
         </div>
         {props.errorMessage && (
            <div className="mt-4 text-error" {...errorMessageProps}>
               {props.errorMessage as ReactNode}
            </div>
         )}
         {state.isOpen && (
            <Popover
               offset={8}
               state={state}
               triggerRef={inputRef}
               popoverRef={popoverRef}
               placement="bottom start"
            >
               <ListBox
                  {...listBoxProps}
                  listBoxRef={listBoxRef}
                  state={state}
                  width={inputWidth}
                  className="hidden w-full gap-4 rounded-xl p-4 shadow-xl md:grid"
               />{' '}
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:hidden md:bg-transparent">
                  <div className="fixed bottom-0 left-0 right-0 h-max w-screen animate-slide-y rounded-t-xl bg-white">
                     <p className="relative z-20 p-5 font-semibold text-on-background-text shadow-md">
                        {props.label}
                     </p>
                     <ListBox
                        {...listBoxProps}
                        listBoxRef={listBoxRef}
                        state={state}
                        className="relative z-10 w-full gap-4 p-4 md:grid"
                     />
                  </div>{' '}
               </div>
            </Popover>
         )}
      </div>
   );
}
