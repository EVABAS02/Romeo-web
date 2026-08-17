"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import MessagesChat from "../../../components/dashboard/MessagesChat";
import GestionRessources from "../../../components/dashboard/GestionRessources";
import GestionTemoignages from "../../../components/dashboard/GestionTemoignages";
import { Conversation } from "../../../types/chat";
import { Menu, X } from "lucide-react";

const ADMIN_UID = "Xp9PJehVALcSvDZCuWA0YTUJd672";

interface ContactItem {
  nom: string;
  email: string;
  type: "Élève" | "Contact";
  dernierObjet?: string;
}

type DashboardTab =
  | "dashboard"
  | "messages"
  | "contacts"
  | "cours_epreuves"
  | "temoignages";

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("dashboard");

  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const router = useRouter();

  /**
   * ============================================================
   * AUTHENTIFICATION ADMIN + ÉCOUTE DES CONVERSATIONS
   * ============================================================
   */
  useEffect(() => {
    let unsubscribeConversations: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        // Aucun utilisateur connecté
        if (!user) {
          setLoading(false);
          router.push("/admin");
          return;
        }

        // Vérification supplémentaire côté client.
        // La vraie sécurité reste protégée par Firestore Rules.
        if (user.uid !== ADMIN_UID) {
          console.error(
            "Accès refusé : utilisateur non administrateur."
          );

          setLoading(false);

          signOut(auth).finally(() => {
            router.push("/admin");
          });

          return;
        }

        // L'utilisateur est maintenant authentifié
        // et correspond à ton compte admin.
        // On peut seulement maintenant écouter Firestore.
        const conversationsQuery = query(
          collection(db, "conversations"),
          orderBy("updatedAt", "desc")
        );

        unsubscribeConversations = onSnapshot(
          conversationsQuery,
          (snapshot) => {
            const convs: Conversation[] = snapshot.docs.map(
              (docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              })
            ) as Conversation[];

            setConversations(convs);
            setLoading(false);
          },
          (error) => {
            console.error(
              "Erreur Firestore - conversations :",
              error
            );

            setConversations([]);
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();

      if (unsubscribeConversations) {
        unsubscribeConversations();
      }
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin");
    } catch (error) {
      console.error(
        "Erreur lors de la déconnexion :",
        error
      );
    }
  };

  const handleOpenConversation = (convId: string) => {
    setSelectedConvId(convId);
    setActiveTab("messages");
    setIsMobileMenuOpen(false);
  };

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);

    if (tab !== "messages") {
      setSelectedConvId(null);
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const totalConversations = conversations.length;

  const unreadMessages = conversations.filter(
    (c) => !c.read
  ).length;

  const readMessages =
    totalConversations - unreadMessages;

  const coursCount = conversations.filter(
    (c) =>
      c.sujet === "cours" ||
      c.sujet === "Cours particuliers" ||
      c.sujet?.toLowerCase().includes("cours")
  ).length;

  const normalizedSearch = searchTerm
    .trim()
    .toLowerCase();

  const filteredConversations = conversations.filter(
    (c) =>
      c.nom?.toLowerCase().includes(normalizedSearch) ||
      c.email?.toLowerCase().includes(normalizedSearch) ||
      c.sujet?.toLowerCase().includes(normalizedSearch)
  );

  // ============================================================
  // RÉPERTOIRE CONTACTS
  // ============================================================

  const contactMap = new Map<string, ContactItem>();

  conversations.forEach((c) => {
    const isEleve =
      c.sujet === "cours" ||
      c.sujet === "Cours particuliers" ||
      c.sujet?.toLowerCase().includes("cours");

    if (contactMap.has(c.email)) {
      if (isEleve) {
        contactMap.get(c.email)!.type = "Élève";
      }
    } else {
      contactMap.set(c.email, {
        nom: c.nom,
        email: c.email,
        type: isEleve ? "Élève" : "Contact",
        dernierObjet: c.sujet,
      });
    }
  });

  const uniqueContacts = Array.from(
    contactMap.values()
  );

  // ============================================================
  // PLACEHOLDER RECHERCHE
  // ============================================================

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "messages":
        return "Rechercher une conversation...";

      case "contacts":
        return "Rechercher un contact...";

      case "cours_epreuves":
        return "Rechercher une ressource...";

      case "temoignages":
        return "Rechercher un témoignage...";

      default:
        return "Rechercher...";
    }
  };

  // ============================================================
  // LOADING INITIAL
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F5F9] px-6 text-center font-semibold text-emerald-900">
        Chargement de votre tableau de bord...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] p-3 font-sans text-slate-800 sm:p-6">
      <div className="mx-auto flex max-w-[1600px] gap-6">
        {/* ======================================================
            SIDEBAR DESKTOP
        ======================================================= */}
        <aside className="hidden min-h-[calc(100vh-3rem)] w-64 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm lg:flex">
          <div>
            <div className="space-y-6">
              {/* ================= MENU ================= */}
              <div>
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  MENU
                </p>

                <nav
                  className="space-y-1"
                  aria-label="Menu principal"
                >
                  {/* Dashboard */}
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("dashboard")
                    }
                    aria-current={
                      activeTab === "dashboard"
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      activeTab === "dashboard"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>

                    Dashboard
                  </button>

                  {/* Messagerie */}
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("messages")
                    }
                    aria-current={
                      activeTab === "messages"
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      activeTab === "messages"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>

                      Messagerie Live
                    </div>

                    {unreadMessages > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          activeTab === "messages"
                            ? "bg-white text-emerald-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                </nav>
              </div>

              {/* ================= GESTION ================= */}
              <div>
                <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  GESTION
                </p>

                <nav
                  className="space-y-1"
                  aria-label="Gestion"
                >
                  {/* Contacts */}
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("contacts")
                    }
                    aria-current={
                      activeTab === "contacts"
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      activeTab === "contacts"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>

                    Élèves & Contacts
                  </button>

                  {/* Cours & Épreuves */}
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange(
                        "cours_epreuves"
                      )
                    }
                    aria-current={
                      activeTab === "cours_epreuves"
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      activeTab === "cours_epreuves"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332. 477 4.5 1.253v13C19.832 18.477 18.247 18.5 18.247 18.5c-1.746 0-3.332 1.253-4.5 1.253"
                      />
                    </svg>

                    Cours &amp; Épreuves
                  </button>

                  {/* Témoignages */}
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("temoignages")
                    }
                    aria-current={
                      activeTab === "temoignages"
                        ? "page"
                        : undefined
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                      activeTab === "temoignages"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h7m-9 8-3 1 1-4A8 8 0 1 1 20 12"
                      />
                    </svg>

                    Témoignages
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Déconnexion */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-200 outline-none transition-all hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>

              Déconnexion
            </button>
          </div>
        </aside>

        {/* ======================================================
            CONTENU PRINCIPAL
        ======================================================= */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* ================= HEADER ================= */}
          <header className="relative flex flex-col items-start gap-4 bg-transparent pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {/* Menu mobile */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() =>
                    setIsMobileMenuOpen(
                      (prev) => !prev
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm outline-none transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  aria-label={
                    isMobileMenuOpen
                      ? "Fermer le menu d'administration"
                      : "Ouvrir le menu d'administration"
                  }
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-admin-navigation"
                >
                  {isMobileMenuOpen ? (
                    <X size={20} />
                  ) : (
                    <Menu size={20} />
                  )}
                </button>
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTab === "dashboard" &&
                    "Vue d'ensemble"}

                  {activeTab === "messages" &&
                    "Messagerie en direct"}

                  {activeTab === "contacts" &&
                    "Répertoire Élèves & Contacts"}

                  {activeTab === "cours_epreuves" &&
                    "Gestion des Cours & Épreuves"}

                  {activeTab === "temoignages" &&
                    "Gestion des Témoignages"}
                </h1>

                <p className="text-xs font-medium capitalize text-slate-400">
                  {new Date().toLocaleDateString(
                    "fr-FR",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-4 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <label
                  htmlFor="dashboard-search"
                  className="sr-only"
                >
                  {getSearchPlaceholder()}
                </label>

                <input
                  id="dashboard-search"
                  type="search"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="w-full rounded-2xl border-0 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500"
                />

                <svg
                  className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white p-1.5 pr-4 shadow-sm">
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                  <img
                    src="/images/romeo.webp"
                    alt="Édouard R. Azon"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <span className="absolute">
                    ER
                  </span>
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold leading-tight text-slate-800">
                    Édouard R. Azon
                  </p>

                  <p className="text-[10px] font-medium text-slate-400">
                    Admin
                  </p>
                </div>
              </div>
            </div>

            {/* ================= MENU MOBILE ================= */}
            {isMobileMenuOpen && (
              <div
                id="mobile-admin-navigation"
                className="absolute left-0 right-0 top-full z-40 mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden"
              >
                <nav
                  aria-label="Navigation mobile du tableau de bord"
                  className="space-y-1"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("dashboard")
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      activeTab === "dashboard"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("messages")
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      activeTab === "messages"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      Messagerie Live
                    </span>

                    {unreadMessages > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          activeTab === "messages"
                            ? "bg-white text-emerald-600"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {unreadMessages}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("contacts")
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      activeTab === "contacts"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Élèves &amp; Contacts
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("cours_epreuves")
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      activeTab === "cours_epreuves"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cours &amp; Épreuves
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("temoignages")
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      activeTab === "temoignages"
                        ? "bg-emerald-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Témoignages
                  </button>

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 outline-none transition-all hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Déconnexion
                  </button>
                </nav>
              </div>
            )}
          </header>

          {/* ====================================================
              ONGLET 1 : DASHBOARD
          ===================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex h-40 flex-col justify-between rounded-3xl bg-emerald-600 p-6 text-white shadow-xl shadow-emerald-200">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-emerald-100">
                      Conversations
                    </p>

                    <h3 className="mt-1 text-3xl font-extrabold text-white">
                      {totalConversations}
                    </h3>
                  </div>
                </div>

                <div className="flex h-40 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
                      Nouveaux
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Non lus
                    </p>

                    <h3 className="mt-1 text-3xl font-extrabold text-slate-800">
                      {unreadMessages}
                    </h3>
                  </div>
                </div>

                <div className="flex h-40 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332 1.253 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332 1.253-4.5 1.253"
                        />
                      </svg>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                      Cours
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Demandes de cours
                    </p>

                    <h3 className="mt-1 text-3xl font-extrabold text-slate-800">
                      {coursCount}
                    </h3>
                  </div>
                </div>

                <div className="flex h-40 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                      Traités
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Conversations Lues
                    </p>

                    <h3 className="mt-1 text-3xl font-extrabold text-slate-800">
                      {readMessages}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Discussions récentes */}
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Discussions récentes
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange("messages")
                    }
                    className="rounded-md text-xs font-bold text-emerald-600 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  >
                    Ouvrir la messagerie live →
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredConversations
                    .slice(0, 3)
                    .map((conv) => (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="min-w-0 pr-4">
                          <h4 className="truncate text-sm font-bold text-slate-800">
                            {conv.nom}
                          </h4>

                          <p className="truncate text-xs text-slate-400">
                            {conv.sujet} •{" "}
                            {conv.lastMessage}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenConversation(
                              conv.id
                            )
                          }
                          className="shrink-0 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white outline-none transition-all hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                        >
                          Répondre
                        </button>
                      </div>
                    ))}

                  {filteredConversations.length === 0 && (
                    <p className="py-6 text-center text-xs text-slate-400">
                      Aucune conversation récente.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              ONGLET 2 : MESSAGES
          ===================================================== */}
          {activeTab === "messages" && (
            <div>
              <MessagesChat
                selectedConvId={selectedConvId}
                onSelectConv={(id) =>
                  setSelectedConvId(id)
                }
              />
            </div>
          )}

          {/* ====================================================
              ONGLET 3 : CONTACTS
          ===================================================== */}
          {activeTab === "contacts" && (
            <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Répertoire des Contacts & Élèves
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Catégorisation automatique : Une personne
                  devient un <strong>"Élève"</strong> dès
                  qu'elle fait une demande de{" "}
                  <em>Cours particuliers</em>.
                </p>
              </div>

              {uniqueContacts.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  Aucun contact enregistré pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {uniqueContacts.map(
                    (contact, idx) => (
                      <div
                        key={`${contact.email}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {contact.nom
                              ?.charAt(0)
                              .toUpperCase() ||
                              "C"}
                          </div>

                          <div className="truncate">
                            <h4 className="truncate text-sm font-bold text-slate-800">
                              {contact.nom}
                            </h4>

                            <p className="truncate text-xs text-slate-500">
                              {contact.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            contact.type ===
                            "Élève"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {contact.type}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              ONGLET 4 : COURS & ÉPREUVES
          ===================================================== */}
          {activeTab === "cours_epreuves" && (
            <GestionRessources />
          )}

          {/* ====================================================
              ONGLET 5 : TÉMOIGNAGES
          ===================================================== */}
          {activeTab === "temoignages" && (
            <GestionTemoignages />
          )}
        </main>
      </div>
    </div>
  );
}