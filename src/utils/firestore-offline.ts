import { enableIndexedDbPersistence } from 'firebase/firestore';
import { firestore } from 'app';

/**
 * Initialize Firestore offline persistence.
 * This enables automatic offline caching and sync when online.
 * 
 * Features:
 * - All reads/writes work offline using local cache
 * - Changes are queued and synced when back online
 * - Real-time listeners work with cached data
 * - Multi-tab support enabled
 */
let persistenceEnabled = false;

export const initializeOfflineSupport = () => {
  // Only enable persistence once
  if (persistenceEnabled) {
    return;
  }

  enableIndexedDbPersistence(firestore, {
    // Allow multiple tabs to access Firestore simultaneously
    synchronizeTabs: true,
  })
    .then(() => {
      persistenceEnabled = true;
      console.log('✅ Firestore offline persistence enabled');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firestore offline persistence: Multiple tabs detected');
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn('Firestore offline persistence not supported in this browser');
      } else if (err.message?.includes('already been started')) {
        // Firestore was already used before persistence could be enabled
        // This is okay - persistence just won't be available
        console.warn('Firestore persistence: Already started, skipping persistence');
      } else {
        console.error('Failed to enable Firestore offline persistence:', err);
      }
    });
};

// Auto-initialize
initializeOfflineSupport();
