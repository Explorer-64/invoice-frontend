import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'
import './index.css'
// Polyfill for support react use in react 18
import "./polyfills/react-polyfill";

// Temporarily disable Strict Mode to fix Firebase Auth UI issue
// TODO: Re-enable Strict Mode once react-firebaseui is updated or replaced
const isDevelopment = import.meta.env.DEV;
const App = <AppWrapper />;

createRoot(document.getElementById('root')!).render(
  isDevelopment ? App : <StrictMode>{App}</StrictMode>,
)
