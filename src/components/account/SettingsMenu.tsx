import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccount } from "./AccountProvider";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { account, logout } = useAccount();

  const handleLogout = () => {
    setOpen(false);
    logout();
    void navigate({ to: "/", replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings" className="shrink-0">
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          {account && (
            <DialogDescription>
              {account.name} · @{account.username}
            </DialogDescription>
          )}
        </DialogHeader>
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </Button>
      </DialogContent>
    </Dialog>
  );
}
