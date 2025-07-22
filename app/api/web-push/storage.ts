// app/api/web-push/storage.ts
let savedSubscription: any = null;

export function setSubscription(sub: any) {
  savedSubscription = sub;
}

export function getSubscription() {
  return savedSubscription;
}
