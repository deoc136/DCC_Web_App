import { convertErrorIntoString } from '@/lib/utils';
import schedule from 'node-schedule';
import { z } from 'zod';
import { editUser, getUserById } from '../services';

const dateSchema = z.object({
   id: z.number(),
   deletion_date: z.string().transform(string => new Date(string)),
   slug: z.string(),
});

export type RemoveUserInputType = z.TypeOf<typeof dateSchema>;

export async function POST(req: Request) {
   try {
      const parsing = dateSchema.safeParse(await req.json());

      if (parsing.success) {
         const { deletion_date, id, slug } = parsing.data;

         try {
            await getUserById(slug, id.toString());
         } catch (error) {
            throw "The user doesn't exists";
         }

         schedule.scheduleJob(deletion_date, async date => {
            try {
               const user = (await getUserById(slug, id.toString())).data;

               await editUser({ ...user, retired: true }, slug);
            } catch (error) {}
         });

         return (Response as any).json('Removal scheduled');
      } else {
         throw JSON.parse(convertErrorIntoString(parsing));
      }
   } catch (error) {
      return (Response as any).json(
         {
            error,
         },
         { status: 400 },
      );
   }
}
