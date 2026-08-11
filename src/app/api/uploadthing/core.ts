import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  ressourceUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Fichier envoyé avec succès :", file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;