import { useEffect, useState } from 'react';
import { useAppSelector } from './redux-hooks';

export function useShowDetails() {
   const [show, setShow] = useState(false);

   const role = useAppSelector(store => store.user)?.role;
   const { hide_for_therapist, hide_for_receptionist, hide_for_patients } =
      useAppSelector(store => store.clinic);

   useEffect(() => {
      setShow(
         role === 'ADMINISTRATOR' ||
            (role === 'THERAPIST' && !hide_for_therapist) ||
            (role === 'RECEPTIONIST' && !hide_for_receptionist) ||
            (role === 'PATIENT' && !hide_for_patients),
      );
   }, [hide_for_receptionist, hide_for_therapist, role, hide_for_patients]);

   return show;
}
