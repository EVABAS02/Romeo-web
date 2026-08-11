"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import MessagesChat from "../../../components/dashboard/MessagesChat";
import GestionRessources from "../../../components/dashboard/GestionRessources";
import { Conversation } from "../../../types/chat";

interface ContactItem {
  nom: string;
  email: string;
  type: "Élève" | "Contact";
  dernierObjet?: string;
}

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "messages" | "contacts" | "cours_epreuves">("dashboard");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 1. Auth check
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin");
      }
    });

    // 2. Écoute conversations Firestore
    const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"));
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      setConversations(convs);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDocs();
    };
  }, [router]);

  const handleLogout = () => {
    signOut(auth);
  };

  // Passer directement à une conversation spécifique
  const handleOpenConversation = (convId: string) => {
    setSelectedConvId(convId);
    setActiveTab("messages");
  };

  // 📊 Stats
  const totalConversations = conversations.length;
  const unreadMessages = conversations.filter((c) => !c.read).length;
  const readMessages = totalConversations - unreadMessages;

  const coursCount = conversations.filter(
    (c) => c.sujet === "cours" || c.sujet === "Cours particuliers" || c.sujet?.toLowerCase().includes("cours")
  ).length;

  const filteredConversations = conversations.filter(
    (c) =>
      c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sujet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 👥 Répertoire Contacts
  const contactMap = new Map<string, ContactItem>();

  conversations.forEach((c) => {
    const isEleve = c.sujet === "cours" || c.sujet === "Cours particuliers" || c.sujet?.toLowerCase().includes("cours");

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

  const uniqueContacts = Array.from(contactMap.values());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F9] flex items-center justify-center text-indigo-900 font-semibold">
        Chargement de votre tableau de bord...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-slate-800 p-3 sm:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto flex gap-6">
        
        {/* ================= SIDEBAR ================= */}
        <aside className="w-64 bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm hidden lg:flex min-h-[calc(100vh-3rem)]">
          <div>
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                  MENU
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeTab === "dashboard"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </button>

                  <button
                    onClick={() => setActiveTab("messages")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeTab === "messages"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      Messagerie Live
                    </div>
                    {unreadMessages > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === "messages" ? "bg-white text-indigo-600" : "bg-indigo-100 text-indigo-700"}`}>
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                </nav>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                  GESTION
                </p>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("contacts")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeTab === "contacts"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Élèves & Contacts
                  </button>

                  <button
                    onClick={() => setActiveTab("cours_epreuves")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      activeTab === "cours_epreuves"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Cours &amp; Épreuves
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* ================= CONTENU PRINCIPAL ================= */}
        <main className="flex-1 space-y-6">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent pt-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeTab === "dashboard" && "Vue d'ensemble"}
                {activeTab === "messages" && "Messagerie en direct"}
                {activeTab === "contacts" && "Répertoire Élèves & Contacts"}
                {activeTab === "cours_epreuves" && "Gestion des Cours & Épreuves"}
              </h1>
              <p className="text-xs text-slate-400 font-medium capitalize">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl text-xs border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl shadow-sm">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center font-bold text-sm text-indigo-700 relative">
                  <img
                    src="/images/romeo.webp"
                    alt="Édouard R. Azon"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute">ER</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">Édouard R. Azon</p>
                  <p className="text-[10px] text-slate-400 font-medium">Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* ================= ONGLET 1 : DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-200 flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-indigo-100">Conversations</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{totalConversations}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Nouveaux
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Non lus</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{unreadMessages}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Cours
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Demandes de cours</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{coursCount}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Traités
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Conversations Lues</p>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{readMessages}</h3>
                  </div>
                </div>
              </div>

              {/* Discussions récentes */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Discussions récentes</h3>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    Ouvrir la messagerie live →
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredConversations.slice(0, 3).map((conv) => (
                    <div key={conv.id} className="p-4 rounded-2xl bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{conv.nom}</h4>
                        <p className="text-xs text-slate-400">{conv.sujet} • {conv.lastMessage}</p>
                      </div>
                      <button
                        onClick={() => handleOpenConversation(conv.id)}
                        className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                      >
                        Répondre
                      </button>
                    </div>
                  ))}

                  {filteredConversations.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">Aucune conversation récente.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= ONGLET 2 : MESSAGES LIVE ================= */}
          {activeTab === "messages" && (
            <div>
              <MessagesChat
                selectedConvId={selectedConvId}
                onSelectConv={(id) => setSelectedConvId(id)}
              />
            </div>
          )}

          {/* ================= ONGLET 3 : ÉLÈVES & CONTACTS ================= */}
          {activeTab === "contacts" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Répertoire des Contacts & Élèves</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Catégorisation automatique : Une personne devient un <strong>"Élève"</strong> dès qu'elle fait une demande de <em>Cours particuliers</em>.
                </p>
              </div>

              {uniqueContacts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Aucun contact enregistré pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uniqueContacts.map((contact, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {contact.nom?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{contact.nom}</h4>
                          <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                          contact.type === "Élève"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {contact.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= ONGLET 4 : GESTION COURS & ÉPREUVES ================= */}
          {activeTab === "cours_epreuves" && (
            <GestionRessources />
          )}

        </main>
      </div>
    </div>
  );
}