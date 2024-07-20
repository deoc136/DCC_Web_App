'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import { AppointmentState } from '@/types/appointment';

interface IAppointmentStateChip {
   state: AppointmentState;
}

export default function AppointmentStateChip({ state }: IAppointmentStateChip) {
   return (
      <>
         {(() => {
            switch (state) {
               case 'CANCELED':
                  return (
                     <div className="font-semibold text-on-background-text">
                        <BlockRoundedIcon /> Cancelada
                     </div>
                  );
               case 'PENDING':
                  return (
                     <div className="rounded-lg bg-primary-200 p-2 font-semibold text-black">
                        Por atender
                     </div>
                  );
               case 'TO_PAY':
                  return (
                     <div className="rounded-lg bg-foundation p-2 font-semibold text-on-background-disabled">
                        Pago en espera
                     </div>
                  );
               case 'CLOSED':
                  return (
                     <div className="font-semibold text-success">
                        <CheckCircleRoundedIcon /> Finalizada
                     </div>
                  );
            }
         })()}
      </>
   );
}
