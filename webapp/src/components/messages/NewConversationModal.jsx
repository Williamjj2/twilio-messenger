import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Phone } from "lucide-react";

export default function NewConversationModal({ isOpen, onClose, contacts, onSelectContact, onSendToNewNumber }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const handleSelectContact = (contact) => {
    onSelectContact(contact);
    onClose();
  };

  const handleSendToNewNumber = () => {
    if (newNumber.trim()) {
      onSendToNewNumber(newNumber.trim());
      setNewNumber("");
      onClose();
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone.startsWith('+')) {
      return '+' + phone;
    }
    return phone;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>
            Selecione um contato existente ou digite um novo número.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="number">Novo Número</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contacts" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar contatos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
              {filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.photo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-800">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum contato encontrado.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="number" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input
                id="phone"
                placeholder="+5511999999999"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="pl-3"
              />
              <p className="text-xs text-gray-500">
                Inclua o código do país (ex: +55 para Brasil)
              </p>
            </div>
            <Button 
              onClick={handleSendToNewNumber}
              disabled={!newNumber.trim()}
              className="w-full bg-blue-500 hover:bg-blue-600 gap-2"
            >
              <Phone className="w-4 h-4" />
              Iniciar Conversa
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


