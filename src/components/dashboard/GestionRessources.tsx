"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { UploadDropzone } from "../../lib/uploadthing";

export type TypeRessource = "cours" | "epreuve";

export interface FichierItem {
  url: string;
  name: string;
  isPdf: boolean;
}

export interface RessourceDoc {
  id: string;
  titre: string;
  niveau: "3eme" | "2nde" | "1ere" | "Terminale C";
  type: TypeRessource;
  fichiers: FichierItem[];
  createdAt?: Timestamp | null;
}

const NIVEAUX_OPTIONS = [
  { id: "3eme", label: "Classe de 3ème (BEPC)" },
  { id: "2nde", label: "Classe de Seconde" },
  { id: "1ere", label: "Classe de Première" },
  { id: "Terminale C", label: "Terminale C (Bac C)" },
] as const;

export default function GestionRessources() {
  const [titre, setTitre] = useState("");
  const [niveau, setNiveau] = useState<RessourceDoc["niveau"]>("3eme");
  const [typeRessource, setTypeRessource] = useState<TypeRessource>("epreuve");
  
  const [uploadedFiles, setUploadedFiles] = useState<FichierItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ressources, setRessources] = useState<RessourceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRessources = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "ressources"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: RessourceDoc[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const fichiersList: FichierItem[] = data.fichiers || (data.urlPdf ? [{
          url: data.urlPdf,
          name: data.titre || "Document",
          isPdf: data.urlPdf.toLowerCase().includes(".pdf")
        }] : []);

        return {
          id: docSnap.id,
          titre: data.titre,
          niveau: data.niveau,
          type: data.type,
          fichiers: fichiersList,
          createdAt: data.createdAt,
        };
      });
      setRessources(list);
    } catch (err) {
      console.error("Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRessources();
  }, []);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
      setMessage({ type: "error", text: "Veuillez d'abord téléverser au moins un fichier !" });
      return;
    }

    if (!titre.trim()) return;

    setUploading(true);
    setMessage(null);

    try {
      await addDoc(collection(db, "ressources"), {
        titre: titre.trim(),
        niveau: niveau,
        type: typeRessource,
        fichiers: uploadedFiles,
        createdAt: serverTimestamp(),
      });

      setMessage({ type: "success", text: "Ressource publiée avec succès !" });
      setTitre("");
      setUploadedFiles([]);
      fetchRessources();
    } catch (error) {
      console.error("Erreur Firestore :", error);
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: RessourceDoc) => {
    if (!confirm(`Supprimer définitivement "${item.titre}" ?`)) return;

    try {
      await deleteDoc(doc(db, "ressources", item.id));
      setMessage({ type: "success", text: "Ressource supprimée avec succès." });
      fetchRessources();
    } catch (error) {
      console.error("Erreur de suppression :", error);
      setMessage({ type: "error", text: "Erreur lors de la suppression." });
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION FORMULAIRE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 text-base mb-1">
          Ajouter un Cours ou une Épreuve
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Sélectionnez la classe, le type et glissez vos fichiers (PDF / Images).
        </p>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-semibold mb-6 transition-all ${
            message.type === "success" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre du document</label>
              <input
                type="text"
                required
                placeholder="Ex: Sujet & Corrigé BEPC 2026"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Niveau</label>
              <select
                value={niveau}
                onChange={(e) => setNiveau(e.target.value as RessourceDoc["niveau"])}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all cursor-pointer"
              >
                {NIVEAUX_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Type</label>
              <select
                value={typeRessource}
                onChange={(e) => setTypeRessource(e.target.value as TypeRessource)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all cursor-pointer"
              >
                <option value="epreuve">📝 Épreuve / Devoir</option>
                <option value="cours">📚 Cours / Fiche</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Téléverser des fichiers (PDF / Images)
            </label>
            <UploadDropzone
              endpoint="ressourceUploader"
              onClientUploadComplete={(res) => {
                const filesFormatted = res.map((f) => ({
                  url: f.url,
                  name: f.name,
                  isPdf: f.name.toLowerCase().endsWith(".pdf"),
                }));
                setUploadedFiles(filesFormatted);
                setMessage({ type: "success", text: `${res.length} fichier(s) téléversé(s) avec succès ! Cliquez sur Publier.` });
              }}
              onUploadError={(error: Error) => {
                setMessage({ type: "error", text: `Erreur d'envoi : ${error.message}` });
              }}
              appearance={{
                container: "border-dashed border-2 border-slate-200 rounded-2xl p-8 bg-slate-50 transition-all hover:border-indigo-400 hover:bg-slate-100/80 cursor-pointer",
                button: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl mt-4 shadow-sm transition-all ut-uploading:cursor-not-allowed cursor-pointer",
                label: "text-slate-700 font-bold text-sm",
                allowedContent: "text-slate-400 text-xs mt-2 font-medium",
                uploadIcon: "text-indigo-500 w-12 h-12 mb-2"
              }}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-700 font-semibold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">✅</span>
                <span className="truncate">Fichiers prêts : {uploadedFiles.map(f => f.name).join(", ")}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setUploadedFiles([])}
                className="text-[10px] bg-indigo-200/60 hover:bg-indigo-200 text-indigo-800 px-2 py-1 rounded-lg transition-all"
              >
                Effacer
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || uploadedFiles.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {uploading ? "Enregistrement en cours..." : "Publier le document"}
          </button>
        </form>
      </div>

      {/* SECTION LISTE DES DOCUMENTS */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 text-base mb-4">Documents en ligne</h3>
        
        {loading ? (
          <div className="flex animate-pulse space-x-4 p-2">
            <div className="h-10 w-10 bg-slate-200 rounded-2xl"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : ressources.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Aucun document publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {ressources.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 transition-all hover:shadow-sm hover:border-slate-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl font-bold text-[10px] flex items-center justify-center flex-shrink-0 ${
                    item.type === "cours" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {item.fichiers.length > 1 ? `${item.fichiers.length} FICH` : item.fichiers[0]?.isPdf ? "PDF" : "IMG"}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{item.titre}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase">
                        {item.niveau}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 uppercase">
                        {item.type === "cours" ? "Cours" : "Épreuve"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {item.fichiers.map((f, idx) => (
                    <a
                      key={idx}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>Voir</span>
                      {item.fichiers.length > 1 && <span className="text-[10px] text-slate-400">#{idx + 1}</span>}
                    </a>
                  ))}
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-xs bg-rose-50 text-rose-600 font-bold px-3 py-2 rounded-xl cursor-pointer hover:bg-rose-100 transition-all"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}