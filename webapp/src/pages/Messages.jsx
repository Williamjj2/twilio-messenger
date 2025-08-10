import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Contact, Conversation, Message, User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core"; // Updated import
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ConversationList from "../components/messages/ConversationList";
import ConversationView from "../components/messages/ConversationView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Smartphone, AlertTriangle } from "lucide-react";

function TwilioNumberWarning({ onGoToSettings }) {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-md mx-auto p-6">
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <AlertTitle className="text-orange-800">Configuração Necessária</AlertTitle>
                    <AlertDescription className="text-orange-700 mb-4">
                        Para usar o aplicativo de mensagens, você precisa configurar seu número do Twilio.
                    </AlertDescription>
                    <Button 
                        onClick={onGoToSettings}
                        className="w-full bg-blue-500 hover:bg-blue-600 gap-2"
                    >
                        <Smartphone className="w-4 h-4" />
                        Ir para Configurações
                    </Button>
                </Alert>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showConversation, setShowConversation] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Busca inicial de dados
    useEffect(() => {
        const initialize = async () => {
            try {
                const user = await User.me();
                if (!user.twilio_phone_number) {
                    // Temporariamente define número para teste
                    await User.updateMyUserData({ twilio_phone_number: "+18663509407" }); 
                    const updatedUser = await User.me();
                    setCurrentUser(updatedUser);
                } else {
                    setCurrentUser(user);
                }
                
                await loadData();

                const params = new URLSearchParams(location.search);
                const conversationIdFromUrl = params.get("conversationId");
                if (conversationIdFromUrl) {
                    setSelectedConversationId(conversationIdFromUrl);
                    setShowConversation(true);
                }
            } catch (e) {
                console.error("Falha ao inicializar: ", e);
            }
        };
        initialize();
    }, [location.search]);

    // Lógica para marcar como lido e carregar mensagens
    useEffect(() => {
        if (selectedConversationId) {
            loadMessages(selectedConversationId);
            markAsRead(selectedConversationId);
        } else {
            setMessages([]);
        }
    }, [selectedConversationId]);

  // Atualização automática das mensagens (polling) enquanto a conversa está selecionada
  useEffect(() => {
    if (!selectedConversationId) return;
    const intervalId = setInterval(() => {
      loadMessages(selectedConversationId);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [selectedConversationId]);

  // Realtime via Supabase (se disponível). Ao receber insert/update, recarrega mensagens
  useEffect(() => {
    if (!selectedConversationId) return;
    if (!supabase) return; // sem envs VITE_*, mantém polling
    const channel = supabase.channel(`messages:conversation:${selectedConversationId}`);
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversationId}` },
        () => {
          loadMessages(selectedConversationId);
        }
      )
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch (_) {}
    };
  }, [selectedConversationId]);

    const loadData = async () => {
        try {
            const [conversationsData, contactsData] = await Promise.all([
                Conversation.list("-last_message_time"),
                Contact.list()
            ]);
            setConversations(conversationsData);
            setContacts(contactsData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar conversas");
        }
    };
    
    const handleRefresh = async () => {
        setIsSyncing(true);
        toast.info("Sincronizando mensagens...");
        await loadData();
        if(selectedConversationId) {
            await loadMessages(selectedConversationId);
        }
        setTimeout(() => {
            setIsSyncing(false);
            toast.success("Mensagens sincronizadas!");
        }, 1000);
    }
    
    const handleNewConversation = async (contact) => {
        try {
            let existingConversations = await Conversation.filter({ contact_id: contact.id });
            
            let conversationId;
            
            if (existingConversations.length > 0) {
                conversationId = existingConversations[0].id;
            } else {
                const newConversation = await Conversation.create({
                    contact_id: contact.id,
                    last_message: "Conversa iniciada...",
                    last_message_time: new Date().toISOString(),
                });
                conversationId = newConversation.id;
                await loadData();
            }
            
            handleSelectConversation(conversationId);

        } catch (error) {
            console.error("Erro ao criar nova conversa:", error);
            toast.error("Não foi possível iniciar a conversa.");
        }
    };

    const handleSendToNewNumber = async (phoneNumber) => {
        try {
            let existingContacts = await Contact.filter({ phone: phoneNumber });
            
            let contact;
            if (existingContacts.length > 0) {
                contact = existingContacts[0];
            } else {
                contact = await Contact.create({
                    name: phoneNumber,
                    phone: phoneNumber,
                });
                toast.success(`Novo contato criado: ${phoneNumber}`);
            }
            
            let existingConversations = await Conversation.filter({ contact_id: contact.id });
            
            let conversationId;
            if (existingConversations.length > 0) {
                conversationId = existingConversations[0].id;
            } else {
                const newConversation = await Conversation.create({
                    contact_id: contact.id,
                    last_message: "Conversa iniciada...",
                    last_message_time: new Date().toISOString(),
                });
                conversationId = newConversation.id;
            }
            
            await loadData();
            handleSelectConversation(conversationId);
            
            toast.info(`Conversa iniciada com ${phoneNumber}`);

        } catch (error) {
            console.error("Erro ao iniciar conversa com novo número:", error);
            toast.error("Não foi possível iniciar a conversa.");
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            const messagesData = await Message.filter({ conversation_id: conversationId }, "created_date");
            setMessages(messagesData);
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error);
            toast.error("Erro ao carregar mensagens");
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            const conv = conversations.find(c => c.id === conversationId);
            if (conv && conv.unread_count > 0) {
                await Conversation.update(conversationId, { unread_count: 0 });
                await loadData();
            }
        } catch (error) {
            console.error("Erro ao marcar como lida:", error);
        }
    };

    const handleSelectConversation = (conversationId) => {
        setSelectedConversationId(conversationId);
        setShowConversation(true);
        navigate(createPageUrl(`Messages?conversationId=${conversationId}`), { replace: true });
    };

    const handleSendMessage = async (content) => {
        if (!selectedConversationId || !currentUser?.twilio_phone_number) return;
        setIsLoading(true);
        const promise = async () => {
            const conversation = conversations.find(c => c.id === selectedConversationId);
            const contact = contacts.find(c => c.id === conversation?.contact_id);
            if (!contact) throw new Error("Contato não encontrado");
            const resp = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: contact.phone, body: content })
            });
            const json = await resp.json();
            if (!resp.ok || json.error) {
                throw new Error(json.error || 'Falha ao enviar');
            }
        };

        toast.promise(promise(), {
            loading: 'Enviando mensagem...',
            success: () => {
                loadData();
                loadMessages(selectedConversationId);
                setIsLoading(false);
                return 'Mensagem enviada!';
            },
            error: (err) => {
                setIsLoading(false);
                return `Erro: ${err.message}`;
            },
        });
    };

    const handleSendMedia = async (file, caption) => {
        if (!selectedConversationId || !currentUser?.twilio_phone_number) return;
        setIsLoading(true);
        const promise = async () => {
            const conversation = conversations.find(c => c.id === selectedConversationId);
            const contact = contacts.find(c => c.id === conversation?.contact_id);
            if (!contact) throw new Error("Contato não encontrado");
            throw new Error('Envio de mídia pela UI requer URL pública. Use o painel em /api/ui passando mediaUrls ou forneça uma URL pública no backend.');
        };
        
        toast.promise(promise(), {
            loading: 'Enviando mídia...',
            success: () => {
                loadData();
                loadMessages(selectedConversationId);
                setIsLoading(false);
                return 'Mídia enviada!';
            },
            error: (err) => {
                setIsLoading(false);
                return `Erro: ${err.message}`;
            },
        });
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const selectedContact = selectedConversation ? contacts.find(c => c.id === selectedConversation.contact_id) : null;

    if (currentUser && !currentUser.twilio_phone_number) {
        return <TwilioNumberWarning onGoToSettings={() => navigate(createPageUrl("Settings"))} />;
    }
  
    const handleBack = () => {
        setShowConversation(false);
        setSelectedConversationId(null);
        navigate(createPageUrl('Messages'), { replace: true });
    };

    return (
        <div className="h-screen flex">
            <div className={`${showConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 border-r border-white/20 bg-white/50 backdrop-blur-sm`}>
                <ConversationList
                    conversations={conversations}
                    contacts={contacts}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onSendToNewNumber={handleSendToNewNumber}
                    onRefresh={handleRefresh}
                />
            </div>

            <div className={`${showConversation ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 lg:w-3/4`}>
                <ConversationView
                    conversation={selectedConversation}
                    contact={selectedContact}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onSendMedia={handleSendMedia}
                    onBack={handleBack}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}


