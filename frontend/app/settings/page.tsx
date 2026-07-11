"use client";

import * as React from "react";
import { Settings, Shield, Bell, Users, Code, Database, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsGroup {
  icon: React.ElementType;
  title: string;
  description: string;
  fields: { label: string; value: string; type?: string; readOnly?: boolean }[];
}

const settingsGroups: SettingsGroup[] = [
  {
    icon: Globe,
    title: "Platform Configuration",
    description: "Core platform identity and environment settings",
    fields: [
      { label: "Platform Name", value: "LedgerFlow" },
      { label: "Environment", value: "Development", readOnly: true },
      { label: "API Version", value: "v1.0.0", readOnly: true },
      { label: "API Base URL", value: "http://localhost:3001", readOnly: true },
    ],
  },
  {
    icon: Users,
    title: "Operator Identity",
    description: "Current operator profile and role configuration",
    fields: [
      { label: "Operator Name", value: "Ops Engineer" },
      { label: "Email", value: "ops@ledgerflow.internal" },
      { label: "Role", value: "Platform Administrator", readOnly: true },
      { label: "Access Level", value: "FULL_ACCESS", readOnly: true },
    ],
  },
  {
    icon: Database,
    title: "Data Retention",
    description: "Audit log and event store retention configuration",
    fields: [
      { label: "Ledger Retention (days)", value: "365" },
      { label: "Audit Log Retention (days)", value: "2555" },
      { label: "Snapshot Retention (days)", value: "90" },
      { label: "Fraud Alert Retention (days)", value: "180" },
    ],
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Risk thresholds and compliance rule settings",
    fields: [
      { label: "High Risk Score Threshold", value: "70" },
      { label: "Medium Risk Score Threshold", value: "40" },
      { label: "Max Transaction Amount (USD)", value: "100,000" },
      { label: "Velocity Limit (per hour)", value: "50" },
    ],
  },
  {
    icon: Bell,
    title: "Notification Settings",
    description: "Alert and notification routing configuration",
    fields: [
      { label: "Alert Webhook URL", value: "https://hooks.example.com/ledgerflow" },
      { label: "Notification Email", value: "alerts@ledgerflow.internal" },
      { label: "Alert Throttle (minutes)", value: "15" },
      { label: "Critical Alert Channel", value: "#fraud-alerts" },
    ],
  },
  {
    icon: Code,
    title: "Developer Options",
    description: "Debug, tracing, and development configuration",
    fields: [
      { label: "Log Level", value: "INFO", readOnly: true },
      { label: "Request Timeout (ms)", value: "30000" },
      { label: "Pagination Default", value: "25" },
      { label: "Build Version", value: "1.0.0-dev", readOnly: true },
    ],
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" /> Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform configuration, access controls, and operational parameters</p>
        </div>
        <Button
          onClick={handleSave}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
        >
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-5">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <div className="h-9 w-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{group.title}</h2>
                  <p className="text-xs text-slate-500">{group.description}</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                      {field.label}
                      {field.readOnly && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">read-only</span>
                      )}
                    </label>
                    <Input
                      defaultValue={field.value}
                      readOnly={field.readOnly}
                      type={field.type || "text"}
                      className={`h-9 text-sm border-slate-200 ${field.readOnly ? "bg-slate-50 text-slate-500 cursor-default" : "bg-white"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-100 bg-red-50">
          <h2 className="text-sm font-semibold text-red-900">Danger Zone</h2>
          <p className="text-xs text-red-600 mt-0.5">Irreversible platform operations. Proceed with caution.</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { action: "Purge All Snapshots", desc: "Delete all balance checkpoints. Event replay will fall back to full scan.", label: "Purge Snapshots" },
            { action: "Reset Fraud Alert Rules", desc: "Clear all configured fraud detection thresholds and restart the engine.", label: "Reset Rules" },
            { action: "Archive Ledger", desc: "Move all ledger events to cold storage. Read-only mode will be enabled.", label: "Archive" },
          ].map((item) => (
            <div key={item.action} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.action}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 h-8 text-xs shrink-0"
              >
                {item.label}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Version Info */}
      <div className="flex items-center justify-between py-4 px-5 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <p className="text-xs font-semibold text-slate-700">LedgerFlow Financial Infrastructure Platform</p>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">v1.0.0 · Build #001 · Node.js / Next.js / PostgreSQL</p>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-400" title="System Online" />
      </div>
    </div>
  );
}
