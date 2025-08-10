import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, Mail, User as UserIcon, Smartphone, Info } from "lucide-react";

function ProfileForm({ user, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    full_name: "",
    photo_url: "",
    twilio_phone_number: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        photo_url: user.photo_url || "",
        twilio_phone_number: user.twilio_phone_number || "",
      });
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.photo_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xl">
              {getInitials(formData.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <Label htmlFor="photo_url">URL da Foto de Perfil</Label>
            <Input id="photo_url" value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} placeholder="https://exemplo.com/foto.jpg" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name" className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-gray-500" />Nome Completo</Label>
          <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" />Email</Label>
          <Input id="email" value={user.email} disabled />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            Configuração do Número Twilio
          </h3>
          <div className="space-y-2">
            <Label htmlFor="twilio_phone_number">Seu Número Twilio</Label>
            <Input id="twilio_phone_number" value={formData.twilio_phone_number} onChange={(e) => setFormData({ ...formData, twilio_phone_number: e.target.value })} placeholder="+18663509407" />
            <p className="text-xs text-gray-500">Este número será usado como remetente das suas mensagens.</p>
          </div>
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-700" />
            <AlertTitle className="text-blue-800">Credenciais Seguras</AlertTitle>
            <AlertDescription className="text-blue-700">Seu Account SID e Auth Token são armazenados de forma segura no backend.</AlertDescription>
          </Alert>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isLoading} className="gap-2 bg-blue-500 hover:bg-blue-600">
            <Save className="w-4 h-4" />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </CardContent>
    </form>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Usuário não autenticado", error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      await User.updateMyUserData(data);
      const updatedUser = await User.me();
      setUser(updatedUser);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Falha ao atualizar o perfil. Tente novamente.");
    }
    setIsLoading(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            Configurações
          </h1>
          <p className="text-gray-500 mt-1">Gerencie suas informações de perfil e configurações do aplicativo.</p>
        </header>
        <Card className="glass-effect mb-6">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Estas informações serão usadas para identificar você no aplicativo.</CardDescription>
          </CardHeader>
          <ProfileForm user={user} onSave={handleSave} isLoading={isLoading} />
        </Card>
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Configuração de Dados</CardTitle>
            <CardDescription>O sistema usa o backend deste projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Tudo Pronto!</AlertTitle>
              <AlertDescription>As entidades (Contact, Conversation, Message) são persistidas no banco.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


