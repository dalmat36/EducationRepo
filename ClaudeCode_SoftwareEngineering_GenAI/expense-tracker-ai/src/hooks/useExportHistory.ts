"use client";

import { useState, useEffect, useCallback } from "react";
import { ExportHistoryEntry, ScheduleConfig, DEFAULT_SCHEDULE } from "@/utils/exportCloud";

const HISTORY_KEY = "expense-export-history";
const SCHEDULE_KEY = "expense-export-schedule";
const CONNECTED_KEY = "expense-export-connected";

export function useExportHistory() {
  const [history, setHistory] = useState<ExportHistoryEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [connectedServices, setConnectedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));

      const sched = localStorage.getItem(SCHEDULE_KEY);
      if (sched) setSchedule(JSON.parse(sched));

      const connected = localStorage.getItem(CONNECTED_KEY);
      if (connected) setConnectedServices(new Set(JSON.parse(connected)));
    } catch {
      // ignore parse errors
    }
  }, []);

  const addEntry = useCallback((entry: Omit<ExportHistoryEntry, "id" | "timestamp">) => {
    const newEntry: ExportHistoryEntry = {
      ...entry,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, 50); // cap at 50 entries
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    return newEntry.id;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const updateSchedule = useCallback((config: ScheduleConfig) => {
    setSchedule(config);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(config));
  }, []);

  const toggleConnection = useCallback((serviceId: string) => {
    setConnectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      localStorage.setItem(CONNECTED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  return { history, addEntry, removeEntry, clearHistory, schedule, updateSchedule, connectedServices, toggleConnection };
}
