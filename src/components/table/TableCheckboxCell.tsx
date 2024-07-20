'use client';

import { useRef } from 'react';
import {
   AriaTableCellProps,
   useTableCell,
   useTableSelectionCheckbox,
} from 'react-aria';
import { TableState } from 'react-stately';
import Checkbox from '../shared/Checkbox';

interface ITableCheckboxCell {
   cell: AriaTableCellProps['node'];
   state: TableState<unknown>;
}

export default function TableCheckboxCell({ cell, state }: ITableCheckboxCell) {
   const ref = useRef(null);
   const { gridCellProps } = useTableCell({ node: cell }, state, ref);
   const { checkboxProps } = useTableSelectionCheckbox(
      {
         key: cell.parentKey ?? 0,
      },
      state,
   );

   return (
      <td {...gridCellProps} className="px-4" ref={ref}>
         <Checkbox {...checkboxProps} />
      </td>
   );
}
