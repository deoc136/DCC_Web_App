import { convertErrorIntoString } from '@/lib/utils';
import schedule from 'node-schedule';
import { z } from 'zod';
import { editUser, getUserById } from '../services';

const dateSchema = z.object({
   id: z.number(),
   deactivation_date: z.string().transform(string => new Date(string)),
   activation_date: z
      .string()
      .optional()
      .transform(string => string && new Date(string)),
   slug: z.string(),
});

export type DeactivateUserInputType = z.TypeOf<typeof dateSchema>;

export async function POST(req: Request) {
   try {
      const parsing = dateSchema.safeParse(await req.json());

      if (parsing.success) {
         const { deactivation_date, id, slug, activation_date } = parsing.data;

         try {
            await getUserById(slug, id.toString());
         } catch (error) {
            throw "The user doesn't exists";
         }

         schedule.scheduleJob(deactivation_date, async date => {
            try {
               const user = (await getUserById(slug, id.toString())).data;

               await editUser({ ...user, enabled: false }, slug);
            } catch (error) {}
         });

         activation_date &&
            schedule.scheduleJob(new Date(activation_date), async () => {
               try {
                  const user = (await getUserById(slug, id.toString())).data;

                  await editUser({ ...user, enabled: true }, slug);
               } catch (error) {}
            });

         return (Response as any).json('Change scheduled');
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
