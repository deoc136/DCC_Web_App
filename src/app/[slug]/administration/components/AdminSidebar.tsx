'use client';

import Sidebar from '@/components/sidebar/Sidebar';
import React, { useState } from 'react';
import { ListBox } from '@/components/shared/ListBox';
import { Item, Section } from 'react-stately';
import { clinicRoutes } from '@/lib/routes';
import { Clinic } from '@/types/clinic';
import BookRoundedIcon from '@mui/icons-material/BookRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CopyrightRoundedIcon from '@mui/icons-material/CopyrightRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospital';
import HomeIcon from '@mui/icons-material/Home';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SignOutButton from '@/components/sidebar/SignOutButton';

interface IAdminSidebar {
   clinic: Clinic;
}

export default function AdminSidebar({ clinic }: IAdminSidebar) {
   return (
      <Sidebar
         imageSrc={clinic?.profile_picture_url}
         signOutButton={
            <SignOutButton route={clinicRoutes(clinic.slug).login} />
         }
         icons={[
            HomeIcon,
            [BookRoundedIcon, HistoryRoundedIcon],
            LocalHospitalRoundedIcon,
            WorkspacesIcon,
            PeopleAltIcon,
            [
               SettingsRoundedIcon,
               CopyrightRoundedIcon,
               AssignmentRoundedIcon,
               AccountCircleRoundedIcon,
            ],
         ]}
      >
         <Item textValue={clinicRoutes(clinic.slug).admin_home}>Inicio</Item>
         <Section title="Reservas">
            <Item
               textValue={clinicRoutes(clinic.slug).admin_appointments_actives}
            >
               Activas
            </Item>
            <Item
               textValue={clinicRoutes(clinic.slug).admin_appointments_history}
            >
               Historial
            </Item>
         </Section>
         <Item textValue={clinicRoutes(clinic.slug).admin_services}>
            Servicios
         </Item>
         <Item textValue={clinicRoutes(clinic.slug).admin_team}>Equipo</Item>
         <Item textValue={clinicRoutes(clinic.slug).admin_patients}>
            Pacientes
         </Item>
         <Section title="Configuración">
            <Item textValue={clinicRoutes(clinic.slug).admin_settings_general}>
               General
            </Item>
            <Item
               textValue={
                  clinicRoutes(clinic.slug).admin_settings_terms_and_policies
               }
            >
               Políticas y Condiciones
            </Item>
            <Item textValue={clinicRoutes(clinic.slug).admin_settings_forms}>
               Formularios
            </Item>
            <Item textValue={clinicRoutes(clinic.slug).admin_settings_profile}>
               Mi perfil
            </Item>
         </Section>
      </Sidebar>
   );
}
