
import { Button } from "@/components/ui/button";
import { Undo, X, AlertTriangle } from "lucide-react";
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

  const handleClose = () => {
    setIsClosing(true);
  };

  // If closing, don't render
  if (isClosing) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg border border-red-200 w-[400px] overflow-hidden">
        {/* Red banner at top */}
        <div className="h-1 bg-red-500 w-full"></div>
        
        <div className="p-4">
          <div className="flex items-start">
            {/* Icon */}
            <div className="flex-shrink-0 bg-red-100 p-2 rounded-full mr-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Message reported as spam</h3>
              <p className="text-sm text-gray-600">This conversation has been moved to your spam folder</p>
              
              {/* Action buttons */}
              <div className="flex items-center justify-end mt-3 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onUndo}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Undo className="h-3.5 w-3.5 mr-1.5" /> Undo
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpamReportNotification;
