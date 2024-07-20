import { useAppSelector } from "@/lib/hooks/redux-hooks";
import { useRouter } from "next/navigation";
import Card from "./Card";
import Button from "../Button";
import { downloadURI } from "@/lib/utils";
import { AccessTimeRounded, CheckCircleRounded, DownloadRounded } from "@mui/icons-material";

interface IFormCard {
   form: IFile;
   submittedForm?: SubmittedFile;
}

export default function FormCard({ form, submittedForm }: IFormCard) {
   return (
      <Card className="flex flex-col !p-0">
         <div className="flex w-full justify-between bg-foundation p-4">
            <h3 className="text-sm">{form.public_name}</h3>
            <Button
               onPress={() =>
                  submittedForm
                     ? downloadURI(submittedForm.url, submittedForm.file_name)
                     : downloadURI(form.url, form.file_name)
               }
               className="w-max bg-transparent !p-0"
            >
               <DownloadRounded className="!fill-secondary" />
            </Button>
         </div>
         <div className="flex justify-between p-4 font-semibold">
            <p>Estado</p>
            {!submittedForm ? (
               <div className="flex items-center gap-2 text-on-background-text">
                  <AccessTimeRounded /> Pendiente
               </div>
            ) : (
               <div className="flex items-center gap-2 font-semibold text-success">
                  <CheckCircleRounded /> Completado
               </div>
            )}
         </div>
      </Card>
   );
}
