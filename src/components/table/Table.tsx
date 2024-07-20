'use client';

import { TableStateProps, useTableState } from '@react-stately/table';
import { useRef } from 'react';
import { AriaTableProps, useTable } from 'react-aria';
import TableRowGroup from './TableRowGroup';
import TableHeaderRow from './TableHeaderRow';
import TableColumnHeader from './TableColumnHeader';
import { Node } from 'react-stately';
import TableRow from './TableRow';
import TableCell from './TableCell';
import TableSelectAllCell from './TableSelectAllCell';
import TableCheckboxCell from './TableCheckboxCell';

interface ITable extends AriaTableProps<object>, TableStateProps<object> {
   className: string;
}

type childNodes = Iterable<Node<object>> | undefined;

export default function Table(props: ITable) {
   const { selectionMode, selectionBehavior } = props;
   const state = useTableState({
      ...props,
      showSelectionCheckboxes:
         selectionMode === 'multiple' && selectionBehavior !== 'replace',
   });

   const ref = useRef(null);

   const { collection } = state;
   const { gridProps } = useTable(
      { ...props, 'aria-label': props['aria-label'] ?? 'table' },
      state,
      ref,
   );

   return (
      <table
         {...gridProps}
         ref={ref}
         className={` border-collapse ${props.className}`}
      >
         <TableRowGroup type="thead">
            {collection.headerRows.map(headerRow => (
               <TableHeaderRow
                  key={headerRow.key}
                  item={headerRow}
                  state={state}
               >
                  {Array.from((headerRow.childNodes as childNodes) ?? []).map(
                     column =>
                        column.props?.isSelectionCell && false ? (
                           <TableSelectAllCell
                              key={column.key}
                              column={column}
                              state={state}
                           />
                        ) : (
                           <TableColumnHeader
                              key={column.key}
                              column={column}
                              state={state}
                           />
                        ),
                  )}
               </TableHeaderRow>
            ))}
         </TableRowGroup>
         <TableRowGroup type="tbody">
            {Array.from((collection.body.childNodes as childNodes) ?? []).map(
               row => (
                  <TableRow key={row.key} item={row} state={state}>
                     {Array.from((row.childNodes as childNodes) ?? []).map(
                        cell =>
                           cell.props?.isSelectionCell ? (
                              <TableCheckboxCell
                                 key={cell.key}
                                 cell={cell}
                                 state={state}
                              />
                           ) : (
                              <TableCell
                                 key={cell.key}
                                 cell={cell}
                                 state={state}
                              />
                           ),
                     )}
                  </TableRow>
               ),
            )}
         </TableRowGroup>
      </table>
   );
}
