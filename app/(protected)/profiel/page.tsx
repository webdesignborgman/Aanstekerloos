"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useEffect, useState } from "react";
import PushManager from "@/components/push/PushManager";
import { doc, collection, getFirestore, onSnapshot, deleteDoc } from "firebase/firestore";
import Image from "next/image";
import { firestore } from "@/lib/firebase";

export default function ProfilePage() {
  const { user } = useAuth();
  const db = getFirestore(); // firestore instance van jouw lib

  type Subscription = {
    id: string;
    platform?: string;
    createdAt?: { toDate?: () => Date };
    // Voeg hier andere velden toe indien nodig
  };

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, "users", user.uid, "subscriptions");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      setSubscriptions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleUnsubscribe = async (subId: string) => {
    await deleteDoc(doc(db, "users", user!.uid, "subscriptions", subId));
  };

  if (!user) {
    return (
      <main className="p-4">
        <p>Even geduld, je wordt ingeladen...</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-4 space-y-8">
      {/* Profielsectie */}
      <section className="flex items-center space-x-4 bg-white p-4 rounded shadow">
        {user.photoURL && (
          <Image
            src={user.photoURL}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold">{user.displayName}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </section>

      {/* Notificatiesectie */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold">Notificatie-instellingen</h3>
        <PushManager />

        {subscriptions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Aangesloten apparaten:</h4>
            <ul className="space-y-2">
              {subscriptions.map((sub) => (
                <li
                  key={sub.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded px-3 py-2 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold">
                      {sub.platform || "Apparaat"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {typeof window !== "undefined" && sub.createdAt?.toDate
                        ? sub.createdAt.toDate().toLocaleString()
                        : " "}
                      {typeof window === "undefined" && ""}
                      {!sub.createdAt?.toDate && "Onbekende datum"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.id)}
                    className="text-red-500 hover:underline mt-2 sm:mt-0 sm:ml-4 text-sm font-medium"
                  >
                    Uitschrijven
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}