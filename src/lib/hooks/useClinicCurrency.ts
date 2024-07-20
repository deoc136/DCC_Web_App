import { getCurrency } from '../utils';
import { useAppSelector } from './redux-hooks';

export default function useClinicCurrency() {
   const currencies = useAppSelector(store => store.currencies);
   const { countries } = useAppSelector(store => store.catalogues);
   const clinic = useAppSelector(store => store.clinic);

   return getCurrency(currencies, countries, clinic);
}
