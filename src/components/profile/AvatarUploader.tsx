
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface AvatarUploaderProps {
  avatarUrl: string | null;
  name: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarUploader = ({ avatarUrl, name, handleFileChange }: AvatarUploaderProps) => {
  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-24 w-24">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Profile" />
        ) : (
          <AvatarFallback className="text-lg bg-gradient-to-r from-primary to-secondary text-white">
            {name ? name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <Label htmlFor="avatar" className="cursor-pointer flex items-center justify-center gap-2 text-sm text-primary">
          <Upload size={16} />
          Upload Photo
        </Label>
        <Input 
          id="avatar" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default AvatarUploader;
