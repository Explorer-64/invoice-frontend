import { useState } from "react";
import { useCurrentUser, auth } from "app/auth";
import brain from "brain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, LogOut, Trash2, AlertTriangle, Pencil, Check, X, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, updateEmail, EmailAuthProvider, linkWithCredential } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Translate } from "components/Translate";

export function SettingsAccount() {
  const { user } = useCurrentUser();
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  // Edit states
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingName, setSavingName] = useState(false);
  
  // Password management states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Check if user has password provider (not just Google)
  const hasPasswordProvider = user?.providerData?.some(
    (provider) => provider.providerId === "password"
  );
  const hasGoogleProvider = user?.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );

  const handleDeleteAccountData = async () => {
    try {
      setDeletingAccount(true);
      await brain.delete_account_data();
      toast.success("All account data deleted successfully");
      
      // Redirect to sign out to clear session
      await auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete account data:", error);
      toast.error("Failed to delete account data. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    window.location.href = "/";
  };
  
  const handleEditEmail = () => {
    setNewEmail(user?.email || "");
    setEditingEmail(true);
  };
  
  const handleEditName = () => {
    setNewName(user?.displayName || "");
    setEditingName(true);
  };
  
  const handleSaveEmail = async () => {
    if (!user || !newEmail.trim()) return;
    
    try {
      setSavingEmail(true);
      await updateEmail(user, newEmail);
      toast.success("Email updated successfully");
      setEditingEmail(false);
    } catch (error: any) {
      console.error("Failed to update email:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please sign out and sign in again to update your email");
      } else {
        toast.error("Failed to update email. " + error.message);
      }
    } finally {
      setSavingEmail(false);
    }
  };
  
  const handleSaveName = async () => {
    if (!user) return;
    
    try {
      setSavingName(true);
      await updateProfile(user, { displayName: newName });
      toast.success("Display name updated successfully");
      setEditingName(false);
    } catch (error: any) {
      console.error("Failed to update display name:", error);
      toast.error("Failed to update display name");
    } finally {
      setSavingName(false);
    }
  };
  
  const handleCancelEmail = () => {
    setEditingEmail(false);
    setNewEmail("");
  };
  
  const handleCancelName = () => {
    setEditingName(false);
    setNewName("");
  };
  
  const handleSetPassword = async () => {
    if (!user) return;
    
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      setSavingPassword(true);
      
      // Link email/password credential to the account
      const credential = EmailAuthProvider.credential(
        user.email!,
        newPassword
      );
      await linkWithCredential(user, credential);
      
      toast.success("Password set successfully! You can now sign in with email/password.");
      setSetPasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to set password:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already in use");
      } else if (error.code === "auth/provider-already-linked") {
        toast.error("Password already set for this account");
      } else {
        toast.error("Failed to set password: " + error.message);
      }
    } finally {
      setSavingPassword(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!user) return;
    
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      setSavingPassword(true);
      
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await auth.reauthenticateUser(user, credential);
      
      // Update password
      await auth.updateCurrentUserPassword(user, newPassword);
      
      toast.success("Password changed successfully");
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password: " + error.message);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle><Translate>Profile & Security</Translate></CardTitle>
        <CardDescription><Translate>Manage your account details and security settings</Translate></CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label><Translate>Email Address</Translate></Label>
          {editingEmail ? (
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSaveEmail}
                disabled={savingEmail}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelEmail}
                disabled={savingEmail}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user?.email}</span>
                <Badge variant="secondary"><Translate>Verified</Translate></Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleEditEmail}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label><Translate>Display Name</Translate></Label>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter display name"
                className="flex-1"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSaveName}
                disabled={savingName}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelName}
                disabled={savingName}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span className="text-sm font-medium">{user?.displayName || <Translate>Not set</Translate>}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleEditName}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-4">
          {!hasPasswordProvider && hasGoogleProvider && (
            <Dialog open={setPasswordOpen} onOpenChange={setSetPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <Translate>Set Password</Translate>
                  <Lock className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle><Translate>Set Password</Translate></DialogTitle>
                  <DialogDescription>
                    <Translate>Add email/password sign-in to your Google account. You'll be able to sign in with either method.</Translate>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password"><Translate>New Password</Translate></Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password"><Translate>Confirm Password</Translate></Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSetPasswordOpen(false)}
                    disabled={savingPassword}
                  >
                    <Translate>Cancel</Translate>
                  </Button>
                  <Button onClick={handleSetPassword} disabled={savingPassword}>
                    {savingPassword ? <Translate>Setting...</Translate> : <Translate>Set Password</Translate>}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {hasPasswordProvider && (
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <Translate>Change Password</Translate>
                  <KeyRound className="h-4 w-4 ml-2" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle><Translate>Change Password</Translate></DialogTitle>
                  <DialogDescription>
                    <Translate>Enter your current password and choose a new one.</Translate>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password"><Translate>Current Password</Translate></Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password-change"><Translate>New Password</Translate></Label>
                    <Input
                      id="new-password-change"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password-change"><Translate>Confirm New Password</Translate></Label>
                    <Input
                      id="confirm-password-change"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setChangePasswordOpen(false)}
                    disabled={savingPassword}
                  >
                    <Translate>Cancel</Translate>
                  </Button>
                  <Button onClick={handleChangePassword} disabled={savingPassword}>
                    {savingPassword ? <Translate>Changing...</Translate> : <Translate>Change Password</Translate>}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="secondary" className="w-full justify-between" asChild>
            <a href="/logout">
              <Translate>Sign Out</Translate>
              <LogOut className="h-4 w-4 ml-2" />
            </a>
          </Button>

          <div className="pt-6 border-t">
            <h3 className="text-sm font-medium text-destructive mb-3"><Translate>Danger Zone</Translate></h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-between">
                  <Translate>Delete Account Data</Translate>
                  <Trash2 className="h-4 w-4 ml-2" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <Translate>Delete all data?</Translate>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <Translate>This action cannot be undone. This will permanently delete your clients, invoices, work sessions, and settings from our servers.</Translate>
                    <br /><br />
                    <Translate>Your login account will remain active, but all your data will be wiped. To delete your login account entirely, please visit the "Manage Account" page after this.</Translate>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel><Translate>Cancel</Translate></AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccountData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? <Translate>Deleting...</Translate> : <Translate>Yes, delete everything</Translate>}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
