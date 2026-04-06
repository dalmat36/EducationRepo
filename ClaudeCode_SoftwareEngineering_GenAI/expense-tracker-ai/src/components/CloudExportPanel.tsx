"use client";

import { useState, useMemo } from "react";
import {
  X, Cloud, Download, Mail, Globe, HardDrive, Share2, QrCode, Link2,
  CalendarClock, History, CheckCircle2, RefreshCw, Zap, Send, Copy,
  Check, Trash2, AlertCircle, Clock, UploadCloud, Database, Bell,
  ChevronRight, Repeat, ToggleLeft, ToggleRight, Sparkles,
} from "lucide-react";
import { Expense } from "@/types/expense";
import { CATEGORIES } from "@/types/expense";
import { formatCurrency } from "@/utils/formatters";
import { formatDistanceToNow } from "date-fns";
import {
  EXPORT_TEMPLATES, CLOUD_DESTINATIONS, ExportHistoryEntry, ScheduleConfig,
  generateContent, triggerDownload, generateShareableLink, getFileSizeKb,
  buildFilename, describeNextExport, DEFAULT_SCHEDULE,
} from "@/utils/exportCloud";
import { useExportHistory } from "@/hooks/useExportHistory";

// ─── Sub-types ────────────────────────────────────────────────────────────────

type Tab = "templates" | "destinations" | "schedule" | "history";

interface CloudExportPanelProps {
  expenses: Expense[];
  onClose: () => void;
}

// ─── Destination icon map ─────────────────────────────────────────────────────

const DEST_ICONS: Record<string, React.ReactNode> = {
  "download":      <Download size={18} />,
  "email":         <Mail size={18} />,
  "google-sheets": <Globe size={18} />,
  "dropbox":       <Database size={18} />,
  "onedrive":      <HardDrive size={18} />,
  "share-link":    <Share2 size={18} />,
};

const DEST_COLOR: Record<string, string> = {
  "download":      "text-slate-600 bg-slate-100",
  "email":         "text-amber-600 bg-amber-50",
  "google-sheets": "text-green-600 bg-green-50",
  "dropbox":       "text-blue-600 bg-blue-50",
  "onedrive":      "text-sky-600 bg-sky-50",
  "share-link":    "text-violet-600 bg-violet-50",
};

// ─── Fake QR Code ─────────────────────────────────────────────────────────────

