import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/api/user/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        if (!data || !data.success || !data.user) throw new Error('User not found');
        setUser(data.user);
        setName(data.user.name || '');
        setEmail(data.user.email || '');
        setPhone(data.user.phone || '');
        setAddress(data.user.address || '');
        setRole(data.user.role || '');
      } catch (err) {
        console.error('Fetch user error', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load user details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name || !email) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Name and email are required.' });
      return;
    }
    try {
      const body = { id: user.id || user.ID || id, name, email, phone, address };
      const res = await apiFetch('/api/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Update failed', description: data?.message?.description || data?.message || 'Could not update user.' });
        return;
      }
      toast({ title: 'Updated', description: 'User details updated.' });
      // notify other parts of the app to refresh lists
      try { window.dispatchEvent(new Event('users:updated')); window.dispatchEvent(new Event('records:updated')); } catch (e) {}
      // refresh
      navigate('/admin');
    } catch (err) {
      console.error('Update error', err);
      toast({ variant: 'destructive', title: 'Update failed', description: 'Could not update user.' });
    }
  };

  const handleResetPassword = async () => {
    if (!user || !email) return;
    if (!newPassword || newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Invalid password', description: 'Please provide a new password with at least 6 characters.' });
      return;
    }
    setResetLoading(true);
    try {
      const payload: any = { email, newPassword, role: role || 'Citizen' };
      // if the target account is Administrator, include secretCode if provided
      if ((role || user.role) === 'Administrator' && secretCode) payload.secretCode = secretCode;
      const res = await apiFetch('/api/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Reset failed', description: data?.message?.description || data?.message || 'Could not reset password.' });
        return;
      }
      toast({ title: 'Password reset', description: 'The user password has been reset.' });
      setNewPassword('');
      try { window.dispatchEvent(new Event('users:updated')); } catch (e) {}
    } catch (err) {
      console.error('Reset error', err);
      toast({ variant: 'destructive', title: 'Reset failed', description: 'Could not reset password.' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" size="sm" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Manage the user's details and reset password</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ) : !user ? (
                <div className="text-center py-8">User not found</div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label>ID</Label>
                    <div className="text-sm font-medium">{user.id || user.ID || '-'}</div>
                  </div>

                  <div>
                    <Label>Full name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div>
                    <Label>Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div>
                    <Label>Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <div className="text-sm">{role || '-'}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button variant="outline" onClick={() => navigate('/admin')}>Cancel</Button>
                  </div>
                </form>
              )}

              {/* Password reset section */}
              {!loading && user && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Reset Password</h4>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter a new password" />
                    { (role === 'Administrator' || user.role === 'Administrator') && (
                      <div className="mt-2">
                        <Label>Administrator Secret Code</Label>
                        <Input type="text" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} placeholder="Enter secret code (if required)" />
                        <p className="text-xs text-gray-500">If the account is an administrator account, provide the secret code to allow password reset.</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleResetPassword} disabled={resetLoading}>{resetLoading ? 'Resetting...' : 'Reset Password'}</Button>
                      <Button variant="outline" onClick={() => setNewPassword('')}>Clear</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDetails;
