
import { ReactNode } from "react";

interface MessagingContainerProps {
  children: ReactNode;
}

export default function MessagingContainer({ children }: MessagingContainerProps) {
  return (
    <div className="flex h-[calc(100vh-12rem)] rounded-xl overflow-hidden border shadow-lg bg-white">
      {children}
    </div>
  );
}
