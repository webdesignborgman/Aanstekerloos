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
      // destruct voor te verwijderen velden die we NIET willen opslaan
      const { id, ...rest } = log;
      return {
        ...rest,
        timestamp: Timestamp.fromDate(log.timestamp),
        location: rest.location ?? null,
        emotion: rest.emotion ?? null,
        trigger: rest.trigger ?? null,
        note: rest.note ?? null,
        // createdBy is verplicht in je model, dus deze moet altijd aanwezig zijn
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
        location: data.location ?? null,
        emotion: data.emotion ?? null,
        trigger: data.trigger ?? null,
        note: data.note ?? null,
      };
    },
  };
  