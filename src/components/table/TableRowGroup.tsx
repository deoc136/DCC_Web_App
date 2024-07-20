'use client';

import { useTableRowGroup } from 'react-aria';

interface ITableRowGroup {
   type: any;
   children: React.ReactNode;
}

export default function TableRowGroup({
   type: Element,
   children,
}: ITableRowGroup) {
   const { rowGroupProps } = useTableRowGroup();

   return <Element {...rowGroupProps}>{children}</Element>;
}
