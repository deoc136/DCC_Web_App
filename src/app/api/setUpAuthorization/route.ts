import { convertErrorIntoString } from '@/lib/utils';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';

const schema = z.object({
   code: z.union([z.string(), z.undefined()]),
});

export type SetUpAuthorizationInputType = z.infer<typeof schema>;

export async function POST(req: Request) {
   try {
      const parsing = schema.safeParse(req.body);

      if (parsing.success) {
         const { code } = parsing.data;

         const cookieStore = cookies();
         cookieStore.set('authorization', code ?? '');

         return (Response as any).json('Authorization settled.');
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
