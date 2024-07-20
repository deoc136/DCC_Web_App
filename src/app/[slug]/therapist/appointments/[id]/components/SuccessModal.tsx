import Dialog from '@/components/modal/Dialog';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Button from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function SuccessModal({
   isOpen,
   action,
}: {
   isOpen: boolean;
   action: () => any;
}) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex min-w-[40vw] flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Servicio finalizado
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text body-1">
                     El servicio ha sido finalizado con éxito.
                  </p>
               </div>
               <Button onPress={action} className="w-max !px-20">
                  Entendido
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