function FakeQRCode({ value }: { value: string }) {
  // Deterministic-ish grid from value hash
  const size = 11;
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size);
    const col = i % size;
    // Always-on corner markers
    const inCorner =
      (row < 3 && col < 3) || (row < 3 && col >= size - 3) || (row >= size - 3 && col < 3);
    if (inCorner) return true;
    // Quiet zone border of corners
    const isCornerBorder =
      (row === 3 && col <= 3) || (row === 3 && col >= size - 4) ||
      (row >= size - 4 && col === 3) || (col === 3 && row <= 3) ||
      (col >= size - 4 && row <= 3);
    if (isCornerBorder) return false;
    return ((seed * (i + 1) * 2654435761) >>> 0) % 3 !== 0;
  });

  return (
    <div className="inline-grid gap-0.5 p-2 bg-white rounded-lg border border-slate-200"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {cells.map((on, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-sm ${on ? "bg-slate-900" : "bg-white"}`} />
      ))}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function CloudExportPanel({ expenses, onClose }: CloudExportPanelProps) {
  const { history, addEntry, removeEntry, clearHistory, schedule, updateSchedule, connectedServices, toggleConnection } = useExportHistory();

  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("monthly-summary");
  const [selectedDestId, setSelectedDestId] = useState<string>("download");
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [localSchedule, setLocalSchedule] = useState<ScheduleConfig>(schedule);

  const selectedTemplate = EXPORT_TEMPLATES.find((t) => t.id === selectedTemplateId)!;
  const filteredCount = useMemo(() => selectedTemplate.filter(expenses).length, [selectedTemplate, expenses]);
  const totalAmount = useMemo(
    () => selectedTemplate.filter(expenses).reduce((s, e) => s + e.amount, 0),
    [selectedTemplate, expenses]
  );

  // ── Export action ─────────────────────────────────────────────────────────

  async function handleExport() {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const { content, ext, mime } = generateContent(selectedTemplate, expenses);
      const filename = buildFilename(selectedTemplateId, ext);
      const kb = getFileSizeKb(content);

      if (selectedDestId === "download") {
        triggerDownload(content, filename, mime);
        addEntry({ templateId: selectedTemplateId, templateName: selectedTemplate.name, destination: "Download", format: ext, recordCount: filteredCount, fileSizeKb: kb, status: "success" });
      } else if (selectedDestId === "email") {
        // Simulated email send
        setEmailSent(true);
        addEntry({ templateId: selectedTemplateId, templateName: selectedTemplate.name, destination: `Email: ${emailInput}`, format: ext, recordCount: filteredCount, fileSizeKb: kb, status: "success" });
        setTimeout(() => setEmailSent(false), 3000);
      } else if (selectedDestId === "share-link") {
        const link = generateShareableLink(selectedTemplateId, filteredCount);
        setShareLink(link);
        addEntry({ templateId: selectedTemplateId, templateName: selectedTemplate.name, destination: "Share Link", format: ext, recordCount: filteredCount, fileSizeKb: kb, status: "success" });
      } else {
        // Cloud service (simulated)
        addEntry({ templateId: selectedTemplateId, templateName: selectedTemplate.name, destination: CLOUD_DESTINATIONS.find((d) => d.id === selectedDestId)?.name ?? selectedDestId, format: ext, recordCount: filteredCount, fileSizeKb: kb, status: "success" });
        triggerDownload(content, filename, mime); // fallback: still download locally
      }
    } finally {
      setIsProcessing(false);
    }
  }

  function handleCopyLink() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function handleConnect(serviceId: string) {
    setConnectingId(serviceId);
    await new Promise((r) => setTimeout(r, 1200));
    toggleConnection(serviceId);
    setConnectingId(null);
  }

  function handleSaveSchedule() {
    updateSchedule(localSchedule);
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "templates",    label: "Templates",    icon: <Sparkles size={14} /> },
    { id: "destinations", label: "Destinations", icon: <UploadCloud size={14} /> },
    { id: "schedule",     label: "Schedule",     icon: <CalendarClock size={14} /> },
    { id: "history",      label: "History",      icon: <History size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Cloud size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Export & Sync</h2>
                <p className="text-xs text-indigo-200">{expenses.length} records · {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${activeTab === tab.id ? "bg-white text-indigo-700" : "text-white/70 hover:text-white hover:bg-white/20"}`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "history" && history.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                    ${activeTab === "history" ? "bg-indigo-100 text-indigo-600" : "bg-white/30 text-white"}`}>
                    {history.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Templates ── */}
          {activeTab === "templates" && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">Choose a pre-configured export profile optimized for a specific purpose.</p>

              <div className="grid grid-cols-2 gap-3">
                {EXPORT_TEMPLATES.map((tmpl) => {
                  const count = tmpl.filter(expenses).length;
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all
                        ${isSelected ? "border-indigo-400 shadow-sm shadow-indigo-100" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${tmpl.accent} flex items-center justify-center text-lg mb-2`}>
                        {tmpl.icon}
                      </div>
                      <div className="font-semibold text-sm text-slate-800">{tmpl.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">{tmpl.description}</div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tmpl.accent} ${tmpl.textColor}`}>
                          {tmpl.badge}
                        </span>
                        <span className="text-[11px] text-slate-400">{count} records</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected template details */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{selectedTemplate.name}</span>
                  <span className="text-xs text-slate-500 font-mono">.{selectedTemplate.defaultFormat}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Database size={11} /> {filteredCount} records</span>
                  <span className="flex items-center gap-1"><Zap size={11} /> {formatCurrency(totalAmount)}</span>
                  <span className="flex items-center gap-1"><Bell size={11} /> {selectedTemplate.purpose}</span>
                </div>
              </div>

              {/* Destination quick-pick */}
              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Export destination</p>
                <div className="flex flex-wrap gap-2">
                  {CLOUD_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedDestId(dest.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                        ${selectedDestId === dest.id
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : dest.requiresAuth && !connectedServices.has(dest.id)
                            ? "border-slate-100 text-slate-400 cursor-not-allowed"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      disabled={dest.requiresAuth && !connectedServices.has(dest.id)}
                      title={dest.requiresAuth && !connectedServices.has(dest.id) ? "Connect this service in Destinations tab" : ""}
                    >
                      {DEST_ICONS[dest.id]}
                      {dest.name}
                      {dest.requiresAuth && !connectedServices.has(dest.id) && (
                        <AlertCircle size={10} className="text-slate-300" />
                      )}
                      {connectedServices.has(dest.id) && (
                        <CheckCircle2 size={10} className="text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedDestId === "email" && (
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-2 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                )}
              </div>

              {/* Share link result */}
              {shareLink && selectedDestId === "share-link" && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
                    <CheckCircle2 size={16} />
                    Link generated
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={shareLink}
                      className="flex-1 px-2 py-1.5 text-xs bg-white border border-violet-200 rounded-lg font-mono text-slate-600"
                    />
                    <button onClick={handleCopyLink}
                      className="p-2 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors">
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <button onClick={() => setShowQR((p) => !p)}
                    className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium">
                    <QrCode size={13} />
                    {showQR ? "Hide QR code" : "Show QR code"}
                  </button>
                  {showQR && (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <FakeQRCode value={shareLink} />
                      <p className="text-[10px] text-slate-400">Scan to open export link</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Destinations ── */}
          {activeTab === "destinations" && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">Connect cloud services to send exports directly. Local download is always available.</p>

              {CLOUD_DESTINATIONS.map((dest) => {
                const isConnected = connectedServices.has(dest.id);
                const isConnecting = connectingId === dest.id;
                const colorClass = DEST_COLOR[dest.id];

                return (
                  <div key={dest.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      {DEST_ICONS[dest.id]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{dest.name}</span>
                        {isConnected && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                            <CheckCircle2 size={9} /> Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{dest.description}</p>
                    </div>
                    {dest.requiresAuth && (
                      <button
                        onClick={() => handleConnect(dest.id)}
                        disabled={isConnecting}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${isConnected
                            ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          }`}
                      >
                        {isConnecting ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : isConnected ? "Disconnect" : "Connect"}
                      </button>
                    )}
                    {!dest.requiresAuth && (
                      <span className="shrink-0 text-[10px] text-slate-400 font-medium">Always on</span>
                    )}
                  </div>
                );
              })}

              <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 mb-1">
                  <AlertCircle size={13} /> Integration Note
                </div>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Cloud integrations in this demo simulate the connection flow. In production, OAuth tokens would be stored securely server-side and actual API calls would be made to each service.
                </p>
              </div>
            </div>
          )}

          {/* ── Schedule ── */}
          {activeTab === "schedule" && (
            <div className="p-5 space-y-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Automatic exports</p>
                  <p className="text-xs text-slate-500 mt-0.5">Run exports on a recurring schedule</p>
                </div>
                <button
                  onClick={() => setLocalSchedule((s) => ({ ...s, enabled: !s.enabled }))}
                  className="transition-colors"
                >
                  {localSchedule.enabled
                    ? <ToggleRight size={32} className="text-indigo-600" />
                    : <ToggleLeft size={32} className="text-slate-300" />
                  }
                </button>
              </div>

              <div className={localSchedule.enabled ? "" : "opacity-40 pointer-events-none"}>
                <div className="space-y-4">
                  {/* Frequency */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Frequency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["daily", "weekly", "monthly"] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setLocalSchedule((s) => ({ ...s, frequency: freq }))}
                          className={`py-2 rounded-lg text-xs font-medium border transition-colors capitalize
                            ${localSchedule.frequency === freq
                              ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day of week (weekly only) */}
                  {localSchedule.frequency === "weekly" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Day of week</label>
                      <div className="flex gap-1.5">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => (
                          <button
                            key={day}
                            onClick={() => setLocalSchedule((s) => ({ ...s, dayOfWeek: i }))}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
                              ${localSchedule.dayOfWeek === i
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Day of month (monthly only) */}
                  {localSchedule.frequency === "monthly" && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Day of month</label>
                      <select
                        value={localSchedule.dayOfMonth}
                        onChange={(e) => setLocalSchedule((s) => ({ ...s, dayOfMonth: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>{d === 1 ? "1st" : d === 2 ? "2nd" : d === 3 ? "3rd" : `${d}th`}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Time</label>
                      <input
                        type="time"
                        value={localSchedule.time}
                        onChange={(e) => setLocalSchedule((s) => ({ ...s, time: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Template</label>
                      <select
                        value={localSchedule.templateId}
                        onChange={(e) => setLocalSchedule((s) => ({ ...s, templateId: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {EXPORT_TEMPLATES.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Send to</label>
                    <select
                      value={localSchedule.destinationId}
                      onChange={(e) => setLocalSchedule((s) => ({ ...s, destinationId: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      {CLOUD_DESTINATIONS.filter((d) => !d.requiresAuth || connectedServices.has(d.id)).map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Next export preview */}
                  <div className="flex items-center gap-3 p-3.5 bg-indigo-50 rounded-xl border border-indigo-100">
                    <Clock size={16} className="text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-700">Next export</p>
                      <p className="text-xs text-indigo-500">{describeNextExport(localSchedule)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSchedule}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Save Schedule
              </button>
            </div>
          )}

          {/* ── History ── */}
          {activeTab === "history" && (
            <div className="p-5">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <History size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No exports yet</p>
                  <p className="text-xs text-slate-400 mt-1">Your export history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">{history.length} export{history.length !== 1 ? "s" : ""}</p>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear all
                    </button>
                  </div>

                  {history.map((entry) => {
                    const tmpl = EXPORT_TEMPLATES.find((t) => t.id === entry.templateId);
                    return (
                      <div key={entry.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors group">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${tmpl?.accent ?? "bg-slate-100"}`}>
                          {tmpl?.icon ?? "📄"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800 truncate">{entry.templateName}</span>
                            <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                              ${entry.status === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                              {entry.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              {DEST_ICONS[CLOUD_DESTINATIONS.find((d) => d.name === entry.destination.split(":")[0].trim())?.id ?? "download"]}
                              {entry.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span>{entry.recordCount} records</span>
                            <span>{entry.fileSizeKb} KB</span>
                            <span>.{entry.format}</span>
                            <span className="ml-auto">{formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — only shown on Templates tab */}
        {activeTab === "templates" && (
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            {emailSent ? (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-green-50 rounded-xl border border-green-100 text-green-700 text-sm font-medium">
                <CheckCircle2 size={16} />
                Email sent to {emailInput}
              </div>
            ) : (
              <button
                onClick={handleExport}
                disabled={isProcessing || filteredCount === 0 || (selectedDestId === "email" && !emailInput)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isProcessing ? (
                  <><RefreshCw size={15} className="animate-spin" /> Processing…</>
                ) : selectedDestId === "email" ? (
                  <><Send size={15} /> Send via Email</>
                ) : selectedDestId === "share-link" ? (
                  <><Link2 size={15} /> Generate Share Link</>
                ) : (
                  <><Download size={15} /> Export {filteredCount} Records</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
