import { Timestamp } from 'firebase/firestore';

// Structure d'une conversation dans la collection "conversations"
export interface Conversation {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  lastMessage: string;
  updatedAt: Timestamp;
  read: boolean;
}

// Structure d'une bulle de message dans la sous-collection "messages"
export interface MessageItem {
  id?: string;
  text: string;
  sender: "client" | "admin";
  createdAt: Timestamp;
}