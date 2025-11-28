import { MapPin, ZoomIn, ZoomOut, X, NavigationIcon } from "lucide-react";
import { Sector } from "@/typess/sector";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import SectorSidebar from "./SectorSidebar";
import EvacuationRoutes from "./EvacuationRoutes";
import { Badge } from "./ui/badge";

// Importando os mapas dos andares
import terreo from "@/assets/LAY OUT MEDIOTEC-SUASSUNA-Terreo-MEDIOTEC.png";
import primeiroAndar from "@/assets/LAY OUT MEDIOTEC-SUASSUNA-Primeiro-andar-MEDIOTECalterado.png";
import segundoAndar from "@/assets/LAY OUT MEDIOTEC-SUASSUNA-Segundo-andar-MEDIOTECalterada.png";
import terceiroAndar from "@/assets/LAY OUT MEDIOTEC-SUASSUNA-Terceiro-andar-MEDIOTECalterado.png";
import quartoAndar from "@/assets/LAY OUT MEDIOTEC-SUASSUNA-Quarto-andar-MEDIOTECalterado.png";

interface MapViewProps {
  sectors: Sector[];
  selectedSector: Sector | null;
  onSectorClick: (sector: Sector) => void;
  onMarkAsSafe: (sectorId: string) => void;
  onShowEvacuationRoutes: (sectorId: string) => void;
}

type FloorType = "terreo" | "primeiro" | "segundo" | "terceiro" | "quarto";

interface RoutePoint {
  x: number;
  y: number;
}

