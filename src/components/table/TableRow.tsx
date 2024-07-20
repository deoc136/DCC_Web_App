'use client';

import { TableState } from '@react-stately/table';
import { useRef } from 'react';
import {
   GridRowProps,
   mergeProps,
   useFocusRing,
   useTableRow,
} from 'react-aria';

interface ITableRow {
   state: TableState<unknown>;
   item: GridRowProps<unknown>['node'];
   children: React.ReactNode;
}

export default function TableRow({ state, item, children }: ITableRow) {
   const ref = useRef(null);
   const isSelected = state.selectionManager.isSelected(item.key);

   const { rowProps, isPressed, isDisabled } = useTableRow(
      { node: item },
      state,
      ref,
   );

   const { isFocusVisible, focusProps } = useFocusRing();

   return (
      <tr
         className={`${isPressed ? 'bg-disabled' : 'bg-white'} outline-none ${
            isFocusVisible ? 'shadow-inner' : 'shadow-none'
         } border-b border-on-background-disabled`}
         {...mergeProps(rowProps, focusProps)}
         ref={ref}
      >
         {children}
      </tr>
   );
}
