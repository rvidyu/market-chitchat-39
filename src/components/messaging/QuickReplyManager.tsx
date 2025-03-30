
import { useState } from "react";
import { useQuickReplies } from "@/contexts/QuickReplyContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QuickReply } from "@/data/quickReplies";
import QuickReplyModal from "./QuickReplyModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuickReplyManagerProps {
  onSelect?: (text: string) => void;
}

const QuickReplyManager = ({ onSelect }: QuickReplyManagerProps) => {
  const { quickReplies, deleteQuickReply } = useQuickReplies();
  const [showAddModal, setShowAddModal] = useState(false);
  const [replyToEdit, setReplyToEdit] = useState<QuickReply | null>(null);

  // Group quick replies by category
  const categorizedReplies = quickReplies.reduce<Record<string, QuickReply[]>>(
    (acc, reply) => {
      const category = reply.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(reply);
      return acc;
    },
    {}
  );

  const handleEditReply = (reply: QuickReply) => {
    setReplyToEdit(reply);
  };

  const handleCloseModal = () => {
    setReplyToEdit(null);
    setShowAddModal(false);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">Quick Replies</CardTitle>
              <CardDescription>
                Create and manage reusable message templates
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-messaging-primary hover:bg-messaging-accent"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> New Reply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quickReplies.length === 0 ? (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertDescription>
                You don't have any quick replies yet. Create your first one to speed up your messaging!
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              {Object.entries(categorizedReplies).map(([category, replies]) => (
                <div key={category} className="mb-4">
                  <h4 className="mb-2 font-medium text-sm text-gray-500 flex items-center">
                    <Badge variant="outline" className="mr-2">{category}</Badge>
                    <span>{replies.length} {replies.length === 1 ? "reply" : "replies"}</span>
                  </h4>
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="group relative p-3 border rounded-md bg-white hover:border-messaging-primary transition-colors"
                      >
                        <div 
                          className="pr-16 cursor-pointer"
                          onClick={() => onSelect && onSelect(reply.text)}
                        >
                          <p className="text-sm line-clamp-2">{reply.text}</p>
                        </div>
                        <div className="absolute right-2 top-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditReply(reply)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteQuickReply(reply.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <QuickReplyModal
        isOpen={showAddModal || !!replyToEdit}
        onClose={handleCloseModal}
        replyToEdit={replyToEdit}
      />
    </>
  );
};

export default QuickReplyManager;
