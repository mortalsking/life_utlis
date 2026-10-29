import { describe, it, expect } from "vitest";
import {
  pct,
  calcAttStats,
  calcSubjectAttStats,
  calcBunkAdvice,
  calcStreak,
  fmtMoney,
  addDaysISO,
  startOfWeekISO,
  inRange,
} from "./utils";
import { defaultData, sanitizeAndValidateAppData } from "./types";
import { computeNotifications } from "./notifications";

describe("Math & Percentage Utilities", () => {
  it("calculates percentage correctly and rounds to whole number", () => {
    expect(pct(3, 4)).toBe(75);
    expect(pct(2, 3)).toBe(67);
    expect(pct(0, 10)).toBe(0);
    expect(pct(0, 0)).toBe(0);
  });
});

describe("Attendance Statistics Calculator", () => {
  it("computes overall attendance summary accurately", () => {
    const entries = [
      { status: "present" },
      { status: "present" },
      { status: "absent" },
      { status: "present" },
    ];
    const stats = calcAttStats(entries);
    expect(stats.total).toBe(4);
    expect(stats.present).toBe(3);
    expect(stats.absent).toBe(1);
    expect(stats.percent).toBe(75);
  });

  it("handles empty attendance lists gracefully", () => {
    const stats = calcAttStats([]);
    expect(stats.total).toBe(0);
    expect(stats.present).toBe(0);
    expect(stats.percent).toBe(0);
  });

  it("calculates breakdown per subject correctly", () => {
    const entries = [
      { subject: "Maths", status: "present" },
      { subject: "Maths", status: "present" },
      { subject: "Physics", status: "absent" },
      { subject: "Physics", status: "present" },
    ];
    const subjectStats = calcSubjectAttStats(entries);
    expect(subjectStats).toHaveLength(2);

    const maths = subjectStats.find((s) => s.subject === "Maths");
    expect(maths?.percent).toBe(100);

    const physics = subjectStats.find((s) => s.subject === "Physics");
    expect(physics?.percent).toBe(50);
  });
});

describe("Bunk Advisor Algorithm (calcBunkAdvice)", () => {
  it("returns no_data when no classes have been logged", () => {
    const advice = calcBunkAdvice(0, 0, 75);
    expect(advice.status).toBe("no_data");
    expect(advice.margin).toBe(0);
  });

  it("calculates safe bunk margin when above target percentage", () => {
    // 9 out of 10 = 90%. Target is 75%.
    // present / 0.75 - 10 = 12 - 10 = 2 classes can be skipped.
    const advice = calcBunkAdvice(9, 10, 75);
    expect(advice.status).toBe("safe");
    expect(advice.margin).toBe(2);
    expect(advice.message).toContain("Safe to miss 2 lectures");
  });

  it("calculates exact required classes when below target percentage", () => {
    // 6 out of 10 = 60%. Target is 75%.
    // Need to attend consecutive classes to reach 75%.
    // (0.75*10 - 6) / (1 - 0.75) = 1.5 / 0.25 = 6 consecutive classes.
    const advice = calcBunkAdvice(6, 10, 75);
    expect(advice.status).toBe("short");
    expect(advice.margin).toBe(6);
    expect(advice.message).toContain("Need to attend 6 consecutive lectures");
  });

  it("reports exact target reached correctly", () => {
    // 3 out of 4 = 75% exactly
    const advice = calcBunkAdvice(3, 4, 75);
    expect(advice.status).toBe("exact");
    expect(advice.margin).toBe(0);
  });

  it("adapts dynamically to custom target thresholds (e.g. 80%, 85%)", () => {
    // 8 out of 10 = 80%. Target 80%
    const advice80 = calcBunkAdvice(8, 10, 80);
    expect(advice80.status).toBe("exact");

    // 8 out of 10 = 80%. Target 85% -> short
    const advice85 = calcBunkAdvice(8, 10, 85);
    expect(advice85.status).toBe("short");
  });
});

describe("Streak Counter (calcStreak)", () => {
  it("counts consecutive present days correctly", () => {
    const today = "2026-10-25";
    const entries = [
      { date: "2026-10-25", status: "present" },
      { date: "2026-10-24", status: "present" },
      { date: "2026-10-23", status: "present" },
    ];
    expect(calcStreak(entries, today)).toBe(3);
  });

  it("stops counting streak at first absent class", () => {
    const today = "2026-10-25";
    const entries = [
      { date: "2026-10-25", status: "present" },
      { date: "2026-10-24", status: "absent" },
      { date: "2026-10-23", status: "present" },
    ];
    expect(calcStreak(entries, today)).toBe(1);
  });
});

