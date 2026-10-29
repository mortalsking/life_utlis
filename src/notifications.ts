import type { AppData } from "./types";
import {
  calcAttStats,
  calcBunkAdvice,
  calcStreak,
  calcSubjectAttStats,
  fmtMoney,
  monthRange,
  parseISO,
  todayISO,
} from "./utils";

export type NotificationLevel = "danger" | "warning" | "info" | "success";
export type NotificationCategory = "attendance" | "tasks" | "money" | "cloud" | "streak";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  category: NotificationCategory;
  actionTab?: "today" | "attend" | "money" | "tasks" | "notes" | "stats" | "forum" | "settings";
  actionLabel?: string;
  date: string;
  priority: number;
}

const DISMISSED_KEY = "lifeutils_dismissed_notifications_v1";

/**
 * Get IDs of dismissed notifications stored in localStorage
 */
export function getDismissedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

/**
 * Dismiss a specific notification
 */
export function dismissNotificationId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDismissedIds();
    current.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current]));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Dismiss all currently active notifications
 */
export function dismissAllNotificationIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDismissedIds();
    for (const id of ids) current.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current]));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Reset all dismissed notifications so they show again
 */
export function resetDismissedNotifications(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DISMISSED_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Compute real-time required notifications across attendance, tasks, money, and sync
 */
export function computeNotifications(data: AppData, isGuest: boolean): AppNotification[] {
  const notifs: AppNotification[] = [];
  const today = todayISO();
  const targetPct = data.settings?.targetAttendancePct || 75;

  // 1. ATTENDANCE NOTIFICATIONS
  const attStats = calcAttStats(data.attendance);
  if (attStats.total > 0) {
    const overallAdvice = calcBunkAdvice(attStats.present, attStats.total, targetPct);
    if (attStats.percent < targetPct) {
      notifs.push({
        id: "attendance-below-target",
        title: "Attendance Below Target",
        message: `Your overall attendance is ${attStats.percent}% (below your ${targetPct}% goal). ${overallAdvice.message}`,
        level: "danger",
        category: "attendance",
        actionTab: "attend",
        actionLabel: "View Attendance",
        date: today,
        priority: 1,
      });
    } else if (overallAdvice.status === "exact") {
      notifs.push({
        id: "attendance-exact-threshold",
        title: "Attendance on Borderline",
        message: `You are exactly at your ${targetPct}% goal! Do not miss your next lecture.`,
        level: "warning",
        category: "attendance",
        actionTab: "attend",
        actionLabel: "Check Schedule",
        date: today,
        priority: 2,
      });
    }

    // Per-subject risks
    const subjectStats = calcSubjectAttStats(data.attendance);
    for (const subj of subjectStats) {
      if (subj.total > 0 && subj.percent < targetPct) {
        const advice = calcBunkAdvice(subj.present, subj.total, targetPct);
        notifs.push({
          id: `attendance-subj-${subj.subject.toLowerCase().replace(/\s+/g, "-")}`,
          title: `${subj.subject} Attendance At Risk`,
          message: `Currently at ${subj.percent}% (${subj.present}/${subj.total} lectures). ${advice.message}`,
          level: "warning",
          category: "attendance",
          actionTab: "attend",
          actionLabel: `Check ${subj.subject}`,
          date: today,
          priority: 2,
        });
      }
    }
  }

  // 2. BACKLOG & TASKS NOTIFICATIONS
  const openTasks = data.tasks.filter((t) => !t.done);
  const overdueTasks = openTasks.filter((t) => t.due && t.due < today);
  const dueTodayTasks = openTasks.filter((t) => t.due && t.due === today);

  if (overdueTasks.length > 0) {
    notifs.push({
      id: "tasks-overdue-alert",
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? "s" : ""}`,
      message: `"${overdueTasks[0].text}"${
        overdueTasks.length > 1 ? ` and ${overdueTasks.length - 1} more items` : ""
      } passed the due date.`,
      level: "danger",
      category: "tasks",
      actionTab: "tasks",
      actionLabel: "View Backlog",
      date: today,
      priority: 1,
    });
  }

  if (dueTodayTasks.length > 0) {
    notifs.push({
      id: "tasks-due-today-notice",
      title: `${dueTodayTasks.length} Task${dueTodayTasks.length > 1 ? "s" : ""} Due Today`,
      message: `Scheduled for completion today: "${dueTodayTasks[0].text}"${
        dueTodayTasks.length > 1 ? ` +${dueTodayTasks.length - 1} more` : ""
      }.`,
      level: "info",
      category: "tasks",
      actionTab: "tasks",
      actionLabel: "Complete Tasks",
      date: today,
      priority: 3,
    });
  }

  // 3. FINANCIAL / SPENDING SPIKE NOTIFICATIONS
  const todayTxs = data.txs.filter((t) => t.date === today && t.kind === "expense");
  const spentToday = todayTxs.reduce((sum, t) => sum + t.amount, 0);

  // Calculate daily average this month
  const mRange = monthRange();
  const effectiveEnd = mRange.end > today ? today : mRange.end;
  const daysInMonthSoFar =
    Math.max(
      1,
      Math.round(
        (parseISO(effectiveEnd).getTime() - parseISO(mRange.start).getTime()) / 86400000,
      ) + 1,
    );
  const monthExpenses = data.txs
    .filter((t) => t.date >= mRange.start && t.date <= mRange.end && t.kind === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpend = monthExpenses / daysInMonthSoFar;

  if (spentToday >= 500 && avgDailySpend > 0 && spentToday > avgDailySpend * 2) {
    notifs.push({
      id: "money-high-spend-alert",
      title: "Daily Spending Spike",
      message: `You spent ${fmtMoney(spentToday)} today, which is over 2× your daily average (${fmtMoney(avgDailySpend)}).`,
      level: "warning",
      category: "money",
      actionTab: "money",
      actionLabel: "Review Finances",
      date: today,
      priority: 3,
    });
  }

  // 4. CLOUD SYNC & GUEST MODE NOTICE
  if (isGuest) {
    notifs.push({
      id: "cloud-guest-backup-notice",
      title: "Local Guest Mode Active",
      message: "Data is saved locally in this browser. Sign in or register for automatic cloud backup across your devices.",
      level: "info",
      category: "cloud",
      actionTab: "settings",
      actionLabel: "Sign In / Sync",
      date: today,
      priority: 4,
    });
  } else {
    notifs.push({
      id: "cloud-sync-active",
      title: "Cloud Backup Enabled",
      message: "Your attendance, tasks, finances and settings are automatically synced with the cloud.",
      level: "success",
      category: "cloud",
      actionTab: "settings",
      actionLabel: "Account Info",
      date: today,
      priority: 5,
    });
  }

  // 5. STREAK CELEBRATION
  const streak = calcStreak(data.attendance, today);
  if (streak >= 3) {
    notifs.push({
      id: `streak-milestone-${streak}`,
      title: `🔥 ${streak}-Day Attendance Streak!`,
      message: "Great academic consistency! Keep your consecutive classes going strong.",
      level: "success",
      category: "streak",
      actionTab: "attend",
      actionLabel: "View Streak",
      date: today,
      priority: 4,
    });
  }

  return notifs.sort((a, b) => a.priority - b.priority);
}

// ----------------------------------------------------------------------------
// BROWSER WEB NOTIFICATIONS
// ----------------------------------------------------------------------------

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return "denied";
  }
}

export function sendLocalNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;
  try {
    new Notification(title, {
      icon: "/logo.jpg",
      badge: "/logo.jpg",
      ...options,
    });
    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// IN-APP TOAST SYSTEM
// ----------------------------------------------------------------------------

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timestamp: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  show(message: string, type: "success" | "error" | "info" = "info", duration = 3000) {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    const toastItem: ToastMessage = { id, message, type, timestamp: Date.now() };
    this.toasts = [toastItem, ...this.toasts.slice(0, 3)]; // Keep max 4 toasts
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, "success", duration);
  }

  error(message: string, duration?: number) {
    this.show(message, "error", duration);
  }

  info(message: string, duration?: number) {
    this.show(message, "info", duration);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toast = new ToastManager();
