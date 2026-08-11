import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// On importe le type OurFileRouter depuis ton fichier core.ts
import type { OurFileRouter } from "../app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();