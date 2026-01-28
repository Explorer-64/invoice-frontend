import { useState, useEffect } from "react";
import brain from "brain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Translate } from "components/Translate";

export function SettingsAdmin() {
  const [adminFeedback, setAdminFeedback] = useState<any[]>([]);
  const [loadingAdminFeedback, setLoadingAdminFeedback] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetchAdminFeedback();
    fetchSystemHealth();
  }, []);

  const fetchAdminFeedback = async () => {
    try {
      setLoadingAdminFeedback(true);
      const res = await brain.list_feedback();
      const data = await res.json();
      setAdminFeedback(data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoadingAdminFeedback(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await brain.check_system_health();
      setSystemHealth(await res.json());
    } catch (error) {
      console.error("Failed to check system health:", error);
      setSystemHealth({ status: "error", issues: ["Failed to fetch system health status"] });
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                <Translate>System Health</Translate>
              </CardTitle>
              <CardDescription>
                <Translate>Monitor system status and critical errors</Translate>
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSystemHealth} disabled={loadingHealth}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingHealth ? 'animate-spin' : ''}`} />
              <Translate>Refresh</Translate>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingHealth ? (
             <div className="flex items-center justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          ) : !systemHealth ? (
            <div className="text-center py-8 text-muted-foreground">
              <Translate>Click refresh to check system health.</Translate>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border ${systemHealth.status === 'ok' ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-destructive/10 border-destructive/20'}`}>
              <div className="flex items-start gap-3">
                {systemHealth.status === 'ok' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div>
                  <h3 className={`font-medium ${systemHealth.status === 'ok' ? 'text-green-900 dark:text-green-100' : 'text-destructive'}`}>
                    {systemHealth.status === 'ok' ? <Translate>All Systems Operational</Translate> : <Translate>System Issues Detected</Translate>}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Translate>Last checked:</Translate> {new Date(systemHealth.checked_at).toLocaleString()}
                  </p>
                  
                  {systemHealth.issues && systemHealth.issues.length > 0 && (
                    <ul className="mt-3 list-disc list-inside text-sm text-destructive space-y-1">
                      {systemHealth.issues.map((issue: string, i: number) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle><Translate>User Feedback</Translate></CardTitle>
          <CardDescription>
            <Translate>View feedback submitted by users.</Translate>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdminFeedback ? (
            <div className="text-center py-8"><Translate>Loading feedback...</Translate></div>
          ) : adminFeedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><Translate>No feedback received yet.</Translate></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Translate>Date</Translate></TableHead>
                    <TableHead><Translate>Type</Translate></TableHead>
                    <TableHead><Translate>User</Translate></TableHead>
                    <TableHead><Translate>Message</Translate></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(item.created_at).toLocaleDateString()} <br/>
                        {new Date(item.created_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'bug' ? 'destructive' : item.type === 'feature' ? 'secondary' : 'outline'}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs" title={item.user_id}>
                        {item.user_id}
                      </TableCell>
                      <TableCell className="max-w-[300px] break-words">
                        {item.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
