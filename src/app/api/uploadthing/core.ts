import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "../../../lib/firebase";

const f = createUploadthing();

export const ourFileRouter = {
  ressourceUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = auth.currentUser;
      if (!user) throw new Error("Non autorisé");
      return { userId: user.uid };
    })
    .onUploadComplete(async ({ file }) => {
      // Upload réussi
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;