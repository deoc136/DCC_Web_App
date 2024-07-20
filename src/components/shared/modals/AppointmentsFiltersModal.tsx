'use client';

import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button, { Variant } from '@/components/shared/Button';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuButton from '@/components/inputs/MenuButton';
import { Item } from 'react-stately';
import { Service } from '@/types/service';
import { User } from '@/types/user';
import { cutFullName } from '@/lib/utils';

interface IAppointmentsFiltersModal {
   isOpen: boolean;
   setIsOpen: Dispatch<SetStateAction<boolean>>;
   services?: Service[];
   patients?: User[];
   therapists?: User[];
   selectedServices: number[];
   selectedTherapists: number[];
   selectedPatients: number[];
   setSelectedServices: Dispatch<SetStateAction<number[]>>;
   setSelectedTherapists: Dispatch<SetStateAction<number[]>>;
   setSelectedPatients: Dispatch<SetStateAction<number[]>>;
}

export default function AppointmentsFiltersModal({
   isOpen,
   setIsOpen,
   services,
   patients,
   therapists,
   selectedPatients,
   selectedServices,
   selectedTherapists,
   setSelectedPatients,
   setSelectedServices,
   setSelectedTherapists,
}: IAppointmentsFiltersModal) {
   const [servicesAux, setServicesAux] = useState(selectedServices);
   const [therapistsAux, setTherapistsAux] = useState(selectedTherapists);
   const [patientsAux, setPatientsAux] = useState(selectedPatients);

   function save() {
      setSelectedPatients(patientsAux);
      setSelectedServices(servicesAux);
      setSelectedTherapists(therapistsAux);
   }

   useEffect(() => {
      if (!isOpen) {
         setServicesAux(selectedServices);
         setTherapistsAux(selectedTherapists);
         setPatientsAux(selectedPatients);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isOpen]);

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="grid gap-14 rounded-xl p-7 ">
               <div className="flex min-w-[40vw] items-center justify-between">
                  <h2 className="text-2xl font-semibold">Filtros</h2>
                  <Button
                     className="!w-max bg-transparent !p-0"
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     <CloseRoundedIcon className="!fill-black" />
                  </Button>
               </div>
               <div className="grid gap-5 md:grid-cols-2">
                  {services && (
                     <MenuButton
                        selectionMode="multiple"
                        selectedKeys={servicesAux}
                        onSelectionChange={vals => {
                           vals && setServicesAux(Array.from(vals) as number[]);
                        }}
                        label="Tipo de servicio"
                        content={`${servicesAux.length} servicios seleccionados`}
                     >
                        {services.map(service => (
                           <Item key={service.id} textValue={service.name}>
                              {service.name}
                           </Item>
                        ))}
                     </MenuButton>
                  )}
                  {therapists && (
                     <MenuButton
                        selectionMode="multiple"
                        selectedKeys={therapistsAux}
                        onSelectionChange={vals => {
                           vals &&
                              setTherapistsAux(Array.from(vals) as number[]);
                        }}
                        label="Terapeutas"
                        content={`${therapistsAux.length} terapeutas seleccionados`}
                     >
                        {therapists.map(therapist => (
                           <Item
                              key={therapist.id}
                              textValue={cutFullName(therapist.names, therapist.last_names)}
                           >
                              {cutFullName(
                                 therapist.names,
                                 therapist.last_names,
                              )}
                           </Item>
                        ))}
                     </MenuButton>
                  )}
                  {patients && (
                     <MenuButton
                        selectionMode="multiple"
                        selectedKeys={patientsAux}
                        onSelectionChange={vals => {
                           vals && setPatientsAux(Array.from(vals) as number[]);
                        }}
                        label="Pacientes"
                        content={`${patientsAux.length} pacientes seleccionados`}
                     >
                        {patients.map(patient => (
                           <Item
                              key={patient.id}
                              textValue={`${patient.names
                                 .split(' ')
                                 .at(0)} ${patient.last_names
                                 .split(' ')
                                 .at(0)}`}
                           >
                              {cutFullName(patient.names, patient.last_names)}
                           </Item>
                        ))}
                     </MenuButton>
                  )}
               </div>
               <div className="flex justify-center gap-5">
                  <Button
                     className="max-w-[16rem]"
                     variant={Variant.secondary}
                     onPress={() => {
                        setIsOpen(false);
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button
                     className="max-w-[16rem]"
                     onPress={() => {
                        save();
                        setIsOpen(false);
                     }}
                  >
                     Aplicar filtros
                  </Button>
               </div>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
