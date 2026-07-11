"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLoader } from "@/components/feedback/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  accountService,
  transactionService,
  reconciliationService,
  snapshotService,
} from "@/services/api/endpoints";
import { Plus, ArrowLeftRight, GitCompare, Camera, Clock } from "lucide-react";

// Sub-components
import { KPICards } from "@/features/dashboard/KPICards";
import { TransactionAnalytics } from "@/features/dashboard/TransactionAnalytics";
import { FinancialOverview } from "@/features/dashboard/FinancialOverview";
import { RecentTransactionsTable } from "@/features/dashboard/RecentTransactionsTable";
import { FraudSummary } from "@/features/dashboard/FraudSummary";
import { ReconciliationSummary } from "@/features/dashboard/ReconciliationSummary";
import { LedgerTimeline } from "@/features/dashboard/LedgerTimeline";
import { SystemHealthCards } from "@/features/dashboard/SystemHealthCards";

type DialogType =
  | "createAccount"
  | "deposit"
  | "transfer"
  | "reconcile"
  | "snapshot"
  | null;

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = React.useState<DialogType>(null);

  // Form states
  const [form, setForm] = React.useState({
    userId: "",
    accountType: "SAVINGS",
    currency: "USD",
    depositAccountId: "",
    depositAmount: "",
    senderId: "",
    receiverId: "",
    transferAmount: "",
    snapshotAccountId: "",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountService.list,
  });

  const createMutation = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setDialog(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const depositMutation = useMutation({
    mutationFn: transactionService.deposit,
    onSuccess: () => {
      toast.success("Deposit recorded successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      setDialog(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const transferMutation = useMutation({
    mutationFn: transactionService.transfer,
    onSuccess: () => {
      toast.success("Transfer executed successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
      setDialog(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reconMutation = useMutation({
    mutationFn: reconciliationService.run,
    onSuccess: () => {
      toast.success("Reconciliation scan completed");
      queryClient.invalidateQueries({ queryKey: ["reconciliationReport"] });
      setDialog(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const snapMutation = useMutation({
    mutationFn: snapshotService.create,
    onSuccess: () => {
      toast.success("Snapshot checkpoint saved");
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
      setDialog(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const now = new Date();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Financial infrastructure overview and quick controls
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setDialog("createAccount")}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Account
          </Button>
          <Button
            onClick={() => setDialog("deposit")}
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs h-8 px-3 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Deposit
          </Button>
          <Button
            onClick={() => setDialog("transfer")}
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs h-8 px-3 gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Transfer
          </Button>
          <Button
            onClick={() => setDialog("reconcile")}
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs h-8 px-3 gap-1.5"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Reconcile
          </Button>
          <Button
            onClick={() => setDialog("snapshot")}
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs h-8 px-3 gap-1.5"
          >
            <Camera className="h-3.5 w-3.5" />
            Snapshot
          </Button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <KPICards />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TransactionAnalytics />
        </div>
        <FinancialOverview />
      </div>

      {/* Operations Table + Compliance Summaries */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentTransactionsTable />
        </div>
        <div className="space-y-5">
          <FraudSummary />
          <ReconciliationSummary />
        </div>
      </div>

      {/* Timeline + System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LedgerTimeline />
        <SystemHealthCards />
      </div>

      {/* ─── Dialogs ─── */}

      {/* Create Account */}
      <Dialog
        open={dialog === "createAccount"}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Create Account</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Provision a new ledger container for a user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">User ID</label>
              <Input
                placeholder="user_abc123"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="h-9 text-sm border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Account Type</label>
                <Select
                  value={form.accountType}
                  onValueChange={(v) => setForm({ ...form, accountType: v ?? form.accountType })}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="ESCROW">Escrow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Currency</label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm({ ...form, currency: v ?? form.currency })}
                >
                  <SelectTrigger className="h-9 text-sm border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                createMutation.mutate({
                  userId: form.userId,
                  accountType: form.accountType,
                  currency: form.currency,
                })
              }
              disabled={createMutation.isPending || !form.userId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {createMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit */}
      <Dialog
        open={dialog === "deposit"}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Record Deposit</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Inject capital into an account ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Target Account</label>
              <Select
                value={form.depositAccountId}
                onValueChange={(v) => setForm({ ...form, depositAccountId: v ?? form.depositAccountId })}
              >
                <SelectTrigger className="h-9 text-sm border-slate-200">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} — {a.accountType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Amount (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.depositAmount}
                onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                className="h-9 text-sm border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                depositMutation.mutate({
                  accountId: form.depositAccountId,
                  amount: Number(form.depositAmount),
                  description: "Dashboard deposit",
                })
              }
              disabled={
                depositMutation.isPending ||
                !form.depositAccountId ||
                !form.depositAmount
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {depositMutation.isPending ? "Processing..." : "Record Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer */}
      <Dialog
        open={dialog === "transfer"}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Execute Transfer</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Move funds atomically between two accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Sender</label>
              <Select
                value={form.senderId}
                onValueChange={(v) => setForm({ ...form, senderId: v ?? form.senderId })}
              >
                <SelectTrigger className="h-9 text-sm border-slate-200">
                  <SelectValue placeholder="Select sender" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} — {a.accountType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Receiver</label>
              <Select
                value={form.receiverId}
                onValueChange={(v) => setForm({ ...form, receiverId: v ?? form.receiverId })}
              >
                <SelectTrigger className="h-9 text-sm border-slate-200">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} — {a.accountType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Amount (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.transferAmount}
                onChange={(e) => setForm({ ...form, transferAmount: e.target.value })}
                className="h-9 text-sm border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                transferMutation.mutate({
                  senderId: form.senderId,
                  receiverId: form.receiverId,
                  amount: Number(form.transferAmount),
                })
              }
              disabled={
                transferMutation.isPending ||
                !form.senderId ||
                !form.receiverId ||
                !form.transferAmount
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {transferMutation.isPending ? "Processing..." : "Execute Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reconcile */}
      <Dialog
        open={dialog === "reconcile"}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Run Reconciliation</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Compare internal ledger records against external settlements.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4">
            <GitCompare className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              This will trigger a full settlement audit scan across all open transactions.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => reconMutation.mutate()}
              disabled={reconMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {reconMutation.isPending ? "Scanning..." : "Start Reconciliation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snapshot */}
      <Dialog
        open={dialog === "snapshot"}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <DialogContent className="bg-white border-slate-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Generate Snapshot</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Save a balance state checkpoint for replay optimization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Target Account</label>
              <Select
                value={form.snapshotAccountId}
                onValueChange={(v) => setForm({ ...form, snapshotAccountId: v ?? form.snapshotAccountId })}
              >
                <SelectTrigger className="h-9 text-sm border-slate-200">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.userId} — {a.accountType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => snapMutation.mutate(form.snapshotAccountId)}
              disabled={snapMutation.isPending || !form.snapshotAccountId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
            >
              {snapMutation.isPending ? "Saving..." : "Generate Snapshot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
