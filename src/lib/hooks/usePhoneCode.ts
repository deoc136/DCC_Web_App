import { useEffect, useState } from 'react';
import { useAppSelector } from './redux-hooks';

export default function usePhoneCode() {
   const clinic = useAppSelector(store => store.clinic);
   const { phone_codes } = useAppSelector(store => store.catalogues);

   const [code, setCode] = useState(
      phone_codes.find(code => code.parent_catalog_id === clinic.country),
   );

   useEffect(() => {
      setCode(
         phone_codes.find(code => code.parent_catalog_id === clinic.country),
      );
   }, [phone_codes, clinic.country]);

   return code;
}
