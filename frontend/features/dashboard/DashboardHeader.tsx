"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  GitCompare,
  Camera,
  Terminal,
  Clock,
} from "lucide-react";
import { accountService, transactionService, reconciliationService, snapshotService } from "@/services/api/endpoints";

interface DashboardHeaderProps {
  accounts: any[];
  refetchData: () => void;
}

export function DashboardHeader({ accounts = [], refetchData }: DashboardHeaderProps) {
  const queryClient = useQueryClient();
  const [time, setTime] = React.useState("");

  // Modals state
  const [activeModal, setActiveModal] = React.useState<
    "createAccount" | "deposit" | "transfer" | "reconciliation" | "snapshot" | null
  >(null);

  // Form states
  const [createAccountForm, setCreateAccountForm] = React.useState({
    userId: "",
    accountType: "SAVINGS",
    currency: "USD",
  });
  const [depositForm, setDepositForm] = React.useState({
    accountId: "",
    amount: "",
    description: "",
  });
  const [transferForm, setTransferForm] = React.useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
  });
  const [snapshotForm, setSnapshotForm] = React.useState({
    accountId: "",
  });

  // Keep date-time running
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      refetchData();
      setActiveModal(null);
      setCreateAccountForm({ userId: "", accountType: "SAVINGS", currency: "USD" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create account");
    },
  });

  const depositMutation = useMutation({
    mutationFn: transactionService.deposit,
    onSuccess: () => {
      toast.success("Funds deposited successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      refetchData();
      setActiveModal(null);
      setDepositForm({ accountId: "", amount: "", description: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to deposit funds");
    },
  });

  const transferMutation = useMutation({
    mutationFn: transactionService.transfer,
    onSuccess: () => {
      toast.success("Transfer executed successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      refetchData();
      setActiveModal(null);
      setTransferForm({ fromAccountId: "", toAccountId: "", amount: "", description: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Transfer failed");
    },
  });

  const runReconciliationMutation = useMutation({
    mutationFn: reconciliationService.run,
    onSuccess: (data) => {
      toast.success(`Reconciliation run finished. Matched: ${data.report.totalMatched}, Mismatched: ${data.report.totalMismatched}`);
      queryClient.invalidateQueries({ queryKey: ["reconciliationReport"] });
      refetchData();
      setActiveModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Reconciliation runner failed");
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: (accountId: string) => snapshotService.create(accountId),
    onSuccess: () => {
      toast.success("Account state snapshot generated");
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      refetchData();
      setActiveModal(null);
      setSnapshotForm({ accountId: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create snapshot");
    },
  });

  return (
    <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 select-none sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-500" />
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Development Mode
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans sm:text-3xl">
          FinCore Operations Engine
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>{time}</span>
        </div>
      </div>

      {/* Action Buttons Group */}
      <div className="flex flex-wrap gap-2 sm:items-center">
        <Button
          onClick={() => setActiveModal("createAccount")}
          variant="outline"
          className="text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-blue-500" />
          Create Account
        </Button>
        <Button
          onClick={() => setActiveModal("deposit")}
          variant="outline"
          className="text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <ArrowDownLeft className="mr-1 h-3.5 w-3.5 text-emerald-500" />
          Deposit
        </Button>
        <Button
          onClick={() => setActiveModal("transfer")}
          variant="outline"
          className="text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <ArrowUpRight className="mr-1 h-3.5 w-3.5 text-blue-500" />
          Transfer
        </Button>
        <Button
          onClick={() => setActiveModal("reconciliation")}
          variant="outline"
          className="text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <GitCompare className="mr-1 h-3.5 w-3.5 text-amber-500" />
          Reconcile
        </Button>
        <Button
          onClick={() => setActiveModal("snapshot")}
          variant="outline"
          className="text-xs bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          <Camera className="mr-1 h-3.5 w-3.5 text-indigo-500" />
          Snapshot
        </Button>
      </div>

      {/* 1. Create Account Dialog */}
      <Dialog
        open={activeModal === "createAccount"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Account</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Provision a new double-entry ledger container.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                User Identifier
              </label>
              <Input
                placeholder="usr-89201"
                value={createAccountForm.userId}
                onChange={(e) =>
                  setCreateAccountForm({
                    ...createAccountForm,
                    userId: e.target.value,
                  })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Account Segment
              </label>
              <Select
                value={createAccountForm.accountType}
                onValueChange={(val) =>
                  setCreateAccountForm({
                    ...createAccountForm,
                    accountType: val || "",
                  })
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
                Currency Base
              </label>
              <Select
                value={createAccountForm.currency}
                onValueChange={(val) =>
                  setCreateAccountForm({
                    ...createAccountForm,
                    currency: val || "",
                  })
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
              onClick={() => createAccountMutation.mutate(createAccountForm)}
              disabled={createAccountMutation.isPending || !createAccountForm.userId}
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {createAccountMutation.isPending ? "Provisioning..." : "Provision Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Deposit Funds Dialog */}
      <Dialog
        open={activeModal === "deposit"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Deposit Seed Funding</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Inject external capital ledger credit to initialize balances.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Target Account
              </label>
              <Select
                value={depositForm.accountId}
                onValueChange={(val) =>
                  setDepositForm({ ...depositForm, accountId: val || "" })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Select target account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-250 max-h-48">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} ({a.accountType} - {a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Funding Amount
              </label>
              <Input
                type="number"
                placeholder="5000"
                value={depositForm.amount}
                onChange={(e) =>
                  setDepositForm({ ...depositForm, amount: e.target.value })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Reference Description
              </label>
              <Input
                placeholder="Initial capital infusion"
                value={depositForm.description}
                onChange={(e) =>
                  setDepositForm({ ...depositForm, description: e.target.value })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() =>
                depositMutation.mutate({
                  accountId: depositForm.accountId,
                  amount: Number(depositForm.amount),
                  description: depositForm.description,
                })
              }
              disabled={
                depositMutation.isPending ||
                !depositForm.accountId ||
                !depositForm.amount
              }
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {depositMutation.isPending ? "Executing Deposit..." : "Infuse Capital"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Transfer Funds Dialog */}
      <Dialog
        open={activeModal === "transfer"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Execute Internal Transfer</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Perform atomic transfer between matching currency ledger accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Source Account (Debit)
              </label>
              <Select
                value={transferForm.fromAccountId}
                onValueChange={(val) =>
                  setTransferForm({ ...transferForm, fromAccountId: val || "" })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Select sender account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-250 max-h-48">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} (Bal: {a.balance} {a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Destination Account (Credit)
              </label>
              <Select
                value={transferForm.toAccountId}
                onValueChange={(val) =>
                  setTransferForm({ ...transferForm, toAccountId: val || "" })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Select receiver account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-250 max-h-48">
                  {accounts
                    .filter((a) => a.id !== transferForm.fromAccountId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.userId} ({a.accountType} - {a.currency})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Transfer Amount
              </label>
              <Input
                type="number"
                placeholder="150.00"
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm({ ...transferForm, amount: e.target.value })
                }
                className="bg-slate-900 border-slate-800 text-white text-xs h-9"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() =>
                transferMutation.mutate({
                  senderId: transferForm.fromAccountId,
                  receiverId: transferForm.toAccountId,
                  amount: Number(transferForm.amount),
                  description: transferForm.description,
                })
              }
              disabled={
                transferMutation.isPending ||
                !transferForm.fromAccountId ||
                !transferForm.toAccountId ||
                !transferForm.amount
              }
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {transferMutation.isPending ? "Executing ledger transaction..." : "Transfer Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Run Reconciliation Dialog */}
      <Dialog
        open={activeModal === "reconciliation"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Run Reconciliation Engine</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Execute reconciliation audit checks against external payment settlements database.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-slate-400 py-3 leading-relaxed">
            This will trigger a full match scan analyzing transaction amount discrepancies, status deviations, duplication logs, and missing settlement clearances.
          </p>
          <DialogFooter>
            <Button
              onClick={() => runReconciliationMutation.mutate()}
              disabled={runReconciliationMutation.isPending}
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {runReconciliationMutation.isPending ? "Executing runs..." : "Initiate Audit Reconciliation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Generate Snapshot Dialog */}
      <Dialog
        open={activeModal === "snapshot"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Generate State Snapshot</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Checkpoint an account balance state to accelerate future event replay optimization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400">
                Target Account
              </label>
              <Select
                value={snapshotForm.accountId}
                onValueChange={(val) =>
                  setSnapshotForm({ ...snapshotForm, accountId: val || "" })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Select target account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-slate-250 max-h-48">
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} (Bal: {a.balance} {a.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => createSnapshotMutation.mutate(snapshotForm.accountId)}
              disabled={createSnapshotMutation.isPending || !snapshotForm.accountId}
              className="w-full text-xs bg-blue-600 hover:bg-blue-500 text-white h-9"
            >
              {createSnapshotMutation.isPending ? "Generating Snapshot..." : "Generate State Snapshot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
