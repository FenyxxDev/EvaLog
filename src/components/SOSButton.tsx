import { useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SOSButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [description, setDescription] = useState("");

  const handleEmitAlert = () => {
    if (!alertType) {
      toast.error("Selecione o tipo de emergência");
      return;
    }

    // Simulate alert emission
    toast.success("Alerta emitido com sucesso! Aguardando resposta dos operadores.");
    setDialogOpen(false);
    setAlertType("");
    setDescription("");
  };

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-destructive hover:bg-destructive/90 animate-pulse z-20"
        onClick={() => setDialogOpen(true)}
      >
        <AlertOctagon className="h-8 w-8" />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertOctagon className="h-6 w-6" />
              Emitir Alerta de Emergência
            </DialogTitle>
            <DialogDescription>
              Selecione o tipo de emergência e forneça detalhes. Sua localização será enviada automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-type">Tipo de Emergência *</Label>
              <Select value={alertType} onValueChange={setAlertType}>
                <SelectTrigger id="alert-type">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fire">🔥 Incêndio</SelectItem>
                  <SelectItem value="gas">💨 Vazamento de Gás</SelectItem>
                  <SelectItem value="structural">🏗️ Problema Estrutural</SelectItem>
                  <SelectItem value="medical">🚑 Emergência Médica</SelectItem>
                  <SelectItem value="security">🚨 Segurança</SelectItem>
                  <SelectItem value="other">❓ Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva a situação..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">⚠️ Importante:</p>
              <p className="text-muted-foreground">
                Um alerta será enviado imediatamente para os operadores e equipes de emergência. Use apenas em situações reais.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleEmitAlert} className="w-full sm:w-auto bg-destructive hover:bg-destructive/90">
              Emitir Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
