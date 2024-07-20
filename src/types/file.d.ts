interface IFile {
   id: number;
   url: string;
   file_name: string;
   public_name: string;
}

interface NewFile {
   url: string;
   file_name: string;
   public_name: string;
   id?: number | undefined;
}

interface SubmittedFile {
   id: number;
   patient_id: number;
   url: string;
   file_name: string;
   form_id: number;
}

interface NewSubmittedFile {
   id?: number;
   patient_id: number;
   url: string;
   file_name: string;
   form_id: number;
}
