import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Image, Video, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageInput({ 
  onSendMessage, 
  onSendMedia, 
  isLoading,
  selectedConversation 
}) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSend = () => {
    if (selectedFile) {
      onSendMedia(selectedFile, message);
      setSelectedFile(null);
    } else if (message.trim()) {
      onSendMessage(message);
    }
    setMessage("");
    setShowAttachments(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachments(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="p-6 text-center text-gray-500">
        Selecione uma conversa para enviar mensagens
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/80 backdrop-blur-lg border-t border-white/20">
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedFile.type.startsWith("image/") ? (
                  <Image className="w-5 h-5 text-blue-500" />
                ) : (
                  <Video className="w-5 h-5 text-purple-500" />
                )}
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <AnimatePresence>
            {showAttachments && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-lg border border-gray-200 p-2"
              >
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-blue-50"
                      asChild
                    >
                      <div>
                        <Image className="w-4 h-4 text-blue-500" />
                        Foto
                      </div>
                    </Button>
                  </label>
                  
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 hover:bg-purple-50"
                      asChild
                    >
                      <div>
                        <Video className="w-4 h-4 text-purple-500" />
                        Vídeo
                      </div>
                    </Button>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[40px] max-h-32 resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={isLoading || (!message.trim() && !selectedFile)}
          className="rounded-full bg-blue-500 hover:bg-blue-600 p-3"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}


