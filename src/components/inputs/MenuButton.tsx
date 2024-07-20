import type { MenuTriggerProps, Node, TreeState } from 'react-stately';
import {
   AriaMenuProps,
   mergeProps,
   useLabel,
   useMenu,
   useMenuItem,
   useMenuSection,
   useMenuTrigger,
   useSeparator,
} from 'react-aria';
import { useMenuTriggerState, useTreeState } from 'react-stately';
import { useEffect, useRef, useState } from 'react';
import Button from '../shared/Button';
import Popover from '../shared/Popover';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import Checkbox from '../shared/Checkbox';

interface MenuButtonProps extends AriaMenuProps<object>, MenuTriggerProps {
   label?: string;
   content: string;
   className?: string;
}

export default function MenuButton({
   content,
   className,
   ...props
}: MenuButtonProps) {
   const state = useMenuTriggerState(props);

   const ref = useRef<HTMLButtonElement>(null);
   const { menuTriggerProps, menuProps } = useMenuTrigger<object>(
      {},
      state,
      ref,
   );

   const { labelProps, fieldProps } = useLabel(props);

   const [menuWidth, setMenuWidth] = useState(0);

   useEffect(() => {
      ref.current?.offsetWidth && setMenuWidth(ref.current.offsetWidth);
   }, [ref.current?.offsetWidth]);

   return (
      <>
         <div className="flex flex-col">
            {props.label && (
               <label
                  className="mb-2 text-on-background-text label"
                  {...labelProps}
               >
                  {props.label}
               </label>
            )}
            <Button
               {...mergeProps(menuTriggerProps, fieldProps)}
               //@ts-ignore
               buttonRef={ref}
               className={`!text-placeholder flex w-full items-center justify-between rounded-md !bg-foundation !font-medium !text-on-background-text p-basic ${className}`}
            >
               {content}
               {state.isOpen ? (
                  <ChevronLeft className="rotate-90" />
               ) : (
                  <ChevronRight className="rotate-90" />
               )}
            </Button>
         </div>
         {state.isOpen && (
            <Popover state={state} triggerRef={ref} placement="bottom start">
               <Menu {...props} {...menuProps} width={menuWidth} />
            </Popover>
         )}
      </>
   );
}

interface IMenu extends AriaMenuProps<object> {
   width: number;
   label?: string;
}

function Menu({ width, ...props }: IMenu) {
   const state = useTreeState(props);

   const ref = useRef(null);
   const { menuProps } = useMenu(props, state, ref);

   return (
      <>
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:hidden md:bg-transparent">
            <div className="fixed bottom-0 left-0 right-0 h-max w-screen animate-slide-y rounded-t-xl bg-white">
               <p className="relative z-20 p-5 font-semibold text-on-background-text shadow-md">
                  {props.label}
               </p>
               <ul
                  {...menuProps}
                  ref={ref}
                  className="max-h-[40vh] overflow-auto"
               >
                  {[...state.collection].map(item =>
                     item.type === 'section' ? (
                        <MenuSection
                           key={item.key}
                           section={item}
                           state={state}
                        />
                     ) : (
                        <MenuItem key={item.key} item={item} state={state} />
                     ),
                  )}
               </ul>
            </div>{' '}
         </div>
         <ul
            {...menuProps}
            ref={ref}
            className="hidden max-h-[40vh] overflow-auto rounded-xl bg-white p-4 shadow-xl md:block"
            style={{ width }}
         >
            {[...state.collection].map(item =>
               item.type === 'section' ? (
                  <MenuSection key={item.key} section={item} state={state} />
               ) : (
                  <MenuItem key={item.key} item={item} state={state} />
               ),
            )}
         </ul>
      </>
   );
}

interface IMenuSection {
   section: Node<object>;
   state: TreeState<object>;
}

function MenuSection({ section, state }: IMenuSection) {
   const { itemProps, groupProps } = useMenuSection({
      heading: section.rendered,
      'aria-label': section['aria-label'],
   });

   const { separatorProps } = useSeparator({
      elementType: 'li',
   });

   return (
      <>
         {section.key !== state.collection.getFirstKey() && (
            <li
               {...separatorProps}
               className="mx-2 mb-1 mt-1 border-t border-gray-300"
            />
         )}
         <li {...itemProps}>
            <ul {...groupProps}>
               {[...section.childNodes].map(node => (
                  <MenuItem key={node.key} item={node} state={state} />
               ))}
            </ul>
         </li>
      </>
   );
}

interface IMenuItem {
   item: Node<object>;
   state: TreeState<object>;
}

function MenuItem({ item, state }: IMenuItem) {
   const ref = useRef(null);
   const { menuItemProps, isSelected } = useMenuItem(
      {
         key: item.key,
      },
      state,
      ref,
   );

   return (
      <li
         {...menuItemProps}
         ref={ref}
         className="relative mx-1 flex cursor-default select-none items-center gap-4 rounded p-4 hover:bg-primary-400"
      >
         <Checkbox aria-label="week day selection" isSelected={isSelected} />
         {item.rendered}
      </li>
   );
}
