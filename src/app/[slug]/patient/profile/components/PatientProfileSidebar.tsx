'use client';

import Sidebar from '@/components/sidebar/Sidebar';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { Item } from 'react-stately';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import FolderSharedRoundedIcon from '@mui/icons-material/FolderSharedRounded';
import useDictionary from '@/lib/hooks/useDictionary';

interface IPatientProfileSidebar {}

export default function PatientProfileSidebar({}: IPatientProfileSidebar) {
   const dic = useDictionary();

   const clinic = useAppSelector(store => store.clinic);

   return (
      <Sidebar
         className="!static hidden !h-max max-w-none bg-transparent !p-0 !pb-10 lg:block"
         noImage
         icons={[
            AccountCircleRoundedIcon,
            AssignmentRoundedIcon,
            FolderSharedRoundedIcon,
         ]}
      >
         <Item
            textValue={clinicRoutes(clinic.slug).patient_profile_personal_data}
         >
            {dic.texts.flows.personal_data}
         </Item>
         <Item textValue={clinicRoutes(clinic.slug).patient_profile_forms}>
            {dic.texts.flows.forms}
         </Item>
         <Item
            textValue={clinicRoutes(clinic.slug).patient_profile_clinic_history}
         >
            {dic.texts.flows.clinic_history}
         </Item>
         <Item textValue="#">{true}</Item>
      </Sidebar>
   );
}
