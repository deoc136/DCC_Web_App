import { NewRating, Rating } from '@/types/rating';
import axios from 'axios';

export async function getAllRatingsByAppointmentId(slug: string, id: string) {
   return await axios.get<Rating[]>(`/rating/getAllByAppointmentId/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function createRating(slug: string, rating: NewRating) {
   return await axios.post(`/rating/create/`, rating, {
      headers: {
         slug,
      },
   });
}
