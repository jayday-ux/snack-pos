// Service worker: เก็บตัวแอปไว้ในเครื่อง เปิดตอนเน็ตหลุดได้
// หน้าแอป/สคริปต์/ฟอนต์: ใช้ของในเครื่องก่อน แล้วอัปเดตเบื้องหลัง (เปิดครั้งถัดไปจะได้เวอร์ชันใหม่)
// การเรียก API ของ Apps Script ไม่แคช
const C = 'pos-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.url.includes('script.google.com') || r.url.includes('script.googleusercontent.com')) return;
  e.respondWith(caches.match(r, { ignoreSearch: r.mode === 'navigate' }).then(hit => {
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => null);
    return hit || net.then(res => res || caches.match('index.html', { ignoreSearch: true }));
  }));
});
