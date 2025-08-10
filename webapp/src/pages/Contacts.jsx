import React, { useState, useEffect } from "react";
import { Contact, Conversation } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ContactCard from "../components/contacts/ContactCard";
import ContactForm from "../components/contacts/ContactForm";

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await Contact.list("-created_date");
      setContacts(data);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    }
  };

  const handleSaveContact = async (contactData) => {
    setIsLoading(true);
    try {
      if (editingContact) {
        await Contact.update(editingContact.id, contactData);
      } else {
        await Contact.create(contactData);
      }
      
      setShowForm(false);
      setEditingContact(null);
      loadContacts();
    } catch (error) {
      console.error("Erro ao salvar contato:", error);
    }
    setIsLoading(false);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleMessageContact = async (contact) => {
    try {
      let existingConversations = await Conversation.filter({ contact_id: contact.id });
      
      let conversationId;
      
      if (existingConversations.length > 0) {
        conversationId = existingConversations[0].id;
      } else {
        const newConversation = await Conversation.create({
          contact_id: contact.id,
          last_message: `Iniciando conversa com ${contact.name}`,
          last_message_time: new Date().toISOString(),
          unread_count: 0
        });
        conversationId = newConversation.id;
      }
      
      navigate(createPageUrl(`Messages?conversationId=${conversationId}`));
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
    }
  };

  const handleCallContact = (contact) => {
    alert(`Ligando para ${contact.name} - ${contact.phone}`);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              Contatos
            </h1>
            <p className="text-gray-500 mt-1">{contacts.length} contatos salvos</p>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Contato
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70 backdrop-blur-sm border-white/50"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center h-full"
              >
                <ContactForm
                  contact={editingContact}
                  onSave={handleSaveContact}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingContact(null);
                  }}
                  isLoading={isLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="contacts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto"
              >
                {filteredContacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredContacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onEdit={handleEditContact}
                        onMessage={handleMessageContact}
                        onCall={handleCallContact}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {searchTerm ? "Nenhum contato encontrado" : "Nenhum contato ainda"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? "Tente alterar os termos de busca"
                        : "Adicione seus primeiros contatos para começar"
                      }
                    </p>
                    {!searchTerm && (
                      <Button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Adicionar Contato
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


