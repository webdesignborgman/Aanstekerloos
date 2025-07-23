// app/api/web-push/storage.ts
let savedSubscription: unknown = null;

export function setSubscription(sub: unknown) {
  savedSubscription = sub;
}

export function getSubscription(): unknown {
  return savedSubscription;
}
