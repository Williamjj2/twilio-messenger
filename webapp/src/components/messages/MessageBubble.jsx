import React from "react";
import { format } from "date-fns";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MessageBubble({ message, isOutgoing }) {
  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400" />;
      case "sent":
        return <Check className="w-3 h-3 text-gray-500" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (message.message_type === "text") {
      return (
        <p className="text-sm leading-relaxed break-words">
          {message.content}
        </p>
      );
    } else if (message.message_type === "image") {
      return (
        <div className="space-y-2">
          <img
            src={message.media_url}
            alt="Imagem enviada"
            className="max-w-xs rounded-xl shadow-sm"
            loading="lazy"
          />
          {message.content && (
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          )}
        </div>
      );
    } else if (message.message_type === "video") {
      return (
        <div className="space-y-2">
          <video
            src={message.media_url}
            controls
            className="max-w-xs rounded-xl shadow-sm"
          />
          {message.content && (
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOutgoing ? "ml-12" : "mr-12"}`}>
        <div
          className={`message-bubble px-4 py-3 rounded-3xl shadow-sm ${
            isOutgoing
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-lg"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-lg"
          }`}
        >
          {renderContent()}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 px-2 ${
          isOutgoing ? "justify-end" : "justify-start"
        }`}>
          <span className="text-xs text-gray-500">
            {format(new Date(message.created_date), "HH:mm")}
          </span>
          {isOutgoing && getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
}


