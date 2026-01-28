import { useState } from "react";
import { ref, uploadBytes, listAll } from "firebase/storage";
import { firebaseApp } from "app";
import { getStorage } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useCurrentUser } from "app";

export default function StorageTestPage() {
  const { user } = useCurrentUser();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [results, setResults] = useState<Array<{ path: string; success: boolean; error?: string }>>([]);

  // Get storage instances
  // 1. Default storage (from config) - for user data
  const defaultStorage = getStorage(firebaseApp);
  
  // 2. Shared storage (explicit) - for marketplace
  // We use the specific bucket URL to access it regardless of the default config
  const SHARED_BUCKET_URL = "gs://stackapps-aeb90.firebasestorage.app";
  const sharedStorage = getStorage(firebaseApp, SHARED_BUCKET_URL);

  const testPath = async (storage: any, path: string, description: string) => {
    try {
      const testFileRef = ref(storage, path);
      const blob = new Blob([`test content for ${path} at ${new Date().toISOString()}`], { type: "text/plain" });
      
      await uploadBytes(testFileRef, blob);
      return { path: description, success: true };
    } catch (error: any) {
      console.error(`Error testing ${path}:`, error);
      let errorMsg = error.message;
      if (error.code === 'storage/unauthorized') errorMsg = "Permission Denied (Rules)";
      return { path: description, success: false, error: errorMsg };
    }
  };

  const testConnection = async () => {
    if (!user) {
      setResults([{ path: "User Auth", success: false, error: "You must be logged in to test storage rules." }]);
      return;
    }

    setStatus("loading");
    setResults([]);

    const tests = [
      // Test 1: Private Data on DEFAULT bucket (Should work for your invoices)
      testPath(defaultStorage, `private_data/invoice-my-jobs/${user.uid}/connection_test.txt`, "Private Data (Default Bucket)"),
      
      // Test 2: Marketplace Assets on SHARED bucket (Explicitly connecting to stackapps bucket)
      testPath(sharedStorage, `marketplace_assets/invoice-my-jobs/connection_test.txt`, "Shared Assets (StackApps Bucket)"),
      
      // Test 3: Root on SHARED bucket (Should FAIL)
      testPath(sharedStorage, `root_test_${Date.now()}.txt`, "Root Directory (Shared Bucket)"),
    ];

    const outcomes = await Promise.all(tests);
    setResults(outcomes);
    setStatus("success"); // We successfully ran the tests, even if some failed
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Shared Storage Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md space-y-2">
             <div>
               <p className="text-sm font-medium">Target Bucket:</p>
               <code className="text-xs bg-black text-white p-1 rounded">stackapps-aeb90.firebasestorage.app</code>
             </div>
             <div>
               <p className="text-sm font-medium">Current User:</p>
               <code className="text-xs bg-black text-white p-1 rounded">{user?.email || "Not logged in"}</code>
             </div>
          </div>

          <Button onClick={testConnection} disabled={status === "loading" || !user}>
            {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection Paths
          </Button>

          {!user && (
             <Alert variant="destructive">
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>Please log in to test storage permissions.</AlertDescription>
            </Alert>
          )}

          {results.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {results.map((res, idx) => (
                <div key={idx} className={`p-3 rounded border flex items-start gap-3 ${res.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  {res.success ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                  <div>
                    <p className="font-medium text-sm">{res.path}</p>
                    {res.error && <p className="text-xs text-red-600 mt-1">{res.error}</p>}
                    {res.success && <p className="text-xs text-green-600 mt-1">Write successful</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>Based on rules:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Root: Only admins ({'{'}abereimer64, stackapps.app{'}'}@gmail.com)</li>
              <li>Marketplace: Public Read, Auth Write</li>
              <li>Private Data: Owner Read/Write</li>
            </ul>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
