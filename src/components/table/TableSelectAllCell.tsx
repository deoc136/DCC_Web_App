'use client';

import { useId, useRef } from 'react';
import {
   AriaTableColumnHeaderProps,
   VisuallyHidden,
   useTableColumnHeader,
   useTableSelectAllCheckbox,
} from 'react-aria';
import { TableState } from 'react-stately';
import Checkbox from '../shared/Checkbox';

interface ITableSelectAllCell {
   column: AriaTableColumnHeaderProps<unknown>['node'];
   state: TableState<unknown>;
}

export default function TableSelectAllCell({
   column,
   state,
}: ITableSelectAllCell) {
   const ref = useRef(null);
   const { columnHeaderProps } = useTableColumnHeader(
      {
         node: column,
      },
      state,
      ref,
   );
   const { checkboxProps } = useTableSelectAllCheckbox(state);

   return (
      <th
         {...columnHeaderProps}
         className="rounded-tl-2xl bg-foundation px-4"
         ref={ref}
      >
         {state.selectionManager.selectionMode === 'single' ? (
            <VisuallyHidden>{checkboxProps['aria-label']}</VisuallyHidden>
         ) : (
            <Checkbox {...checkboxProps} />
         )}
      </th>
   );
}
