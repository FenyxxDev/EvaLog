import { AlertTriangle, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  level: number;
  message: string;
  onDismiss: () => void;
}

const AlertBanner = ({ level, message, onDismiss }: AlertBannerProps) => {
  const getBannerStyle = () => {
    switch (level) {
      case 1:
        return "bg-status-caution text-status-caution-foreground";
      case 2:
        return "bg-status-warning text-status-warning-foreground";
      case 3:
        return "bg-status-danger text-status-danger-foreground animate-pulse";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getIcon = () => {
    switch (level) {
      case 1:
        return <Info className="h-5 w-5" />;
      case 2:
      case 3:
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className={`${getBannerStyle()} px-4 py-3 flex items-center justify-between gap-4 shadow-md z-20`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <p className="font-semibold">Nível {level} - {level === 1 ? "Contenção Local" : level === 2 ? "Setorização" : "Evacuação Total"}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        className="shrink-0 hover:bg-black/10"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default AlertBanner;
