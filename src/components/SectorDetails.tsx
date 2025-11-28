import { X, Thermometer, Wind, Flame, Users, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sector } from "@/pages/Dashboard";
import { Progress } from "@/components/ui/progress";

interface SectorDetailsProps {
  sector: Sector;
  onClose: () => void;
}

const SectorDetails = ({ sector, onClose }: SectorDetailsProps) => {
  const getStatusColor = (status: Sector["status"]) => {
    switch (status) {
      case "safe":
        return "text-status-safe";
      case "caution":
        return "text-status-caution";
      case "warning":
        return "text-status-warning";
      case "danger":
        return "text-status-danger";
      case "evacuate":
        return "text-status-evacuate";
      default:
        return "text-muted-foreground";
    }
  };

  const occupancyPercentage = (sector.occupancy / sector.capacity) * 100;

  return (
    <div className="fixed inset-x-0 bottom-0 md:right-0 md:top-0 md:left-auto md:w-96 z-30 animate-in slide-in-from-bottom md:slide-in-from-right">
      <Card className="h-full md:h-screen rounded-t-2xl md:rounded-none shadow-2xl overflow-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">{sector.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status Atual</span>
            <span className={`text-lg font-bold ${getStatusColor(sector.status)}`}>
              {sector.status === "safe" && "🟢 Seguro"}
              {sector.status === "caution" && "🟡 Atenção"}
              {sector.status === "warning" && "🟠 Alerta"}
              {sector.status === "danger" && "🔴 Perigo"}
              {sector.status === "evacuate" && "🚨 Evacuação"}
            </span>
          </div>

          {/* Occupancy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Ocupação</span>
              </div>
              <span className="text-sm font-bold">{sector.occupancy}/{sector.capacity}</span>
            </div>
            <Progress value={occupancyPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {occupancyPercentage.toFixed(0)}% da capacidade total
            </p>
          </div>

          {/* Sensors */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Sensores Ambientais</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-primary" />
                  <span className="text-sm">Gás</span>
                </div>
                <span className="text-sm font-bold">{sector.sensors.gas} ppm</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="text-sm">Fumaça</span>
                </div>
                <span className="text-sm font-bold">{sector.sensors.smoke}%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span className="text-sm">Temperatura</span>
                </div>
                <span className="text-sm font-bold">{sector.sensors.temperature}°C</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t">
            <Button className="w-full" size="lg">
              <Navigation className="mr-2 h-4 w-4" />
              Ver Rotas de Evacuação
            </Button>
            
            <Button variant="outline" className="w-full" size="lg">
              <AlertCircle className="mr-2 h-4 w-4" />
              Marcar como Seguro
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-semibold mb-1">Última atualização:</p>
            <p>{new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SectorDetails;
