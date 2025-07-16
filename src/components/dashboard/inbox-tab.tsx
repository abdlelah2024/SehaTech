
"use client"

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPatientInitials } from "@/lib/utils";
import {
  Archive,
  Trash2,
  Inbox,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { InboxMessage } from "@/lib/types";

interface InboxTabProps {
  messages: InboxMessage[];
}

export function InboxTab({ messages: initialMessages }: InboxTabProps) {
  const [messages, setMessages] = useState<InboxMessage[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  useEffect(() => {
    // Sort initial messages
    const sortedMessages = [...initialMessages].sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
    setMessages(sortedMessages);

    // Set selected message
    if (!selectedMessage && sortedMessages.length > 0) {
      setSelectedMessage(sortedMessages[0]);
    } else if (selectedMessage) {
      // update selected message if it's in the new list
      const updatedSelected = sortedMessages.find(m => m.id === selectedMessage.id);
      setSelectedMessage(updatedSelected || (sortedMessages.length > 0 ? sortedMessages[0] : null));
    } else if (sortedMessages.length > 0) {
        setSelectedMessage(sortedMessages[0]);
    }

  }, [initialMessages]);

  useEffect(() => {
    if (selectedMessage && !selectedMessage.read) {
       handleSelectMessage(selectedMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMessage]);


  const handleSelectMessage = async (message: InboxMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
        try {
            const messageRef = doc(db, "inboxMessages", message.id);
            await updateDoc(messageRef, { read: true });
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
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
                                </div>
                            </div>
                            <div className={cn("ml-auto text-xs", !message.read ? "text-foreground" : "text-muted-foreground")}>
                              {formatDistanceToNow(message.timestamp?.toDate() || new Date(), {
                                addSuffix: true,
                                locale: ar
                              })}
                            </div>
                        </div>
                        <div className="font-semibold">{message.title}</div>
                        <div className={cn("line-clamp-2 text-xs text-muted-foreground")}>
                            {message.content}
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
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" disabled>
                            <Archive className="h-4 w-4" />
                            <span className="sr-only">أرشفة</span>
                        </Button>
                        <Button variant="outline" size="icon" disabled>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">حذف</span>
                        </Button>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="text-right">
                            <div className="font-bold">{selectedMessage.from}</div>
                            <div className="text-xs text-muted-foreground">إلى: {auth.currentUser?.displayName || "أنا"}</div>
                        </div>
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${getPatientInitials(selectedMessage.from)}`} />
                            <AvatarFallback>{getPatientInitials(selectedMessage.from)}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                <div className="p-4">
                     <h3 className="text-lg font-bold">{selectedMessage.title}</h3>
                </div>
                 <Separator />
                 <div className="flex-1 p-6 text-sm">
                    <p className="whitespace-pre-wrap">
                       {selectedMessage.content}
                    </p>
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
