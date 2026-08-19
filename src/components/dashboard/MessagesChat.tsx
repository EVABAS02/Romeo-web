"use client";

import React, { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { auth } from "../../lib/firebaseAuth";
import { getIdToken } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { Conversation, MessageItem } from "../../types/chat";

interface MessagesChatProps {
  selectedConvId?: string | null;
  onSelectConv?: (id: string) => void;
}

export default function MessagesChat({
  selectedConvId,
  onSelectConv,
}: MessagesChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // Modification d'un message
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * ============================================================
   * SCROLL AUTOMATIQUE
   * ============================================================
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * ============================================================
   * 1. ÉCOUTER LES CONVERSATIONS
   * ============================================================
   */
  useEffect(() => {
    const conversationsRef = collection(db, "conversations");

    const conversationsQuery = query(
      conversationsRef,
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const convs = snapshot.docs.map((conversationDoc) => ({
          id: conversationDoc.id,
          ...conversationDoc.data(),
        })) as Conversation[];

        setConversations(convs);

        /**
         * Si le dashboard demande une conversation précise.
         */
        if (selectedConvId) {
          const requestedConversation = convs.find(
            (conversation) => conversation.id === selectedConvId
          );

          if (requestedConversation) {
            setSelectedConv(requestedConversation);
          }
        }

        /**
         * Si aucune conversation n'est sélectionnée,
         * sélectionner automatiquement la première.
         */
        setSelectedConv((previousConversation) => {
          if (selectedConvId) {
            return (
              convs.find(
                (conversation) =>
                  conversation.id === selectedConvId
              ) || previousConversation
            );
          }

          if (!previousConversation && convs.length > 0) {
            return convs[0];
          }

          if (previousConversation) {
            return (
              convs.find(
                (conversation) =>
                  conversation.id === previousConversation.id
              ) || previousConversation
            );
          }

          return null;
        });
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération des conversations :",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [selectedConvId]);

  /**
   * ============================================================
   * 2. ÉCOUTER LES MESSAGES DE LA CONVERSATION
   * ============================================================
   */
  useEffect(() => {
    if (!selectedConv?.id) {
      setMessages([]);
      return;
    }

    /**
     * Marquer la conversation comme lue.
     */
    if (!selectedConv.read) {
      updateDoc(doc(db, "conversations", selectedConv.id), {
        read: true,
      }).catch((error) => {
        console.error(
          "Erreur lors du marquage comme lu :",
          error
        );
      });
    }

    const messagesRef = collection(
      db,
      "conversations",
      selectedConv.id,
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        })) as MessageItem[];

        setMessages(msgs);
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération des messages :",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [selectedConv?.id]);

  /**
   * ============================================================
   * 3. SÉLECTIONNER UNE CONVERSATION
   * ============================================================
   */
  const handleSelect = (conversation: Conversation) => {
    setSelectedConv(conversation);

    if (onSelectConv) {
      onSelectConv(conversation.id);
    }
  };

  /**
   * ============================================================
   * 4. ENVOYER UNE RÉPONSE
   * ============================================================
   */
  const handleSendReply = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedConv?.id) {
      return;
    }

    const textToSend = replyText.trim();

    if (!textToSend) {
      return;
    }

    /**
     * Vérifier que l'admin est connecté.
     */
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("Aucun administrateur connecté.");
      alert("Votre session administrateur a expiré.");
      return;
    }

    setSending(true);

    try {
      /**
       * ========================================================
       * ÉTAPE 1 — ENREGISTRER LA RÉPONSE DANS FIRESTORE
       * ========================================================
       */
      await addDoc(
        collection(
          db,
          "conversations",
          selectedConv.id,
          "messages"
        ),
        {
          text: textToSend,
          sender: "admin",
          createdAt: serverTimestamp(),
        }
      );

      /**
       * ========================================================
       * ÉTAPE 2 — METTRE À JOUR LA CONVERSATION
       * ========================================================
       */
      await updateDoc(
        doc(db, "conversations", selectedConv.id),
        {
          lastMessage: textToSend,
          updatedAt: serverTimestamp(),
          read: true,
        }
      );

      /**
       * ========================================================
       * ÉTAPE 3 — RÉCUPÉRER LE TOKEN FIREBASE
       * ========================================================
       */
      const idToken = await getIdToken(currentUser);

      /**
       * ========================================================
       * ÉTAPE 4 — ENVOYER L'EMAIL VIA NOTRE API
       * ========================================================
       */
      const response = await fetch("/api/send-reply", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },

        body: JSON.stringify({
          conversationId: selectedConv.id,
          to: selectedConv.email,
          subject:
            selectedConv.sujet ||
            "Réponse à votre message",
          replyText: textToSend,
          recipientName: selectedConv.nom,
        }),
      });

      /**
       * L'API doit répondre avec un statut HTTP 2xx.
       */
      if (!response.ok) {
        let errorMessage =
          "Impossible d'envoyer l'email.";

        try {
          const errorData = await response.json();

          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // La réponse n'est peut-être pas du JSON.
        }

        throw new Error(errorMessage);
      }

      /**
       * Nettoyer le champ après succès.
       */
      setReplyText("");

      console.log(
        "Réponse enregistrée et email envoyé avec succès."
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de la réponse :",
        error
      );

      /**
       * Si Firestore a accepté le message mais
       * que l'email échoue, le message reste dans le chat.
       */
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi."
      );
    } finally {
      setSending(false);
    }
  };

  /**
   * ============================================================
   * 5. SUPPRIMER UN MESSAGE
   * ============================================================
   */
  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedConv?.id || !msgId) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce message ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "conversations",
          selectedConv.id,
          "messages",
          msgId
        )
      );
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du message :",
        error
      );

      alert(
        "Impossible de supprimer ce message."
      );
    }
  };

  /**
   * ============================================================
   * 6. MODIFIER UN MESSAGE
   * ============================================================
   */
  const handleSaveEdit = async (msgId: string) => {
    if (!selectedConv?.id || !msgId) {
      return;
    }

    const text = editText.trim();

    if (!text) {
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "conversations",
          selectedConv.id,
          "messages",
          msgId
        ),
        {
          text,
        }
      );

      setEditingMsgId(null);
      setEditText("");
    } catch (error) {
      console.error(
        "Erreur lors de la modification du message :",
        error
      );

      alert(
        "Impossible de modifier ce message."
      );
    }
  };

  /**
   * ============================================================
   * 7. FORMATAGE DE L'HEURE
   * ============================================================
   */
  const formatTime = (
    timestamp:
      | Timestamp
      | Date
      | number
      | string
      | null
      | undefined
  ) => {
    if (!timestamp) {
      return "";
    }

    try {
      let date: Date;

      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  /**
   * ============================================================
   * RENDU
   * ============================================================
   */
  return (
    <div className="flex h-[650px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

      {/* ======================================================
          COLONNE GAUCHE — LISTE DES CONVERSATIONS
      ======================================================= */}
      <div className="flex w-1/3 flex-col border-r border-slate-100 bg-slate-50/50">

        <div className="border-b border-slate-100 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-800">
            Messages reçus
          </h2>

          <p className="text-xs text-slate-500">
            {conversations.length} conversation(s)
          </p>
        </div>

        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">

          {conversations.map((conversation) => {
            const isSelected =
              selectedConv?.id === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() =>
                  handleSelect(conversation)
                }
                className={`relative flex w-full flex-col gap-1 p-4 text-left transition-all ${
                  isSelected
                    ? "border-l-4 border-emerald-600 bg-emerald-50/80"
                    : "hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center justify-between">

                  <span className="truncate text-sm font-bold text-slate-800">
                    {conversation.nom}
                  </span>

                  {!conversation.read && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                  )}

                </div>

                <span className="truncate text-xs font-semibold text-emerald-700">
                  {conversation.sujet}
                </span>

                <p className="truncate text-xs text-slate-500">
                  {conversation.lastMessage}
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

      {/* ======================================================
          COLONNE DROITE — CHAT
      ======================================================= */}
      {selectedConv ? (

        <div className="flex w-2/3 flex-col bg-white">

          {/* HEADER CHAT */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/30 p-4">

            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedConv.nom}
              </h3>

              <p className="text-xs text-slate-500">
                {selectedConv.email}
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {selectedConv.sujet}
            </span>

          </div>

          {/* MESSAGES */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/20 p-4">

            {messages.map((msg, index) => {
              const isAdmin = msg.sender === "admin";
              const isEditing =
                msg.id === editingMsgId;

              return (
                <div
                  key={msg.id || index}
                  className={`group flex flex-col ${
                    isAdmin
                      ? "items-end"
                      : "items-start"
                  }`}
                >

                  <div className="flex max-w-[80%] items-center gap-2">

                    {/* ACTIONS ADMIN */}
                    {isAdmin && !isEditing && (
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">

                        <button
                          type="button"
                          onClick={() => {
                            setEditingMsgId(
                              msg.id ?? null
                            );
                            setEditText(msg.text);
                          }}
                          className="p-1 text-xs text-slate-400 hover:text-emerald-600"
                          title="Modifier"
                          aria-label="Modifier le message"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            msg.id &&
                            handleDeleteMessage(msg.id)
                          }
                          className="p-1 text-xs text-slate-400 hover:text-red-600"
                          title="Supprimer"
                          aria-label="Supprimer le message"
                        >
                          🗑️
                        </button>

                      </div>
                    )}

                    {/* BULLE */}
                    <div
                      className={`w-full rounded-2xl p-3.5 text-xs leading-relaxed ${
                        isAdmin
                          ? "rounded-br-none bg-emerald-700 text-white shadow-sm"
                          : "rounded-bl-none border border-slate-200/60 bg-slate-100 text-slate-800"
                      }`}
                    >

                      {isEditing ? (

                        <div className="flex flex-col gap-2">

                          <input
                            type="text"
                            value={editText}
                            onChange={(event) =>
                              setEditText(
                                event.target.value
                              )
                            }
                            className="rounded border border-emerald-500 bg-emerald-800 px-2 py-1 text-xs text-white outline-none"
                            autoFocus
                          />

                          <div className="flex justify-end gap-2 text-[10px]">

                            <button
                              type="button"
                              onClick={() => {
                                setEditingMsgId(null);
                                setEditText("");
                              }}
                              className="text-slate-200 underline"
                            >
                              Annuler
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                msg.id &&
                                handleSaveEdit(msg.id)
                              }
                              className="rounded bg-white px-2 py-0.5 font-bold text-emerald-800"
                            >
                              Valider
                            </button>

                          </div>
                        </div>

                      ) : (

                        <p className="whitespace-pre-wrap">
                          {msg.text}
                        </p>

                      )}

                    </div>
                  </div>

                  {msg.createdAt && (
                    <span className="mt-1 px-1 text-[10px] text-slate-400">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}

                </div>
              );
            })}

            <div ref={messagesEndRef} />

          </div>

          {/* FORMULAIRE */}
          <form
            onSubmit={handleSendReply}
            className="flex gap-2 border-t border-slate-100 bg-white p-3"
          >

            <input
              type="text"
              value={replyText}
              onChange={(event) =>
                setReplyText(event.target.value)
              }
              placeholder={`Répondre à ${selectedConv.nom}...`}
              disabled={sending}
              maxLength={2000}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800 outline-none transition-all focus:ring-2 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                sending || !replyText.trim()
              }
              className="cursor-pointer rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Envoi..." : "Envoyer"}
            </button>

          </form>

        </div>

      ) : (

        <div className="flex w-2/3 items-center justify-center text-sm text-slate-400">
          Sélectionnez une conversation pour échanger.
        </div>

      )}

    </div>
  );
}