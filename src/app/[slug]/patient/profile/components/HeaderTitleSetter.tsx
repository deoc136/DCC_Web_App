'use client';

import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import useDictionary from '@/lib/hooks/useDictionary';
import { useEffect } from 'react';

interface IHeaderTitleSetter {}

export default function HeaderTitleSetter({}: IHeaderTitleSetter) {
   const dic = useDictionary();

   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: null,
            value: dic.texts.flows.my_profile,
         }),
      );
   }, [dispatch, dic]);

   return true;
}
