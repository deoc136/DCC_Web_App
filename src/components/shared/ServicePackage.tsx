'use client';

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Dispatch, SetStateAction, useState } from 'react';
import Card from './cards/Card';
import Button from './Button';
import PopoverTrigger from './PopoverTrigger';
import Dialog from '../modal/Dialog';
import { ListBox } from './ListBox';
import { Item } from 'react-stately';
import useClinicCurrency from '@/lib/hooks/useClinicCurrency';
import { formatPrice } from '@/lib/utils';

interface IServicePackage {
   servicePackage: NewPackage;
   index: number;
   setEditingPackage: Dispatch<SetStateAction<number | undefined>>;
   setDeletingPackage: Dispatch<SetStateAction<number | undefined>>;
   hideSeeMore?: boolean;
}

export default function ServicePackage({
   index,
   servicePackage,
   setEditingPackage,
   setDeletingPackage,
   hideSeeMore = false,
}: IServicePackage) {
   const [extended, setExtended] = useState(false);

   const clinicCurrency = useClinicCurrency();

   return (
      <Card className="grid h-max grid-cols-2 gap-5" isShadowed>
         <div className="col-span-2 flex justify-between">
            <h4 className="truncate text-base font-semibold">
               {servicePackage.name}
            </h4>
            {!hideSeeMore && (
               <SeeMoreButton
                  setDeletingPackage={setDeletingPackage}
                  setEditingPackage={setEditingPackage}
                  index={index}
               />
            )}
         </div>
         <div>
            <div className="font-semibold text-on-background-text">
               Precio del paquete
            </div>
            <div className="truncate">
               {formatPrice(Number(servicePackage.price), clinicCurrency)}
            </div>
         </div>
         <div>
            <div className="font-semibold text-on-background-text">
               Sesiones
            </div>
            <div className="truncate">{servicePackage.quantity}</div>
         </div>
         <div className="col-span-2">
            <div className="font-semibold text-on-background-text">
               Descripción
            </div>
            <div className="h-max w-full break-words">
               {servicePackage.description.length <= 150
                  ? servicePackage.description
                  : extended
                  ? servicePackage.description
                  : `${servicePackage.description.slice(0, 150).trim()}...`}
            </div>
         </div>
         {servicePackage.description.length > 150 && (
            <Button
               className="!w-max bg-transparent !p-0 !text-secondary underline"
               onPress={() => setExtended(prev => !prev)}
            >
               {extended ? 'Ver menos' : 'Ver más'}
            </Button>
         )}
      </Card>
   );
}

function SeeMoreButton({
   index,
   setEditingPackage,
   setDeletingPackage,
}: {
   index: number;
   setEditingPackage: Dispatch<SetStateAction<number | undefined>>;
   setDeletingPackage: Dispatch<SetStateAction<number | undefined>>;
}) {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <PopoverTrigger
         isOpen={isOpen}
         onOpenChange={setIsOpen}
         trigger={<MoreVertRoundedIcon className="!fill-on-background-text" />}
      >
         <Dialog className="rounded">
            <ListBox className="right-0 !p-0 !py-2 shadow-xl">
               <Item textValue="Editar">
                  <Button
                     onPress={() => {
                        setEditingPackage(index);
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-on-background-text"
                  >
                     Editar
                  </Button>
               </Item>
               <Item textValue="Eliminar">
                  <Button
                     onPress={() => {
                        setDeletingPackage(index);
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-secondary"
                  >
                     Eliminar
                  </Button>
               </Item>
            </ListBox>
         </Dialog>
      </PopoverTrigger>
   );
}