const MapView = ({ 
  sectors, 
  selectedSector, 
  onSectorClick, 
  onMarkAsSafe, 
  onShowEvacuationRoutes 
}: MapViewProps) => {
  const [currentFloor, setCurrentFloor] = useState<FloorType>("terreo");
  const [zoom, setZoom] = useState(1);
  const [showRoutes, setShowRoutes] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[]>([]);
  const [safeZone, setSafeZone] = useState<RoutePoint | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Effect para medir o tamanho real da imagem
  useEffect(() => {
    const updateImageSize = () => {
      if (imageRef.current) {
        const { naturalWidth, naturalHeight, clientWidth, clientHeight } = imageRef.current;
        setImageSize({
          width: clientWidth,
          height: clientHeight
        });
      }
    };

    // Atualiza quando a imagem carrega e quando window resize
    if (imageRef.current) {
      imageRef.current.onload = updateImageSize;
      updateImageSize();
    }

    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, [currentFloor]); // Recalcula quando troca de andar

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  // Função para mostrar rota no mapa
  const handleShowRouteOnMap = (route: RoutePoint[], safeZonePoint: RoutePoint) => {
    setCurrentRoute(route);
    setSafeZone(safeZonePoint);
    setShowRoutes(true);
  };

  // Função para limpar rota
  const handleClearRoute = () => {
    setCurrentRoute([]);
    setSafeZone(null);
    setShowRoutes(false);
  };

  // Mapeamento dos mapas por andar
  const floorMaps: Record<FloorType, string> = {
    terreo: terreo,
    primeiro: primeiroAndar,
    segundo: segundoAndar,
    terceiro: terceiroAndar,
    quarto: quartoAndar
  };

  // Labels para cada aba
  const floorLabels: Record<FloorType, string> = {
    terreo: "Térreo",
    primeiro: "1º Andar",
    segundo: "2º Andar", 
    terceiro: "3º Andar",
    quarto: "4º Andar"
  };

  const currentMap = floorMaps[currentFloor];

  // Filtra setores baseado no andar selecionado
  const getFilteredSectors = () => {
    return sectors.filter(sector => {
      switch (currentFloor) {
        case "terreo": return sector.floor === "terreo";
        case "primeiro": return sector.floor === "primeiro";
        case "segundo": return sector.floor === "segundo";
        case "terceiro": return sector.floor === "terceiro";
        case "quarto": return sector.floor === "quarto";
        default: return false;
      }
    });
  };

  return (
    <div className="flex h-full">
      {/* Mapa Principal */}
      <div className="flex-1 relative bg-muted overflow-hidden">
        {/* Floor selector com abas */}
        <div className="absolute top-4 left-4 z-10">
          <Tabs value={currentFloor} onValueChange={(value) => setCurrentFloor(value as FloorType)}>
            <TabsList className="grid grid-cols-5 gap-1 h-auto p-1 bg-background/95 backdrop-blur">
              {Object.entries(floorLabels).map(([floor, label]) => (
                <TabsTrigger 
                  key={floor}
                  value={floor}
                  className="px-2 py-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Map with floor plan */}
        <div className="absolute inset-0 overflow-auto">
          <div 
            className="relative min-w-full min-h-full flex items-center justify-center p-8"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease'
            }}
          >
            {/* Imagem com ref para medir tamanho real */}
            <img 
              ref={imageRef}
              src={currentMap} 
              alt={`Mapa ${floorLabels[currentFloor]} - MEDIOTEC`}
              className="max-w-full h-auto shadow-2xl rounded-lg"
            />
            
            {/* Container absoluto sobre a imagem */}
            {imageSize.width > 0 && imageSize.height > 0 && (
              <div 
                className="absolute top-0 left-0"
                style={{
                  width: `${imageSize.width}px`,
                  height: `${imageSize.height}px`
                }}
              >
                {/* Zone pins overlaid on the map */}
                {getFilteredSectors().map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => {
                      onSectorClick(sector);
                      handleClearRoute();
                    }}
                    className={`
                      absolute transform -translate-x-1/2 -translate-y-1/2
                      transition-all duration-300 hover:scale-125
                      ${selectedSector?.id === sector.id ? "scale-125 z-20" : "z-10"}
                    `}
                    style={{
                      left: `${sector.mapPosition.x}%`,
                      top: `${sector.mapPosition.y}%`,
                    }}
                  >
                    <div className="relative">
                      <MapPin 
                        className={`h-8 w-8 drop-shadow-lg ${
                          selectedSector?.id === sector.id ? "animate-pulse" : ""
                        }`}
                        fill={`hsl(var(--status-${sector.status}))`}
                        stroke="white"
                        strokeWidth={2}
                      />
                      <div className={`
                        absolute -bottom-6 left-1/2 -translate-x-1/2 
                        whitespace-nowrap text-xs font-bold px-1 py-0.5 rounded
                        ${getStatusColor(sector.status)} text-white shadow-lg
                      `}>
                        {sector.name}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Renderização da Rota de Evacuação */}
                {showRoutes && currentRoute.length > 0 && (
                  <>
                    {/* Linha da rota - SVG com path contínuo */}
                    <svg 
                      className="absolute top-0 left-0 pointer-events-none z-30" 
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Linha tracejada de fundo */}
                      <path
                        d={`M ${currentRoute[0].x}% ${currentRoute[0].y}% ${currentRoute.slice(1).map(point => 
                          `L ${point.x}% ${point.y}%`
                        ).join(' ')}`}
                        stroke="red"
                        strokeWidth="4"
                        strokeDasharray="8,4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.6"
                      />
                      
                      {/* Seta no final da rota */}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="red"
                          />
                        </marker>
                      </defs>
                      
                      {/* Linha principal com seta */}
                      <path
                        d={`M ${currentRoute[0].x}% ${currentRoute[0].y}% ${currentRoute.slice(1).map(point => 
                          `L ${point.x}% ${point.y}%`
                        ).join(' ')}`}
                        stroke="red"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>

                    {/* Pontos da rota */}
                    {currentRoute.map((point, index) => (
                      <div
                        key={index}
                        className={`
                          absolute w-6 h-6 rounded-full z-40 transform -translate-x-1/2 -translate-y-1/2
                          flex items-center justify-center text-white text-xs font-bold shadow-lg
                          border-2 border-white
                          ${index === 0 ? 'bg-blue-500' : 
                            index === currentRoute.length - 1 ? 'bg-green-500' : 
                            'bg-red-500'}
                          ${index === 0 || index === currentRoute.length - 1 ? 'animate-pulse' : ''}
                        `}
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                        }}
                      >
                        {index === 0 ? 'I' : index === currentRoute.length - 1 ? 'F' : index}
                      </div>
                    ))}

                    {/* Zona segura */}
                    {safeZone && (
                      <div
                        className="absolute w-12 h-12 z-50 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${safeZone.x}%`,
                          top: `${safeZone.y}%`,
                        }}
                      >
                        <div className="w-full h-full bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-2 py-1 bg-green-500 text-white rounded shadow-lg border border-white">
                          Zona Segura
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botão para limpar rota (fora do container da imagem) */}
        {showRoutes && currentRoute.length > 0 && (
          <div className="absolute top-20 right-4 z-50">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearRoute}
              className="flex items-center gap-2 shadow-lg"
            >
              <X className="h-4 w-4" />
              Limpar Rota
            </Button>
          </div>
        )}

        {/* Informações da Rota Ativa */}
        {showRoutes && currentRoute.length > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-background/95 backdrop-blur border rounded-lg px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <NavigationIcon className="h-4 w-4 text-red-500" />
                <span>Rota de Evacuação Ativa</span>
                <Badge variant="secondary" className="ml-2">
                  {currentRoute.length - 1} pontos
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar de Detalhes */}
      {selectedSector && !showRoutes && (
        <SectorSidebar
          sector={selectedSector}
          onMarkAsSafe={onMarkAsSafe}
          onShowEvacuationRoutes={() => setShowRoutes(true)}
        />
      )}

      {/* Modal de Rotas de Evacuação */}
      {showRoutes && selectedSector && (
        <div className="w-80 border-l bg-background overflow-y-auto p-4">
          <EvacuationRoutes
            sector={selectedSector}
            onClose={() => setShowRoutes(false)}
            showOnMap={handleShowRouteOnMap}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;