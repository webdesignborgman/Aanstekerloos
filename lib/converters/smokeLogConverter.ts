import {
    FirestoreDataConverter,
    Timestamp,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData
  } from "firebase/firestore";
  import { SmokeLog } from "@/types/smokeLog";
  
  // Type zonder id voor lees/schrijf; id komt uit Firestore zelf
  type SmokeLogNoID = Omit<SmokeLog, "id"> & { timestamp: Date };
  
  // Converter definitie
  export const smokeLogConverter: FirestoreDataConverter<SmokeLog> = {
    toFirestore(log: SmokeLog): DocumentData {
      const { id, ...rest } = log;
      return {
        ...rest,
        timestamp: Timestamp.fromDate(log.timestamp),
        emotions: rest.emotions?.length ? rest.emotions : [], // altijd array
        triggers: rest.triggers?.length ? rest.triggers : [], // altijd array
        note: rest.note ?? null,
        createdBy: rest.createdBy,
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
      };
    },
  };
  