
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MobileHeaderProps {
  onBackClick: () => void;
}

export default function MobileHeader({ onBackClick }: MobileHeaderProps) {
  return (
    <div className="flex items-center p-4 border-b">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBackClick}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-xl font-semibold">Messages</h2>
    </div>
  );
}
