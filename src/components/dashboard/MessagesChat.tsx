"use client";

import React, { useEffect, useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Conversation, MessageItem } from "../../types/chat";

interface MessagesChatProps {
  selectedConvId?: string | null;
  onSelectConv?: (id: string) => void;
}

export default function MessagesChat({ selectedConvId, onSelectConv }: MessagesChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  
  // États pour la modification de message
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Écouter TOUTES les conversations
  useEffect(() => {
    const q = query(
      collection(db, "conversations"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      setConversations(convs);

      if (selectedConvId) {
        const found = convs.find((c) => c.id === selectedConvId);
        if (found) setSelectedConv(found);
      } else if (convs.length > 0 && !selectedConv) {
        setSelectedConv(convs[0]);
      } else if (selectedConv) {
        const updated = convs.find((c) => c.id === selectedConv.id);
        if (updated) setSelectedConv(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedConvId]);

  // 2. Écouter LES MESSAGES de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConv?.id) return;

    if (!selectedConv.read) {
      updateDoc(doc(db, "conversations", selectedConv.id), { read: true }).catch(console.error);
    }

    const messagesRef = collection(
      db,
      "conversations",
      selectedConv.id,
      "messages"
    );
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageItem[];

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConv?.id]);

  const handleSelect = (conv: Conversation) => {
    setSelectedConv(conv);
    if (onSelectConv) onSelectConv(conv.id);
  };

  // 3. Envoyer un message + Email
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    const textToSend = replyText.trim();
    setReplyText("");
    setSending(true);

    try {
      await addDoc(
        collection(db, "conversations", selectedConv.id, "messages"),
        {
          text: textToSend,
          sender: "admin",
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(doc(db, "conversations", selectedConv.id), {
        lastMessage: textToSend,
        updatedAt: serverTimestamp(),
      });

      // API Brevo
      await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          to: selectedConv.email,
          subject: selectedConv.sujet || "Réponse à votre message",
          replyText: textToSend,
          recipientName: selectedConv.nom,
        }),
      });
    } catch (error) {
      console.error("Erreur d'envoi :", error);
    } finally {
      setSending(false);
    }
  };

  // 🗑️ 4. SUPPRIMER UN MESSAGE
  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedConv?.id) return;
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;

    try {
      await deleteDoc(doc(db, "conversations", selectedConv.id, "messages", msgId));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  // ✏️ 5. ENREGISTRER LA MODIFICATION D'UN MESSAGE
  const handleSaveEdit = async (msgId: string) => {
    if (!selectedConv?.id || !editText.trim()) return;

    try {
      await updateDoc(doc(db, "conversations", selectedConv.id, "messages", msgId), {
        text: editText.trim(),
      });
      setEditingMsgId(null);
      setEditText("");
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-[650px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* COLONNE GAUCHE : Liste des discussions */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="font-bold text-slate-800 text-lg">Messages reçus</h2>
          <p className="text-xs text-slate-500">
            {conversations.length} conversation(s)
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.map((conv) => {
            const isSelected = selectedConv?.id === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={`w-full text-left p-4 transition-all flex flex-col gap-1 relative ${
                  isSelected
                    ? "bg-emerald-50/80 border-l-4 border-emerald-600"
                    : "hover:bg-slate-100/60"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm truncate">
                    {conv.nom}
                  </span>
                  {!conv.read && (
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                  )}
                </div>
                <span className="text-xs font-semibold text-emerald-700 truncate">
                  {conv.sujet}
                </span>
                <p className="text-xs text-slate-500 truncate">
                  {conv.lastMessage}
                </p>
              </button>
            );
          })}

          {conversations.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Aucun message reçu pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* COLONNE DROITE : Zone de Chat */}
      {selectedConv ? (
        <div className="w-2/3 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedConv.nom}
              </h3>
              <p className="text-xs text-slate-500">{selectedConv.email}</p>
            </div>
            <span className="text-xs bg-slate-100 font-medium text-slate-600 px-3 py-1 rounded-full border border-slate-200">
              {selectedConv.sujet}
            </span>
          </div>

          {/* Les Bulles de Message */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
            {messages.map((msg, index) => {
              const isAdmin = msg.sender === "admin";
              const isEditing = editingMsgId === msg.id;

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col group ${
                    isAdmin ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[80%]">
                    {/* Boutons d'action pour l'admin (modifier / supprimer) */}
                    {isAdmin && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => {
                            setEditingMsgId(msg.id);
                            setEditText(msg.text);
                          }}
                          className="text-slate-400 hover:text-emerald-600 p-1 text-xs"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-slate-400 hover:text-red-600 p-1 text-xs"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    {/* Contenu de la bulle */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed w-full ${
                        isAdmin
                          ? "bg-emerald-700 text-white rounded-br-none shadow-sm"
                          : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="bg-emerald-800 text-white px-2 py-1 rounded text-xs outline-none border border-emerald-500"
                          />
                          <div className="flex justify-end gap-2 text-[10px]">
                            <button
                              onClick={() => setEditingMsgId(null)}
                              className="underline text-slate-200"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSaveEdit(msg.id)}
                              className="bg-white text-emerald-800 px-2 py-0.5 rounded font-bold"
                            >
                              Valider
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                  </div>

                  {msg.createdAt && (
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form
            onSubmit={handleSendReply}
            className="p-3 border-t border-slate-100 flex gap-2 bg-white"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Répondre à ${selectedConv.nom}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-slate-800"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              {sending ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-2/3 flex items-center justify-center text-slate-400 text-sm">
          Sélectionnez une conversation pour échanger.
        </div>
      )}
    </div>
  );
}