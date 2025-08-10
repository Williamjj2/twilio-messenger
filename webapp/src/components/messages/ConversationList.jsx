import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { MessageCircle, SquarePen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewConversationModal from "./NewConversationModal";

export default function ConversationList({ 
  conversations, 
  contacts, 
  selectedConversationId, 
  onSelectConversation,
  onNewConversation,
  onSendToNewNumber,
  onRefresh
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getContact = (contactId) => {
    return contacts.find(c => c.id === contactId) || {};
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const handleSelectContactForNewConversation = (contact) => {
    onNewConversation(contact);
    setIsModalOpen(false);
  }

  const handleSendToNewNumber = (phoneNumber) => {
    onSendToNewNumber(phoneNumber);
    setIsModalOpen(false);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/20">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Mensagens</h2>
            <div className="flex gap-2">
                 <Button variant="ghost" size="icon" onClick={onRefresh} className="hover:bg-gray-100 rounded-full">
                    <RefreshCw className="w-5 h-5 text-gray-600"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)} className="hover:bg-gray-100 rounded-full">
                    <SquarePen className="w-6 h-6 text-gray-600"/>
                </Button>
            </div>
        </div>
        <p className="text-gray-500 mt-1">{conversations.length} conversas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {conversations.map((conversation) => {
            const contact = getContact(conversation.contact_id);
            const isSelected = selectedConversationId === conversation.id;
            
            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 shadow-md' 
                      : 'bg-white/80 hover:bg-white backdrop-blur-sm'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.photo_url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unread_count > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 hover:bg-red-600"
                        >
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {contact.name || contact.phone || "Desconhecido"}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.last_message_time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message || "Nenhuma mensagem ainda"}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
          
          {conversations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MessageCircle className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-500">Nenhuma conversa ainda</p>
              <p className="text-sm text-gray-400">Suas mensagens aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>

      <NewConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contacts={contacts}
        onSelectContact={handleSelectContactForNewConversation}
        onSendToNewNumber={handleSendToNewNumber}
      />
    </div>
  );
}


