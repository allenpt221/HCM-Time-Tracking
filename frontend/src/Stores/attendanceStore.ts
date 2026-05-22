import { create } from 'zustand';
import axios from '@/lib/axios';

interface AttendanceRecord {
  id: string;
  userId: string;
  attendanceId: string;
  date: string;
  timeIn: { _seconds: number; _nanoseconds: number } | null;
  timeOut: { _seconds: number; _nanoseconds: number } | null;
  late: number;
  regularHours: number;
  overtime: number;
  undertime: number;
  nightDifferential: number;
  totalHours: number;
}

interface AdminAttendanceRecord {
  id: string;
  userId: string;
  attendanceId: string;
  date: string;
  timeIn: { _seconds: number; _nanoseconds: number } | null;
  timeOut: { _seconds: number; _nanoseconds: number } | null;
  late: number;
  regularHours: number;
  overtime: number;
  undertime: number;
  nightDifferential: number;
  totalHours: number;
  user: {
    name: string;
    email: string;
    role: string;
    schedule?: { start: string; end: string };  // ← add this
  } | null;
}


interface PunchOutResult {
  regularHours: number;
  totalHours: number;
  late: string;
  undertime: string;
  overtime: string;
}

interface AttendanceState {
  loading: boolean;
  error: string | null;
  attendanceId: string | null;
  summaryId: string | null;
  lateMinutes: number;
  isClockedIn: boolean;
  punchOutResult: PunchOutResult | null;
  history: AttendanceRecord[];
  elapsed: number;
  punchInTime: Date | null;
  EmployeeAttendance: AdminAttendanceRecord[] | null;
  
  punchIn: () => Promise<{ success: boolean }>;
  punchOut: () => Promise<{ success: boolean }>;
  fetchAttendance: () => Promise<void>;
  clearError: () => void;
  startTimer: (from: Date) => void;
  stopTimer: () => void;
  AdminAttendance: () => void;
  updatePunch: (id: string, punchIn?: string, punchOut?: string) => Promise<{ success: boolean }>;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;

export const attendanceStore = create<AttendanceState>()((set, get) => ({
  loading: false,
  error: null,
  attendanceId: null,
  summaryId: null,
  lateMinutes: 0,
  isClockedIn: false,
  punchOutResult: null,
  history: [],
  elapsed: 0,
  punchInTime: null,
  EmployeeAttendance: null,

  startTimer: (from: Date) => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const seconds = Math.floor((Date.now() - from.getTime()) / 1000);
      set({ elapsed: seconds });
    }, 1000);
    set({
      punchInTime: from,
      elapsed: Math.floor((Date.now() - from.getTime()) / 1000),
    });
  },

  stopTimer: () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    set({ elapsed: 0, punchInTime: null });
  },

punchIn: async (): Promise<{ success: boolean }> => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post('attendance/punch-in');
    const now = new Date();
    const today = new Date().toISOString().split("T")[0];

    const newRecord: AttendanceRecord = {
      id: res.data.data.summaryId,
      userId: '',
      attendanceId: res.data.data.attendanceId,
      date: today,
      timeIn: { _seconds: Math.floor(now.getTime() / 1000), _nanoseconds: 0 },
      timeOut: null,
      late: 0,
      regularHours: 0,
      overtime: 0,
      undertime: 0,
      nightDifferential: 0,
      totalHours: 0,
    };

    set((state) => ({
      loading: false,
      attendanceId: res.data.data.attendanceId,
      summaryId: res.data.data.summaryId,
      isClockedIn: true,
      history: [newRecord, ...state.history],
    }));

    get().startTimer(now);

    // Sync with server in background
    get().fetchAttendance();

    return { success: true };

  } catch (error: any) {
    set({ loading: false, error: error.response?.data?.message ?? "Punch-in failed" });
    return { success: false };
  }
},

punchOut: async (): Promise<{ success: boolean }> => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post('attendance/punch-out');
    const now = new Date();
    const data = res.data.data;

    set((state) => ({
      loading: false,
      isClockedIn: false,
      punchOutResult: data,
      attendanceId: null,
      summaryId: null,
      history: state.history.map((r) =>
        r.attendanceId === state.attendanceId
          ? {
              ...r,
              // Only update timeOut optimistically, leave computed fields for fetchAttendance
              timeOut: { _seconds: Math.floor(now.getTime() / 1000), _nanoseconds: 0 },
            }
          : r
      ),
    }));

    get().stopTimer();

    // Fetch real computed values from server
    await get().fetchAttendance();

    return { success: true };

  } catch (error: any) {
    set({ loading: false, error: error.response?.data?.message ?? "Punch-out failed" });
    return { success: false };
  }
},

fetchAttendance: async (): Promise<void> => {
  set({ loading: true, error: null });
  try {
    const res = await axios.get('attendance/user-attendance');
    const today = new Date().toISOString().split("T")[0];

    const all: AttendanceRecord[] = res.data.data;

    // Only show today's records, sorted by timeIn descending
    const todayRecords = all
      .filter(r => r.date === today)
      .sort((a, b) => (b.timeIn?._seconds ?? 0) - (a.timeIn?._seconds ?? 0));

    const active = todayRecords.find(r => !r.timeOut);

    set({
      loading: false,
      history: todayRecords,
      isClockedIn: !!active,
      attendanceId: active?.attendanceId ?? null,
      summaryId: active?.id ?? null,
      lateMinutes: active?.late ?? 0,
    });

    if (active?.timeIn) {
      const punchInDate = new Date(active.timeIn._seconds * 1000);
      get().startTimer(punchInDate);
    }

  } catch (error: any) {
    set({
      loading: false,
      error: error.response?.data?.message ?? "Failed to fetch attendance",
    });
  }
},

AdminAttendance: async (): Promise<void> => {
  set({ loading: true, error: null });
  try {
    const res = await axios.get('admin/allattendance');
    set({ EmployeeAttendance: res.data.data, loading: false });
  } catch (error: any) {
    set({
      loading: false,
      error: error.response?.data?.message ?? "Failed to fetch all attendance",
    });
  }
},

updatePunch: async (id: string, punchIn?: string, punchOut?: string): Promise<{ success: boolean }> => {
  set({ loading: true, error: null });
  try {
    const body: Record<string, string> = {};
    if (punchIn)  body.punchIn  = punchIn;
    if (punchOut) body.punchOut = punchOut;

    await axios.patch(`admin/update/${id}`, body);
    get().AdminAttendance();

    set({ loading: false });
    return { success: true };
  } catch (error: any) {
    set({
      loading: false,
      error: error.response?.data?.message ?? "Failed to update punch",
    });
    return { success: false };
  }
},

  clearError: () => set({ error: null }),
}));