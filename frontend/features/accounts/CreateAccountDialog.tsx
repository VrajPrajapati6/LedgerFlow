"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { accountService } from "@/services/api/endpoints";

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAccountDialogProps) {
  const [form, setForm] = React.useState({
    userId: "",
    accountType: "SAVINGS",
    currency: "USD",
  });

  const mutation = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      toast.success("Account created successfully");
      onSuccess();
      onOpenChange(false);
      setForm({ userId: "", accountType: "SAVINGS", currency: "USD" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create account");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-base">
            Provision Ledger Container
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Open a new double-entry account container for transactional audits.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 select-none">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">
              User ID
            </label>
            <Input
              placeholder="e.g. user_8910"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="bg-slate-900 border-slate-800 text-white text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">
              Account Type
            </label>
            <Select
              value={form.accountType}
              onValueChange={(val) =>
                setForm({ ...form, accountType: val || "" })
              }
            >
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-250">
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CHECKING">Checking</SelectItem>
                <SelectItem value="OPERATING">Operating Ledger</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400">
              Currency
            </label>
            <Select
              value={form.currency}
              onValueChange={(val) =>
                setForm({ ...form, currency: val || "" })
              }
            >
              <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-slate-800 text-slate-250">
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.userId}
            className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
          >
            {mutation.isPending ? "Provisioning..." : "Provision Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
