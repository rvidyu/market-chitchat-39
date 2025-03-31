import { useState } from "react";
import { useQuickReplies } from "@/contexts/QuickReplyContext";
import { QuickReply } from "@/data/quickReplies";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QuickReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyToEdit?: QuickReply | null;
}

const QuickReplyModal = ({ isOpen, onClose, replyToEdit }: QuickReplyModalProps) => {
  const [text, setText] = useState(replyToEdit?.text || "");
  const [category, setCategory] = useState(replyToEdit?.category || "General");
  const { addQuickReply, updateQuickReply } = useQuickReplies();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim() === "") return;

    if (replyToEdit) {
      updateQuickReply(replyToEdit.id, text, category);
    } else {
      addQuickReply(text, category);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setText("");
    setCategory("General");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {replyToEdit ? "Edit Quick Reply" : "Create Quick Reply"}
          </DialogTitle>
          <DialogDescription>
            {replyToEdit
              ? "Update your saved response template."
              : "Create a reusable response template for your conversations."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="General, Shipping, Returns, etc."
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text">Message Template</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your message template here..."
              className="min-h-[100px]"
              autoFocus
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-messaging-primary hover:bg-messaging-accent"
              disabled={text.trim() === ""}
            >
              {replyToEdit ? "Save Changes" : "Add Quick Reply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickReplyModal;
