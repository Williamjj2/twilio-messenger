import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, VideoIcon, Info, ArrowLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ConversationView({
  conversation,
  contact,
  messages,
  onSendMessage,
  onSendMedia,
  onBack,
  isLoading
}) {
  const messagesEndRef = useRef(null);
  const [myPhone, setMyPhone] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.created_date), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Hoje";
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Ontem";
    } else {
      return format(date, "dd/MM/yyyy");
    }
  };

  if (!conversation || !contact) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha um contato para começar a conversar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 p-4 bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={contact.photo_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {contact.name || contact.phone}
          </h3>
          <p className="text-sm text-gray-500">{contact.phone}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <Phone className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <VideoIcon className="w-5 h-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <Info className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <div className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-medium text-gray-500 shadow-sm">
                  {formatDateHeader(date)}
                </div>
              </div>
              
              {dateMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOutgoing={message.is_outgoing}
                />
              ))}
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">Nenhuma mensagem ainda</p>
              <p className="text-sm text-gray-400">
                Envie uma mensagem para começar a conversa
              </p>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        onSendMedia={onSendMedia}
        isLoading={isLoading}
        selectedConversation={conversation}
      />
    </div>
  );
}


