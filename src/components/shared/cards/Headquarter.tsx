'use client';

import Button from '@/components/shared/Button';
import { Catalog } from '@/types/catalog';
import { Headquarter } from '@/types/headquarter';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { useState } from 'react';

interface IHeadquarter {
   headquarter: Headquarter;
   cities: Catalog[];
   code?: Catalog;
}

export default function Headquarter({
   headquarter,
   cities,
   code,
}: IHeadquarter) {
   const [isOpen, setIsOpen] = useState(true);

   return (
      <article>
         <Button
            onPress={() => setIsOpen(prev => !prev)}
            className="grid grid-cols-[auto_auto_1fr_auto] items-end !rounded-none border-b border-on-background-disabled bg-transparent !p-0 !py-3"
         >
            <h4 className="text-lg font-semibold text-on-background-text">
               {headquarter.name}
            </h4>
            <span className="font-normal text-black">
               &nbsp;&nbsp;-&nbsp;&nbsp;
               {headquarter.index
                  ? `Sede ${headquarter.index}`
                  : 'Sede principal'}
            </span>
            <div />
            {isOpen ? (
               <KeyboardArrowUpRoundedIcon className="!fill-secondary" />
            ) : (
               <KeyboardArrowDownRoundedIcon className="!fill-secondary" />
            )}
         </Button>
         {isOpen && (
            <div className="mt-3 grid grid-cols-2 gap-5">
               <div>
                  <p className="mb-2 font-semibold">Ciudad</p>
                  <p className="text-on-background-text">
                     {cities.find(city => city.id === headquarter.city)?.name}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Dirección</p>
                  <p className="text-on-background-text">
                     {headquarter.address}
                  </p>
               </div>
               <div>
                  <p className="mb-2 font-semibold">Número de teléfono</p>
                  <p className="text-on-background-text">
                     {code?.code} {headquarter.phone}
                  </p>
               </div>
            </div>
         )}
      </article>
   );
}
