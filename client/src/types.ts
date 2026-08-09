export interface WorkEvent {
  id: string;
  title: string;
  projectName: string;
  client: string;
  start: string;
  end: string;
  breakTime: number;
  totalHours: number;
  location: string;
  description: string;
  colorLabel: string;
  startDateTime: string;
  endDateTime: string;
  googleEventId?: string;
  createdAt: string;
}

export interface DashboardStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  projectCount: number;
  recentActivities: Array<{ id: string; title: string; time: string }>;
  hoursByDay: Array<{ day: string; hours: number }>;
}
