'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import {
   NewUser,
   TherapistWithSchedule,
   User,
   UserService,
} from '@/types/user';
import ComboBox from '@/components/inputs/ComboBox';
import { Item } from 'react-stately';
import { Service } from '@/types/service';
import { Headquarter } from '@/types/headquarter';
import { today } from '@internationalized/date';
import { timezone } from '@/lib/utils';
import UserOverviewCard from '@/components/shared/cards/UserOverviewCard';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@/components/shared/Button';
import { Appointment, PaymentMethod } from '@/types/appointment';
import usePhoneCode from '@/lib/hooks/usePhoneCode';
import SelectPatientModal from '../../../components/SelectPatientModal';
import { AppointmentPackagesInfo } from './CreationView';
import { ZodIssue } from 'zod';
import Card from '@/components/shared/cards/Card';
import SelectServicesBlock from '@/components/shared/SelectServicesBlock';

interface IFormView {
   values: AppointmentPackagesInfo;
   setValues: Dispatch<SetStateAction<AppointmentPackagesInfo>>;
   errors: ZodIssue[] | undefined;
   services: Service[];
   headquarters: Headquarter[];
   therapists: TherapistWithSchedule[];
   patients: User[];
   userServices: UserService[];
   appointments: Appointment[];
   newPatient: NewUser | undefined;
   setNewPatient: Dispatch<SetStateAction<NewUser | undefined>>;
   packages: Package[];
}

export type ChangeValuesFunction = <T extends keyof AppointmentPackagesInfo>(
   param: T,
   value: AppointmentPackagesInfo[T],
) => void;

