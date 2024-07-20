'use client';

import { TableState } from '@react-stately/table';
import { useRef } from 'react';
import {
   AriaTableColumnHeaderProps,
   mergeProps,
   useFocusRing,
   useTableColumnHeader,
} from 'react-aria';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';

import SwitchLeftRoundedIcon from '@mui/icons-material/SwitchLeftRounded';
import SwitchRightRoundedIcon from '@mui/icons-material/SwitchRightRounded';

interface ITableColumnHeader {
   column: AriaTableColumnHeaderProps<any>['node'];
   state: TableState<unknown>;
}

export default function TableColumnHeader({
   column,
   state,
}: ITableColumnHeader) {
   const ref = useRef(null);

   const { columnHeaderProps } = useTableColumnHeader(
      { node: column },
      state,
      ref,
   );

   const { isFocusVisible, focusProps } = useFocusRing();

   const arrowRoundedIcon =
      state.sortDescriptor?.direction === 'ascending' ? '▲' : '▼';

   const isAscending = state.sortDescriptor?.direction === 'ascending';

   return (
      <th
         className={`
         bg-foundation first:rounded-tl-2xl last:rounded-tr-2xl
         ${
            column.colspan ?? 0 > 1 ? 'text-center' : 'text-left'
         } outline-none p-basic ${
            isFocusVisible ? 'shadow-inner shadow-slate-500' : 'shadow-none'
         }
         cursor-default
         `}
         {...mergeProps(columnHeaderProps, focusProps)}
         colSpan={column.colspan}
         ref={ref}
      >
         <span className="flex">
            {column.rendered}
            {column.props?.allowsSorting && (
               <span
                  aria-hidden="true"
                  className={`px-1 ${
                     state.sortDescriptor?.column === column.key
                        ? 'visible'
                        : 'invisible'
                  }`}
               >
                  {isAscending ? (
                     <SwitchLeftRoundedIcon className="rotate-90" />
                  ) : (
                     <SwitchRightRoundedIcon className="rotate-90" />
                  )}
               </span>
            )}
         </span>
      </th>
   );
}
