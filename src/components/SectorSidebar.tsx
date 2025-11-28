import { Navigation, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Defina a interface Sector aqui
interface Sector {
  id: string;
  name: string;
  status: "safe" | "caution" | "warning" | "danger" | "evacuate";
  occupancy: number;  // Note: é occupancy, não currentOccupancy
  capacity: number;
  sensors: {
    gas: number;
    smoke: number;
    temperature: number;
    crowd?: number;
  };
  coordinates: [number, number][];
  floor: string;
  mapPosition: { x: number; y: number };
}

interface SectorSidebarProps {
  sector: Sector;
  onMarkAsSafe: (sectorId: string) => void;
  onShowEvacuationRoutes: (sectorId: string) => void;
  className?: string;
}

const SectorSidebar = ({ 
  sector, 
  onMarkAsSafe, 
  onShowEvacuationRoutes,
  className = "" 
}: SectorSidebarProps) => {
  
  const getStatusColor = (status: Sector["status"]) => {
    switch (status) {
      case "safe": return "bg-status-safe";
      case "caution": return "bg-status-caution";
      case "warning": return "bg-status-warning";
      case "danger": return "bg-status-danger";
      case "evacuate": return "bg-status-evacuate";
      default: return "bg-muted";
    }
  };

  const getStatusText = (status: Sector["status"]) => {
    switch (status) {
      case "safe": return "Seguro";
      case "caution": return "Atenção";
      case "warning": return "Perigo";
      case "danger": return "Alto Risco";
      case "evacuate": return "Evacuar";
      default: return "Desconhecido";
    }
  };

  const getFloorText = (floor: string) => {
    switch (floor) {
      case "terreo": return "Térreo";
      case "primeiro": return "1º Andar";
      case "segundo": return "2º Andar";
      case "terceiro": return "3º Andar";
      case "quarto": return "4º Andar";
      default: return floor;
    }
  };

  return (
    <div className={`w-80 border-l bg-background overflow-y-auto ${className}`}>
      <Card className="border-0 shadow-none h-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{sector.name}</CardTitle>
            <Badge 
              variant="secondary" 
              className={getStatusColor(sector.status)}
            >
              {getStatusText(sector.status)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {getFloorText(sector.floor)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status e Ocupação */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status Atual</span>
              <span className="text-sm">{getStatusText(sector.status)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ocupação</span>
                <span>{sector.occupancy}/{sector.capacity}</span>  {/* occupancy */}
              </div>
              <Progress 
                value={(sector.occupancy / sector.capacity) * 100}  /* occupancy */
                className="h-2"
              />
            </div>
          </div>

          {/* Sensores Ambientais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Sensores Ambientais</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Gás</div>
                <div className="text-sm font-semibold">{sector.sensors?.gas || "0"} ppm</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Fumaça</div>
                <div className="text-sm font-semibold">{sector.sensors?.smoke || "0"}%</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Temperatura</div>
                <div className="text-sm font-semibold">{sector.sensors?.temperature || "0"}°C</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground">Lotação</div>
                <div className="text-sm font-semibold">{sector.sensors?.crowd || "0"}%</div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={() => onShowEvacuationRoutes(sector.id)}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Ver Rotas de Evacuação
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onMarkAsSafe(sector.id)}
            >
              <ShieldCheck className="h-4 w-4 mr-2" />
              Marcar como Seguro
            </Button>
          </div>

          {/* Última atualização */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorSidebar;