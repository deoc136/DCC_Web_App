export async function GET(_req: Request) {
   return new Response(':)', {
      status: 200,
   });
}