export default function FormView({
   setValues,
   values,
   errors,
   headquarters,
   patients,
   services,
   therapists,
   userServices,
   appointments,
   newPatient,
   setNewPatient,
   packages,
}: IFormView) {
   function changeValues<T extends keyof typeof values>(
      param: T,
      value: (typeof values)[T],
   ) {
      setValues(prev => ({ ...prev, [param]: value }));
   }

   const phoneCode = usePhoneCode();

   const [patientModalOpen, setPatientModalOpen] = useState(false);

   const filteredTherapists = useMemo(() => {
      const aux = userServices.filter(
         ({ service_id }) => service_id.toString() === values.service_id,
      );

      return therapists.filter(({ user: { id } }) =>
         aux.some(({ user_id }) => id === user_id),
      );
   }, [userServices, therapists, values.service_id]);

   const patient = useMemo(
      () => patients.find(user => user.id.toString() === values.patient_id),
      [patients, values.patient_id],
   );

   return (
      <>
         <SelectPatientModal
            newUser={newPatient}
            setNewUser={setNewPatient}
            isOpen={patientModalOpen}
            setIsOpen={setPatientModalOpen}
            selectedUserId={values.patient_id}
            users={patients}
            changeValues={id => changeValues('patient_id', id)}
         />
         <div className="mb-10 grid gap-10">
            <h2 className="font-semibold">Datos generales</h2>
            <section className="mx-20 grid grid-cols-2 gap-10">
               <div className="col-span-2">
                  <p className="mb-2 text-on-background-text label">Paciente</p>
                  {newPatient || patient ? (
                     <UserOverviewCard
                        user={
                           newPatient
                              ? {
                                   ...newPatient,
                                }
                              : {
                                   ...patient!,
                                }
                        }
                        code={phoneCode}
                        extra={
                           <Button
                              onPress={() => setPatientModalOpen(true)}
                              className="flex w-max items-center gap-2 bg-transparent !text-secondary"
                           >
                              Cambiar
                           </Button>
                        }
                     />
                  ) : (
                     <Button
                        onPress={() => setPatientModalOpen(true)}
                        className="flex !w-full justify-center border-2 border-dashed border-on-background-light !bg-transparent !p-6 !text-on-background-text"
                     >
                        <AddRoundedIcon /> Agregar paciente
                     </Button>
                  )}

                  {(message =>
                     message && (
                        <div className="mt-4 text-error">{message}</div>
                     ))(
                     errors?.find(error => error.path.at(0) === 'patient_id')
                        ?.message,
                  )}
               </div>
               <ComboBox
                  placeholder="Selecciona un paquete"
                  label="Tipo de paquete"
                  selectedKey={values.package_id}
                  onSelectionChange={val => {
                     if (!val) return;

                     const $package = packages.find(
                        ({ id }) => id.toString() === val.toString(),
                     );

                     const service = services.find(
                        ({ id }) =>
                           id.toString() === $package?.service_id.toString(),
                     );

                     setValues(prev => ({
                        ...prev,
                        headquarter_id: '',
                        price: $package?.price ?? '',
                        service_id: service?.id.toString() ?? '',
                        package_id: val.toString(),
                        services: Array.from({
                           length: Number($package?.quantity ?? 0),
                        }).map(_ => ({
                           date: today(timezone),
                           hour: '',
                           therapist_id: '',
                        })),
                     }));
                  }}
                  errorMessage={
                     errors?.find(error => error.path.at(0) === 'service_id')
                        ?.message
                  }
               >
                  {packages.map(type => (
                     <Item key={type.id} textValue={type.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {type.name} -{' '}
                           {
                              services.find(
                                 service =>
                                    service.id?.toString() ===
                                    type.service_id.toString(),
                              )?.name
                           }
                        </div>
                     </Item>
                  ))}
               </ComboBox>
               <ComboBox
                  isDisabled={!values.package_id.length}
                  placeholder="Selecciona una sede"
                  label="Sede"
                  selectedKey={values.headquarter_id?.toString()}
                  onSelectionChange={val => {
                     val &&
                        setValues(prev => ({
                           ...prev,
                           headquarter_id: val.toString(),
                           therapist_id: '',
                           services: [...prev.services].map(service => ({
                              ...service,
                              therapist_id: '',
                           })),
                        }));
                  }}
                  errorMessage={
                     errors?.find(
                        error => error.path.at(0) === 'headquarter_id',
                     )?.message
                  }
               >
                  {headquarters
                     .sort((a, b) => a.index - b.index)
                     .filter(
                        ({ removed, id }) =>
                           !removed &&
                           filteredTherapists.some(
                              ({ user: { headquarter_id } }) =>
                                 id === headquarter_id,
                           ),
                     )
                     .map((quarter, i) => (
                        <Item key={quarter.id} textValue={quarter.name}>
                           <div className="px-4 py-3 hover:bg-primary-100">
                              {quarter.name} -{' '}
                              {i > 0 ? `Sede ${i + 1}` : 'Sede principal'}
                           </div>
                        </Item>
                     ))}
               </ComboBox>
               <div className="col-span-2">
                  <p className="mb-2 text-on-background-text label">
                     Agendar sesiones
                  </p>
                  <Card
                     isShadowed
                     className="min-h-[2rem] w-full overflow-hidden !p-0"
                  >
                     <SelectServicesBlock
                        therapists={filteredTherapists}
                        setValues={setValues}
                        values={values}
                        appointments={appointments}
                        newPatient={!!newPatient}
                        errors={errors}
                     />
                  </Card>
               </div>
               <ComboBox
                  placeholder="Selecciona un método"
                  label="Método de pago"
                  selectedKey={values.payment_method.toString()}
                  onSelectionChange={val =>
                     val &&
                     changeValues(
                        'payment_method',
                        val.toString() as PaymentMethod,
                     )
                  }
                  errorMessage={
                     errors?.find(
                        error => error.path.at(0) === 'payment_method',
                     )?.message
                  }
               >
                  {(
                     [
                        {
                           name: 'Pago online',
                           code: 'ONLINE',
                        },
                        {
                           name: 'Pago en efectivo',
                           code: 'CASH',
                        },
                        {
                           name: 'Pago con tarjeta',
                           code: 'CARD',
                        },
                     ] as const
                  ).map(method => (
                     <Item key={method.code} textValue={method.name}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {method.name}
                        </div>
                     </Item>
                  ))}
               </ComboBox>
            </section>
         </div>
      </>
   );
}
