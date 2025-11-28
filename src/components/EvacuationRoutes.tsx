import { useState } from "react";
import { Sector } from "@/typess/sector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Navigation, MapPin, Clock, Users, Edit, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EvacuationRoutesProps {
  sector: Sector;
  onClose: () => void;
  showOnMap: (route: { x: number; y: number }[], safeZone: { x: number; y: number }) => void;
}

interface RoutePoint {
  x: number;
  y: number;
}

const EvacuationRoutes = ({ sector, onClose, showOnMap }: EvacuationRoutesProps) => {
  const [selectedRoute, setSelectedRoute] = useState<"primary" | "alternative">("primary");
  const [editing, setEditing] = useState(false);
  
  // Estado para as rotas editáveis
  const [routes, setRoutes] = useState({
    primary: [
      { x: sector.mapPosition.x, y: sector.mapPosition.y },
      { x: sector.mapPosition.x + 10, y: sector.mapPosition.y - 5 },
      { x: sector.mapPosition.x + 20, y: sector.mapPosition.y - 10 },
      { x: 45, y: 80 } // Zona segura - saída
    ],
    alternative: [
      { x: sector.mapPosition.x, y: sector.mapPosition.y },
      { x: sector.mapPosition.x - 10, y: sector.mapPosition.y - 8 },
      { x: sector.mapPosition.x - 5, y: sector.mapPosition.y - 15 },
      { x: 15, y: 20 } // Zona segura alternativa
    ],
    safeZone: { x: 85, y: 15 }
  });

  const routeInfo = {
    primary: {
      name: "Rota Principal",
      time: "2-3 min",
      distance: "150m",
      capacity: "Alta",
      description: "Saída mais rápida e segura",
      color: "text-status-safe"
    },
    alternative: {
      name: "Rota Alternativa", 
      time: "3-4 min",
      distance: "180m",
      capacity: "Média",
      description: "Use se a principal estiver bloqueada",
      color: "text-status-caution"
    }
  };

  const handleShowRoute = () => {
    showOnMap(
      selectedRoute === "primary" ? routes.primary : routes.alternative,
      routes.safeZone
    );
  };

  // Funções para editar os pontos da rota
  const updateRoutePoint = (routeType: "primary" | "alternative", index: number, field: "x" | "y", value: number) => {
    setRoutes(prev => ({
      ...prev,
      [routeType]: prev[routeType].map((point, i) => 
        i === index ? { ...point, [field]: value } : point
      )
    }));
  };

  const updateSafeZone = (field: "x" | "y", value: number) => {
    setRoutes(prev => ({
      ...prev,
      safeZone: { ...prev.safeZone, [field]: value }
    }));
  };

  const addRoutePoint = (routeType: "primary" | "alternative") => {
    const currentRoute = routes[routeType];
    const lastPoint = currentRoute[currentRoute.length - 2]; // Pega o penúltimo ponto
    const safeZonePoint = currentRoute[currentRoute.length - 1];
    
    setRoutes(prev => ({
      ...prev,
      [routeType]: [
        ...prev[routeType].slice(0, -1), // Remove a zona segura temporariamente
        { 
          x: (lastPoint.x + safeZonePoint.x) / 2, 
          y: (lastPoint.y + safeZonePoint.y) / 2 
        },
        safeZonePoint // Re-adiciona a zona segura
      ]
    }));
  };

  const removeRoutePoint = (routeType: "primary" | "alternative", index: number) => {
    if (routes[routeType].length > 2) { // Mantém pelo menos início e fim
      setRoutes(prev => ({
        ...prev,
        [routeType]: prev[routeType].filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Rotas de Evacuação
            </CardTitle>
            <CardDescription>
              {sector.name} - {editing ? "Editando rotas" : "Selecione a melhor rota"}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setEditing(!editing)}
            >
              {editing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Seletor de Rotas */}
        {!editing && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedRoute === "primary" ? "default" : "outline"}
              onClick={() => setSelectedRoute("primary")}
              className="flex flex-col items-center h-16"
            >
              <Navigation className="h-4 w-4 mb-1" />
              <span className="text-xs">Principal</span>
            </Button>
            <Button
              variant={selectedRoute === "alternative" ? "default" : "outline"}
              onClick={() => setSelectedRoute("alternative")}
              className="flex flex-col items-center h-16"
            >
              <MapPin className="h-4 w-4 mb-1" />
              <span className="text-xs">Alternativa</span>
            </Button>
          </div>
        )}

        {/* Modo Edição */}
        {editing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={selectedRoute === "primary" ? "default" : "outline"}
                onClick={() => setSelectedRoute("primary")}
                className="flex-1"
              >
                Editar Rota Principal
              </Button>
              <Button
                variant={selectedRoute === "alternative" ? "default" : "outline"}
                onClick={() => setSelectedRoute("alternative")}
                className="flex-1"
              >
                Editar Rota Alternativa
              </Button>
            </div>

            {/* Editor de Pontos da Rota */}
            <div className="space-y-3">
              <Label>Pontos da Rota {selectedRoute === "primary" ? "Principal" : "Alternativa"}</Label>
              
              {routes[selectedRoute].map((point, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">X (%)</Label>
                        <Input
                          type="number"
                          value={point.x}
                          onChange={(e) => updateRoutePoint(selectedRoute, index, "x", Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y (%)</Label>
                        <Input
                          type="number"
                          value={point.y}
                          onChange={(e) => updateRoutePoint(selectedRoute, index, "y", Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                  {index > 0 && index < routes[selectedRoute].length - 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRoutePoint(selectedRoute, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => addRoutePoint(selectedRoute)}
                className="w-full"
              >
                + Adicionar Ponto Intermediário
              </Button>
            </div>

            {/* Editor da Zona Segura */}
            <div className="space-y-2 p-3 border rounded-lg">
              <Label>Zona Segura</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">X (%)</Label>
                  <Input
                    type="number"
                    value={routes.safeZone.x}
                    onChange={(e) => updateSafeZone("x", Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y (%)</Label>
                  <Input
                    type="number"
                    value={routes.safeZone.y}
                    onChange={(e) => updateSafeZone("y", Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Modo Visualização Normal */
          <>
            {/* Informações da Rota Selecionada */}
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex justify-between items-center">
                <h4 className={`font-semibold ${routeInfo[selectedRoute].color}`}>
                  {routeInfo[selectedRoute].name}
                </h4>
                <Badge variant="secondary">
                  {selectedRoute === "primary" ? "Recomendada" : "Alternativa"}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {routeInfo[selectedRoute].description}
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <Clock className="h-3 w-3 mx-auto mb-1" />
                  <div>{routeInfo[selectedRoute].time}</div>
                </div>
                <div className="text-center">
                  <Navigation className="h-3 w-3 mx-auto mb-1" />
                  <div>{routeInfo[selectedRoute].distance}</div>
                </div>
                <div className="text-center">
                  <Users className="h-3 w-3 mx-auto mb-1" />
                  <div>{routeInfo[selectedRoute].capacity}</div>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="text-sm space-y-2">
              <p className="font-medium">Instruções:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Siga as setas vermelhas no chão</li>
                <li>Mantenha a calma e não corra</li>
                <li>Ajude pessoas com dificuldade de locomoção</li>
                <li>Não use elevadores</li>
              </ul>
            </div>
          </>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleShowRoute} className="flex-1">
            <Navigation className="h-4 w-4 mr-2" />
            {editing ? "Visualizar no Mapa" : "Mostrar no Mapa"}
          </Button>
          {!editing && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EvacuationRoutes;