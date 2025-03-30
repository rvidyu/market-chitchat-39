
import { useState } from "react";
import { useQuickReplies } from "@/contexts/QuickReplyContext";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList 
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QuickReplyManager from "./QuickReplyManager";

interface QuickReplySelectorProps {
  onSelect: (text: string) => void;
}

const QuickReplySelector = ({ onSelect }: QuickReplySelectorProps) => {
  const { quickReplies } = useQuickReplies();
  const [open, setOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const handleSelect = (text: string) => {
    onSelect(text);
    setOpen(false);
  };

  // Group quick replies by category
  const categories = [...new Set(quickReplies.map(reply => reply.category || "General"))];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline" 
            size="icon"
            className="h-8 w-8 rounded-full text-messaging-primary hover:bg-messaging-primary/10 hover:text-messaging-accent"
            title="Quick Replies"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="Search quick replies..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {quickReplies.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  <p>You don't have any quick replies yet.</p>
                  <Button 
                    variant="link" 
                    className="text-messaging-primary mt-2"
                    onClick={() => {
                      setOpen(false);
                      setManagerOpen(true);
                    }}
                  >
                    Create your first quick reply
                  </Button>
                </div>
              ) : (
                <>
                  {categories.map((category) => (
                    <CommandGroup key={category} heading={category}>
                      {quickReplies
                        .filter(reply => (reply.category || "General") === category)
                        .map((reply) => (
                          <CommandItem 
                            key={reply.id} 
                            value={reply.text}
                            onSelect={() => handleSelect(reply.text)}
                            className="cursor-pointer"
                          >
                            {reply.text.length > 50 ? `${reply.text.slice(0, 50)}...` : reply.text}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  ))}
                  
                  <div className="p-2 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full text-sm"
                      onClick={() => {
                        setOpen(false);
                        setManagerOpen(true);
                      }}
                    >
                      Manage Quick Replies
                    </Button>
                  </div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog 
        open={managerOpen} 
        onOpenChange={(open) => setManagerOpen(open)}
      >
        <DialogContent className="sm:max-w-[700px]">
          <QuickReplyManager onSelect={handleSelect} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickReplySelector;
