'use client';

import { NewAppointmentWithDate } from './CreationView';
import { Dispatch, SetStateAction } from 'react';
import PaymentResume from '../components/PaymentResume';
import { Service } from '@/types/service';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { sendEmail } from '@/services/messages';
import { renderToStaticMarkup } from 'react-dom/server';
import EmailLayout from '@/emails/EmailLayout';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { timezone } from '@/lib/utils';
import { Auth } from 'aws-amplify';
import useDictionary from '@/lib/hooks/useDictionary';

interface IPaymentView {
   service: Service;
   create(order_id: string): Promise<void>;
   setCreationError: Dispatch<SetStateAction<string | undefined>>;
   creating: boolean;
   priceInUsd: string | undefined;
   values: NewAppointmentWithDate;
}

export default function PaymentView({
   create,
   service,
   setCreationError,
   creating,
   priceInUsd,
   values,
}: IPaymentView) {
   const dic = useDictionary();

   const [{ isPending }] = usePayPalScriptReducer();

   const clinic = useAppSelector(store => store.clinic);
   const user = useAppSelector(store => store.user);
   const hours = useAppSelector(store => store.catalogues.hours);

   return (
      <div className="grid gap-5 md:grid-cols-7 lg:grid-cols-5 lg:gap-10">
         <section className="relative !z-0 h-max md:col-start-1 md:col-end-5 lg:col-end-4">
            {priceInUsd === undefined || isPending ? (
               <div className="flex items-center justify-center gap-4 text-on-background-text">
                  {dic.texts.flows.loading}...
                  <RefreshRoundedIcon className="animate-spin" />
               </div>
            ) : (
               <PayPalButtons
                  disabled={creating}
                  onApprove={async ({ orderID }, actions) => {
                     await Auth.currentAuthenticatedUser();

                     const data = await actions.order!.capture();

                     const id = data.purchase_units
                        .at(0)
                        ?.payments?.captures?.at(0)?.['id'];

                     await create(
                        typeof id === 'string' ? id : `failed_${orderID}`,
                     );

                     await sendEmail({
                        content: renderToStaticMarkup(
                           <EmailLayout imageUrl={clinic.profile_picture_url}>
                              <p>
                                 Has agendado y pagado con éxito una cita en{' '}
                                 {clinic.name} con motivo de {service.name} el{' '}
                                 {($date =>
                                    `${$date.getDate()} de ${Intl.DateTimeFormat(
                                       undefined,
                                       {
                                          month: 'long',
                                       },
                                    ).format(
                                       $date,
                                    )} de ${$date.getFullYear()}`)(
                                    values.date.toDate(timezone),
                                 )}{' '}
                                 a las{' '}
                                 {
                                    hours.find(
                                       ({ code }) =>
                                          values.hour.toString() === code,
                                    )?.name
                                 }
                                 . Para ver mas detalles, cambiar la fecha o
                                 cancelarla puedes entrar al apartado de
                                 &quot;Citas agendadas&quot; desde el portal
                                 web.
                              </p>
                           </EmailLayout>,
                        ),
                        destinationEmails: user?.email ? [user.email] : [],

                        fromEmail: 'agenda.ahora.dvp@gmail.com',
                        subject: `Agendamiento de cita - ${clinic.name}`,
                     });
                  }}
                  onError={() => {
                     setCreationError('Ocurrió un error procesando el pago.');
                  }}
                  createOrder={(_, actions) =>
                     actions.order.create({
                        purchase_units: [
                           {
                              amount: {
                                 value: priceInUsd,
                              },
                              description: `${service.name} - 1 sesión`,
                           },
                        ],
                     })
                  }
                  style={{
                     tagline: false,
                     color: 'silver',
                  }}
               />
            )}
         </section>
         <section className="md:col-span-full md:col-start-5 lg:col-start-4 lg:col-end-6">
            <PaymentResume
               quantity={1}
               serviceName={service?.name ?? ''}
               servicePrice={Number(service?.price ?? 0)}
               taxes={0}
            />
         </section>
      </div>
   );
}
