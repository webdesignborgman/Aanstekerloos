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