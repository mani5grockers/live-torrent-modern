import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
  onRegistered(registration) {
    console.log('Service worker registered:', registration);
    
    // Periodic sync check (every hour)
    setInterval(() => {
      if (registration && registration.update) {
        registration.update();
      }
    }, 60 * 60 * 1000);
  },
  onRegisterError(error) {
    console.error('Service worker registration error:', error);
  }
});

export { updateSW };