import { z } from "zod";

const configSchema = z.object({
  signInOptions: z
    .object({
      google: z.coerce.boolean().default(false),
      github: z.coerce.boolean().default(false),
      facebook: z.coerce.boolean().default(false),
      twitter: z.coerce.boolean().default(false),
      emailAndPassword: z.coerce.boolean().default(false),
      magicLink: z.coerce.boolean().default(false),
    })
    .optional()
    .default({ google: true, github: false, facebook: false, twitter: false, emailAndPassword: false, magicLink: false }),
  siteName: z.string().optional().default("Invoice"),
  signInSuccessUrl: z.preprocess(
    (it) => it || "/",
    z.string().optional().default("/"),
  ),
  tosLink: z.string().optional(),
  privacyPolicyLink: z.string().optional(),
  firebaseConfig: z
    .object({
      apiKey: z.string().default(""),
      authDomain: z.string().default(""),
      projectId: z.string().default(""),
      storageBucket: z.string().default(""),
      messagingSenderId: z.string().default(""),
      appId: z.string().default(""),
    })
    .optional()
    .default({}),
});

type FirebaseExtensionConfig = z.infer<typeof configSchema>;

// This is set by vite.config.ts
declare const __FIREBASE_CONFIG__: string;

// Handle case where __FIREBASE_CONFIG__ might be an object (from Vite define)
let firebaseConfigRaw: string;
try {
  if (typeof __FIREBASE_CONFIG__ === 'string') {
    firebaseConfigRaw = __FIREBASE_CONFIG__;
  } else {
    // If it's an object, stringify it
    firebaseConfigRaw = JSON.stringify(__FIREBASE_CONFIG__);
  }
  
  // Debug: log what we're getting
  console.log('[Firebase Config] Raw value type:', typeof __FIREBASE_CONFIG__);
  console.log('[Firebase Config] Raw value:', firebaseConfigRaw.substring(0, 100));
} catch (e) {
  console.error('Error processing __FIREBASE_CONFIG__:', e);
  firebaseConfigRaw = '{}';
}

let parsedConfig: any;
try {
  parsedConfig = JSON.parse(firebaseConfigRaw);
  console.log('[Firebase Config] Parsed successfully:', !!parsedConfig.firebaseConfig);
} catch (e) {
  console.error('[Firebase Config] JSON parse error:', e);
  console.error('[Firebase Config] Raw value was:', firebaseConfigRaw);
  parsedConfig = {};
}

export const config: FirebaseExtensionConfig = configSchema.parse(parsedConfig);
