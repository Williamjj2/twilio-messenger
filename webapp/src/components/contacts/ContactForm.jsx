import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, Image as ImageIcon, X } from "lucide-react";

export default function ContactForm({ contact, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState(contact || {
    name: "",
    phone: "",
    photo_url: "",
    is_favorite: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-effect">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.photo_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl">
              {getInitials(formData.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {contact ? "Editar Contato" : "Novo Contato"}
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome completo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+55 11 99999-9999"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photo_url" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Foto (URL)
            </Label>
            <Input
              id="photo_url"
              value={formData.photo_url}
              onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


