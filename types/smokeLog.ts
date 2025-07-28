// types/smokeLog.ts
export interface SmokeLog {
  id: string;
  timestamp: Date;
  createdBy: string;
  emotions: string[];
  triggers: string[];
  note?: string;
  location?: string | null;
  isWorkday?: boolean;
  urgency?: number;
}

export interface UserData {
  motivatie: string;
  plannedStopDate: string;
  realStopDate: { seconds: number; nanoseconds: number } | null;
  pricePerPack: number;
  cigsPerPack: number;
  type: string;
  sigarettenGedraaid: number;
  pakjesPerWeek: number;
  sigarettenPerPakje: number;
}