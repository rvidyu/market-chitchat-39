
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag, Undo } from "lucide-react";

interface SpamReportNotificationProps {
  onUndo: () => void;
}

const SpamReportNotification = ({ onUndo }: SpamReportNotificationProps) => {
  return (
    <Alert className="fixed bottom-4 right-4 w-96 bg-messaging-primary text-white shadow-lg z-50 flex items-center justify-between py-3">
      <div className="flex items-center">
        <Flag className="h-4 w-4 mr-2" />
        <AlertDescription>
          Spam reported to Kifgo and sender blocked
        </AlertDescription>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onUndo}
        className="text-white hover:bg-messaging-accent ml-2"
      >
        <Undo className="h-4 w-4 mr-1" /> Undo
      </Button>
    </Alert>
  );
};

export default SpamReportNotification;
