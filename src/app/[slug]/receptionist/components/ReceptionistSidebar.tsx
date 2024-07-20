'use client';

import Sidebar from '@/components/sidebar/Sidebar';
import React from 'react';
import { ListBox } from '@/components/shared/ListBox';
import { Item, Section } from 'react-stately';
import { clinicRoutes } from '@/lib/routes';
import BookRoundedIcon from '@mui/icons-material/BookRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import SignOutButton from '@/components/sidebar/SignOutButton';

interface IAdminSidebar {}

export default function ReceptionistSidebar({}: IAdminSidebar) {
   const clinic = useAppSelector(store => store.clinic);

   return (
      <Sidebar
         imageSrc={clinic?.profile_picture_url}
         signOutButton={
            <SignOutButton route={clinicRoutes(clinic.slug).login} />
         }
         icons={[
            [BookRoundedIcon, HistoryRoundedIcon],
            PeopleAltIcon,
            AccountCircleRoundedIcon,
         ]}
         items={[ListBox]}
      >
         <Section title="Reservas">
            <Item
               textValue={
                  clinicRoutes(clinic.slug).receptionist_appointments_actives
               }
            >
               Activas
            </Item>
            <Item
               textValue={
                  clinicRoutes(clinic.slug).receptionist_appointments_history
               }
            >
               Historial
            </Item>
         </Section>
         <Item textValue={clinicRoutes(clinic.slug).receptionist_patients}>
            Pacientes
         </Item>
         <Item textValue={clinicRoutes(clinic.slug).receptionist_profile}>
            Mi perfil
         </Item>
      </Sidebar>
   );
}
