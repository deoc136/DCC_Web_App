'use client';

import { TableState } from '@react-stately/table';
import { useRef } from 'react';
import { GridRowProps, useTableHeaderRow } from 'react-aria';

interface ITableHeaderRow {
   item: GridRowProps<unknown>['node'];
   state: TableState<unknown>;
   children: React.ReactNode;
}

export default function TableHeaderRow({
   item,
   state,
   children,
}: ITableHeaderRow) {
   const ref = useRef(null);
   const { rowProps } = useTableHeaderRow({ node: item }, state, ref);

   return (
      <tr {...rowProps} ref={ref}>
         {children}
      </tr>
   );
}
