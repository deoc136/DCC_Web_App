import { useEffect, useState } from 'react';
import { useAppSelector } from './redux-hooks';

export default function useDictionary() {
   const { dictionary, language } = useAppSelector(store => store.language);

   return { ...dictionary, language };
}
