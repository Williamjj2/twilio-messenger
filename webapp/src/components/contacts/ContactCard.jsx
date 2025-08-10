import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Phone, Edit, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactCard({ contact, onEdit, onMessage, onCall }) {
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 border border-white/50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={contact.photo_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {contact.name}
                  {contact.is_favorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">{contact.phone}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(contact)}
              className="hover:bg-gray-100 rounded-full"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onMessage(contact)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Mensagem
            </Button>
            <Button
              variant="outline"
              onClick={() => onCall(contact)}
              className="gap-2 hover:bg-gray-50"
            >
              <Phone className="w-4 h-4" />
              Ligar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


