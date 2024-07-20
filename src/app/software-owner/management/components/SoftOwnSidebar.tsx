'use client';

import Sidebar from '@/components/sidebar/Sidebar';
import { signOut } from '@/lib/actions/signOut';
import { SORoutes } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Item, Section } from 'react-stately';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospital';
import SettingsRoundedIcon from '@mui/icons-material/Settings';
import LogoutRoundedIcon from '@mui/icons-material/Logout';
import Button from '@/components/shared/Button';
import SignOutButton from '@/components/sidebar/SignOutButton';

interface ISoftOwnSidebar {}

export default function SoftOwnSidebar({}: ISoftOwnSidebar) {
   return (
      <Sidebar
         signOutButton={<SignOutButton route={SORoutes.login} />}
         icons={[LocalHospitalRoundedIcon, SettingsRoundedIcon]}
      >
         <Item textValue={SORoutes.management_clinics}>Clínicas</Item>
         <Item textValue={SORoutes.management_setting}>Configuración</Item>
      </Sidebar>
   );
}
