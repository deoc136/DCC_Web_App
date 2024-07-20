'use client';

import { useListBoxSection, useListBox, useOption } from 'react-aria';
import {
   ListProps,
   ListState,
   Node,
   SelectState,
   useListState,
} from 'react-stately';
import { useRef } from 'react';

interface IListBox extends ListProps<object> {
   state?: SelectState<object>;
   className?: string;
   listBoxRef?: React.RefObject<HTMLUListElement>;
   width?: number;
}

export function ListBox({ className, width, ...props }: IListBox) {
   const newState = useListState(props);

   const ref = useRef(null);

   const { listBoxRef = ref, state = newState } = props;

   const { listBoxProps } = useListBox(props, state, listBoxRef ?? ref);

   return (
      <ul
         {...listBoxProps}
         style={{
            width,
         }}
         ref={listBoxRef}
         className={`max-h-[40vh] w-full !min-w-[12rem] overflow-y-auto rounded bg-white ${className}`}
      >
         {Array.from(state.collection).map(item =>
            item.type === 'section' ? (
               <ListBoxSection key={item.key} section={item} state={state} />
            ) : (
               <Option key={item.key} item={item} state={state} />
            ),
         )}
      </ul>
   );
}

interface IOption {
   item: Node<object>;
   state: ListState<object>;
}

function Option({ item, state }: IOption) {
   const ref = useRef(null);
   const { optionProps, isSelected, isDisabled, isFocused } = useOption(
      { key: item.key },
      state,
      ref,
   );

   return (
      <li
         {...optionProps}
         ref={ref}
         className={`
            relative rounded
            ${isSelected ? '!bg-primary-300' : 'hover:bg-primary-200'}
            ${isFocused && 'z-10 rounded-sm ring-2 ring-black'}
            ${isDisabled ? 'bg-disabled' : 'cursor-pointer'}
         `}
      >
         {item.rendered}
      </li>
   );
}

interface IListBoxSection {
   section: Node<object>;
   state: ListState<object>;
}

function ListBoxSection({ section, state }: IListBoxSection) {
   const { itemProps, headingProps, groupProps } = useListBoxSection({
      heading: section.rendered,
      'aria-label': section['aria-label'],
   });

   return (
      <>
         <li {...itemProps} className="pt-2">
            {section.rendered && (
               <span
                  {...headingProps}
                  className="my-4 text-xs font-bold uppercase text-gray-500"
               >
                  {section.rendered}
               </span>
            )}
            <ul {...groupProps}>
               {Array.from(section.childNodes).map(node => (
                  <Option key={node.key} item={node} state={state} />
               ))}
            </ul>
         </li>
      </>
   );
}
