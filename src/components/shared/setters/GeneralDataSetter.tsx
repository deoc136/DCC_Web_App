'use client';

import { changeCatalogues } from '@/lib/features/catalogues/catalogues_slice';
import { changeCurrencies } from '@/lib/features/currencies/currencies_slice';
import { useAppDispatch } from '@/lib/hooks/redux-hooks';
import { getCatalogByType } from '@/services/catalog';
import { Catalog, CatalogType } from '@/types/catalog';
import { Currency } from '@/types/currency';
import { useEffect, useRef, useState } from 'react';

interface ICataloguesSetter {
   countries: Catalog[];
   identification_types: Catalog[];
   phone_codes: Catalog[];
   catalogue_types: CatalogType[];
   currencies: Currency[];
   hours: Catalog[];
   week_days: Catalog[];
   nationalities: Catalog[];
   city_type_id: number;
}

export default function GeneralDataSetter({
   catalogue_types,
   countries,
   identification_types,
   phone_codes,
   currencies,
   week_days,
   hours,
   nationalities,
   city_type_id,
}: ICataloguesSetter) {
   const dispatch = useAppDispatch();

   const [cities, setCities] = useState([] as Catalog[]);

   const isLoaded = useRef(false);

   !isLoaded.current &&
      (() => {
         dispatch(
            changeCatalogues({
               catalogue_types,
               cities,
               countries,
               phone_codes,
               identification_types,
               week_days,
               hours,
               nationalities,
            }),
         );

         dispatch(changeCurrencies(currencies));

         isLoaded.current = true;
      })();

   useEffect(() => {
      (async () => {
         const { data: cities } = await getCatalogByType(city_type_id);

         setCities(cities);

         isLoaded.current = false;
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return true;
}
