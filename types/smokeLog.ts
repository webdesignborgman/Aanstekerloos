// /types/smokeLog.ts
export interface SmokeLog {
  id: string;
  timestamp: Date;
  emotions: string[];   // nu array
  triggers: string[];   // nu array
  note?: string | null;
  createdBy: string;
}
