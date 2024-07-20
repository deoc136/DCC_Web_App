import { clinicRoutes } from '@/lib/routes';
import { redirect } from 'next/navigation';

export default function Page({ params }: { params: { slug: string } }) {
   redirect(clinicRoutes(params.slug).patient_services);
}
