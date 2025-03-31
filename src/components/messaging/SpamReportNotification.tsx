
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag, Undo, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SpamReportNotificationProps {
  onUndo: () => void;
}

const SpamReportNotification = ({ onUndo }: SpamReportNotificationProps) => {
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => {
      setIsClosing(true);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Alert 
      className={`
        fixed bottom-6 right-6 w-[380px] bg-[#9b87f5] text-white shadow-lg z-50 
        rounded-xl border-none py-4 px-5 transition-all duration-300
        ${isClosing ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"}
      `}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 rounded-full p-1.5">
            <Flag className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <AlertDescription className="font-medium text-[15px]">
              Spam reported to Kifgo
            </AlertDescription>
            <AlertDescription className="text-xs opacity-90">
              Sender has been blocked
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUndo}
            className="text-white hover:bg-white hover:bg-opacity-20 px-3 h-8"
          >
            <Undo className="h-3.5 w-3.5 mr-1.5" /> Undo
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsClosing(true)}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 h-8 w-8 ml-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default SpamReportNotification;
