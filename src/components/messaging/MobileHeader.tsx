
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onBackClick: () => void;
  title?: string;
}

export default function MobileHeader({ onBackClick, title = "Messages" }: MobileHeaderProps) {
  return (
    <div className="p-3 border-b flex items-center bg-white">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBackClick} 
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
  );
}
