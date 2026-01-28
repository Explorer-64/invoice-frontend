import { APP_BASE_PATH } from "app";

// PWA Service Worker Registration
// This file registers the service worker for offline capability

// State for diagnostics
let swRegistration: ServiceWorkerRegistration | null = null;
let swError: any = null;

export function getSWStatus() {
  return {
    registration: swRegistration,
    error: swError
  };
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const register = () => {
      // Construct the path to the service worker
      // APP_BASE_PATH might be "/" or "/some-path/". 
      // If it's just "/", we want "/sw.js".
      // If it's "/app/", we want "/app/sw.js".
      
      const basePath = APP_BASE_PATH.endsWith('/') 
        ? APP_BASE_PATH 
        : `${APP_BASE_PATH}/`;
        
      // Ensure we don't have double slashes if APP_BASE_PATH is "/"
      const swUrl = `${basePath}sw.js`;

      console.log(`[PWA] Registering SW at: ${swUrl} with scope: ${basePath}`);
      
      // Pre-check: Verify SW exists and is a JS file
      fetch(swUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`SW file not found (Status: ${response.status})`);
          }
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('javascript')) {
            throw new Error(`SW file has invalid MIME type: ${contentType}`);
          }
          console.log('✅ SW file validated:', { status: response.status, type: contentType });
          
          // Proceed with registration
          return navigator.serviceWorker.register(swUrl, { scope: basePath });
        })
        .then((registration) => {
          console.log('✅ SW registered with scope:', registration.scope);
          swRegistration = registration;
        })
        .catch((error) => {
          // Only log SW errors in production, silently fail in development
          if (import.meta.env.PROD) {
            console.error('❌ SW registration failed:', error);
            console.error('❌ Error Name:', error.name);
            console.error('❌ Error Message:', error.message);
            console.error('❌ SW Path:', swUrl);
            console.error('❌ Base Path:', basePath);
          }
          swError = error;
        });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }
  } else {
    swError = new Error("Service Worker not supported in this browser");
  }
}

// PWA Install Prompt
let deferredPrompt: any = null;
const installListeners: ((prompt: any) => void)[] = [];

export function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('✅ PWA install prompt captured');
    
    // Notify listeners
    installListeners.forEach(listener => listener(deferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    deferredPrompt = null;
    console.log('✅ PWA installed successfully');
    // Notify listeners
    installListeners.forEach(listener => listener(null));
  });
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function onInstallPrompt(callback: (prompt: any) => void) {
  installListeners.push(callback);
  if (deferredPrompt) {
    callback(deferredPrompt);
  }

  return () => {
    const index = installListeners.indexOf(callback);
    if (index > -1) {
      installListeners.splice(index, 1);
    }
  };
}

export async function promptPWAInstall() {
  if (!deferredPrompt) {
    return false;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response to install prompt: ${outcome}`);
  
  deferredPrompt = null;
  installListeners.forEach(listener => listener(null));
  
  return outcome === 'accepted';
}