describe("Currency & Financial Formatting (fmtMoney)", () => {
  it("formats currencies with given symbol correctly", () => {
    expect(fmtMoney(1250, "₹")).toBe("₹1,250");
    expect(fmtMoney(99.4, "$")).toBe("$99");
    expect(fmtMoney(500, "€")).toBe("€500");
  });
});

describe("ISO Date Utilities", () => {
  it("adds and subtracts days correctly", () => {
    expect(addDaysISO("2026-10-20", 5)).toBe("2026-10-25");
    expect(addDaysISO("2026-10-25", -5)).toBe("2026-10-20");
  });

  it("determines Monday-based start of the week", () => {
    // 2026-10-25 is Sunday. Start of week is Monday 2026-10-19.
    expect(startOfWeekISO("2026-10-25")).toBe("2026-10-19");
  });

  it("evaluates inRange boundaries correctly", () => {
    const range = { start: "2026-10-01", end: "2026-10-31" };
    expect(inRange("2026-10-15", range)).toBe(true);
    expect(inRange("2026-10-01", range)).toBe(true);
    expect(inRange("2026-11-01", range)).toBe(false);
  });
});

describe("Data Sanitization & Resilience (sanitizeAndValidateAppData)", () => {
  it("recovers safely from invalid or corrupted raw input", () => {
    const invalid = {
      txs: "not-an-array",
      attendance: null,
      tasks: {},
      journal: 123,
      links: "links",
      subjects: [],
      settings: {
        targetAttendancePct: 150, // invalid > 100
        currencySymbol: "$$$$$$$$$$$$$$$$$$$$$$",
      },
    };

    const clean = sanitizeAndValidateAppData(invalid);
    expect(Array.isArray(clean.txs)).toBe(true);
    expect(clean.txs).toHaveLength(0);
    expect(Array.isArray(clean.attendance)).toBe(true);
    expect(Array.isArray(clean.tasks)).toBe(true);
    expect(clean.subjects).toEqual(["Class"]);
    expect(clean.settings.targetAttendancePct).toBe(75);
    expect(clean.settings.currencySymbol.length).toBeLessThanOrEqual(5);
  });

  it("preserves valid data structures intact", () => {
    const valid = {
      version: 2,
      txs: [{ id: "tx-1", date: "2026-10-28", kind: "expense" as const, category: "Food", amount: 150 }],
      attendance: [{ id: "att-1", date: "2026-10-28", subject: "Math", status: "present" as const }],
      tasks: [{ id: "task-1", text: "Study", created: "2026-10-28", done: false }],
      journal: [],
      links: [],
      subjects: ["Math", "Physics"],
      settings: {
        userName: "Alex",
        targetAttendancePct: 80,
        currencySymbol: "₹",
      },
    };

    const clean = sanitizeAndValidateAppData(valid);
    expect(clean.txs).toHaveLength(1);
    expect(clean.attendance).toHaveLength(1);
    expect(clean.tasks).toHaveLength(1);
    expect(clean.subjects).toEqual(["Math", "Physics"]);
    expect(clean.settings.userName).toBe("Alex");
    expect(clean.settings.targetAttendancePct).toBe(80);
  });
});

describe("Notification Engine (computeNotifications)", () => {
  it("generates critical attendance notification when below target", () => {
    const data = defaultData();
    data.settings.targetAttendancePct = 75;
    data.attendance = [
      { id: "1", date: "2026-10-28", subject: "Math", status: "absent" },
      { id: "2", date: "2026-10-28", subject: "Math", status: "absent" },
      { id: "3", date: "2026-10-28", subject: "Math", status: "present" },
    ]; // 33%

    const notifs = computeNotifications(data, false);
    const attNotif = notifs.find((n) => n.id === "attendance-below-target");
    expect(attNotif).toBeDefined();
    expect(attNotif?.level).toBe("danger");
    expect(attNotif?.message).toContain("33%");
  });

  it("generates overdue tasks notification for past due dates", () => {
    const data = defaultData();
    data.tasks = [
      { id: "1", text: "Submit assignment", created: "2026-10-20", due: "2026-10-21", done: false },
      { id: "2", text: "Buy books", created: "2026-10-20", done: false },
    ];

    const notifs = computeNotifications(data, false);
    const taskNotif = notifs.find((n) => n.id === "tasks-overdue-alert");
    expect(taskNotif).toBeDefined();
    expect(taskNotif?.level).toBe("danger");
    expect(taskNotif?.message).toContain("Submit assignment");
  });

  it("informs user about guest mode and cloud sync status", () => {
    const data = defaultData();
    const guestNotifs = computeNotifications(data, true);
    expect(guestNotifs.some((n) => n.id === "cloud-guest-backup-notice")).toBe(true);

    const authNotifs = computeNotifications(data, false);
    expect(authNotifs.some((n) => n.id === "cloud-sync-active")).toBe(true);
  });
});
