import { useRef } from 'react';
import { AriaTabPanelProps, useTab, useTabList, useTabPanel } from 'react-aria';
import {
   useTabListState,
   TabListProps,
   TabListState,
   Node,
} from 'react-stately';

interface ITabs extends TabListProps<object> {
   noTabPanel?: boolean;
   className?: string;
}

export function Tabs({ className, noTabPanel = false, ...props }: ITabs) {
   const state = useTabListState(props);
   const ref = useRef(null);
   const { tabListProps } = useTabList(props, state, ref);

   return (
      <div>
         <div
            {...tabListProps}
            className={`flex w-full flex-wrap items-center gap-5 text-sm lg:text-base ${className}`}
            ref={ref}
         >
            {[...state.collection].map(item => (
               <Tab key={item.key} item={item} state={state} />
            ))}
         </div>
         {!noTabPanel && (
            <TabPanel key={state.selectedItem?.key} state={state} />
         )}
      </div>
   );
}

interface ITab {
   item: Node<object>;
   state: TabListState<object>;
}

function Tab({ item, state }: ITab) {
   const { key, rendered } = item;
   const ref = useRef(null);
   const { tabProps, isSelected } = useTab({ key }, state, ref);

   return (
      <div
         className={`flex h-full cursor-pointer items-center justify-center px-2 pb-1 ${
            isSelected
               ? 'border-b-2 border-secondary font-semibold text-secondary'
               : 'text-on-background-disabled'
         }`}
         {...tabProps}
         ref={ref}
      >
         {rendered}
      </div>
   );
}

interface ITabPanel extends AriaTabPanelProps {
   state: TabListState<object>;
}

function TabPanel({ state, ...props }: ITabPanel) {
   const ref = useRef(null);
   const { tabPanelProps } = useTabPanel(props, state, ref);

   return (
      <div {...tabPanelProps} ref={ref}>
         {state.selectedItem?.props.children}
      </div>
   );
}
