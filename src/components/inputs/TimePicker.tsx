'use client';

import ComboBox from './ComboBox';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Item } from 'react-stately';
import { AriaComboBoxProps } from 'react-aria';

interface ITimePicker extends Omit<AriaComboBoxProps<object>, 'children'> {
   start_hour?: number;
}

export default function TimePicker({
   start_hour,
   ...comboboxProps
}: ITimePicker) {
   const { hours } = useAppSelector(store => store.catalogues);

   return (
      <ComboBox {...comboboxProps}>
         {[...hours]
            .filter(hour => !start_hour || Number(hour.code) > start_hour)
            .sort((a, b) => Number(a.code) - Number(b.code))
            .map(hour => (
               <Item key={hour.code} textValue={hour.display_name}>
                  <div className="px-4 py-3 hover:bg-primary-100">
                     {hour.display_name}
                  </div>
               </Item>
            ))}
      </ComboBox>
   );
}
