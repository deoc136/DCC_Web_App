'use client';

import { useRef } from 'react';
import {
   AriaTableCellProps,
   mergeProps,
   useFocusRing,
   useTableCell,
} from 'react-aria';
import { TableState } from 'react-stately';

interface ITableCell {
   cell: AriaTableCellProps['node'];
   state: TableState<unknown>;
}

export default function TableCell({ cell, state }: ITableCell) {
   const ref = useRef(null);
   const { gridCellProps } = useTableCell({ node: cell }, state, ref);
   const { isFocusVisible, focusProps } = useFocusRing();

   return (
      <td
         className={`outline-none p-basic ${
            isFocusVisible ? 'shadow-inner' : 'shadow-none'
         } cursor-default`}
         {...mergeProps(gridCellProps, focusProps)}
         ref={ref}
      >
         {cell.rendered}
      </td>
   );
}
