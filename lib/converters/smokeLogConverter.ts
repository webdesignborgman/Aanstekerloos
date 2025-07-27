// lib/converters/smokeLogConverter.ts
import {
  FirestoreDataConverter,
  Timestamp,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
} from "firebase/firestore";
import { SmokeLog } from "@/types/smokeLog";

export const smokeLogConverter: FirestoreDataConverter<SmokeLog> = {
  toFirestore(log: SmokeLog): DocumentData {
    const { /* id, */ ...rest } = log;
    return {
      ...rest,
      timestamp: Timestamp.fromDate(log.timestamp),
      emotions: rest.emotions?.length ? rest.emotions : [],
      triggers: rest.triggers?.length ? rest.triggers : [],
      note: rest.note ?? null,
      createdBy: rest.createdBy,
      urgency: typeof rest.urgency === "number" ? rest.urgency : null,
      isWorkday: typeof rest.isWorkday === "boolean" ? rest.isWorkday : null,
      location: rest.location ?? null,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): SmokeLog {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      timestamp: (data.timestamp as Timestamp).toDate(),
      createdBy: data.createdBy,
      emotions: Array.isArray(data.emotions) ? data.emotions : [],
      triggers: Array.isArray(data.triggers) ? data.triggers : [],
      note: (data.note as string) ?? null,
      urgency: typeof data.urgency === "number" ? data.urgency : undefined,
      isWorkday: typeof data.isWorkday === "boolean" ? data.isWorkday : undefined,
      location: data.location ?? null,
    };
  },
};
