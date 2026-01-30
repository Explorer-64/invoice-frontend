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

let parsedConfig: any;
try {
  const raw = __FIREBASE_CONFIG__;
  parsedConfig = typeof raw === 'string' ? JSON.parse(raw) : raw;
} catch {
  parsedConfig = {};
}

export const config: FirebaseExtensionConfig = configSchema.parse(parsedConfig);
