
"use client"

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPatientInitials } from "@/lib/utils";
import {
  Archive,
  ArchiveX,
  File,
  Inbox,
  Send,
  Trash2,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import type { InboxMessage } from "@/lib/types";

export function InboxTab() {
  const [currentUser] = useAuthState(auth);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    // In a real app, you'd query for messages where recipientId === currentUser.uid
    const q = query(collection(db, "inboxMessages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as InboxMessage);
      setMessages(msgs);
      if (!selectedMessage && msgs.length > 0) {
        setSelectedMessage(msgs[0]);
      } else if (selectedMessage) {
        // update selected message if it's in the new list
        const updatedSelected = msgs.find(m => m.id === selectedMessage.id);
        setSelectedMessage(updatedSelected || null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSelectMessage = async (message: InboxMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
        const messageRef = doc(db, "inboxMessages", message.id);
        await updateDoc(messageRef, { read: true });
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex h-full">
        <div className="w-80 border-r">
          <div className="p-4">
            <h2 className="text-xl font-bold tracking-tight">البريد الوارد</h2>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="p-2">
                {messages.map((message) => (
                    <button
                        key={message.id}
                        className={cn(
                        "flex w-full flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                        selectedMessage?.id === message.id && "bg-muted"
                        )}
                        onClick={() => handleSelectMessage(message)}
                    >
                        <div className="flex w-full items-center">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${getPatientInitials(message.from)}`} />
                                    <AvatarFallback>{getPatientInitials(message.from)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className={cn("font-semibold", !message.read && "font-bold")}>{message.from}</div>
                                    <div className={cn("text-xs", !message.read ? "text-foreground" : "text-muted-foreground")}>
                                      {formatDistanceToNow(message.timestamp?.toDate() || new Date(), {
                                        addSuffix: true,
                                        locale: ar
                                      })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cn("line-clamp-2 text-xs", !message.read ? "text-foreground" : "text-muted-foreground")}>
                            {message.title}
                        </div>
                    </button>
                ))}
                {messages.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                        <Inbox className="mx-auto h-12 w-12" />
                        <p>لا توجد رسائل جديدة.</p>
                    </div>
                )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex-1">
          {selectedMessage ? (
             <div className="flex h-full flex-col">
                <div className="flex items-center p-4 border-b">
                    <h3 className="text-lg font-bold">{selectedMessage.title}</h3>
                </div>
                 <div className="flex-1 p-6">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                       {selectedMessage.content}
                    </p>
                </div>
                 <div className="border-t p-4 flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" disabled>
                        <Archive className="h-4 w-4" />
                        <span className="sr-only">أرشفة</span>
                    </Button>
                    <Button variant="outline" size="icon" disabled>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">حذف</span>
                    </Button>
                </div>
             </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>اختر رسالة لعرضها</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
