import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminRecordDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/api/birth-record/${id}`);
        if (res.ok) {
          const d = await res.json();
          if (d && d.success && d.record) setRecord(d.record);
          else setRecord(d.record || d || null);
        } else {
          const txt = await res.text().catch(() => "");
          console.error("Failed to load record", txt);
          toast({ variant: "destructive", title: "Load Failed", description: "Could not load record details." });
        }
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch record." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const postStatus = async (status: string, reason?: string) => {
    if (!id) return;
    try {
      const body: any = { status };
      if (reason) body.reason = reason;
      const res = await apiFetch(`/api/birth-record/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to update status");
      }
      await res.json();
      toast({ title: "Status Updated", description: `Record ${id} set to ${status}.` });
      navigate("/admin");
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Update Failed", description: err?.message || "Could not update status." });
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    await postStatus("approved");
    setApproving(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({ variant: "destructive", title: "Reason Required", description: "Please provide a reason for rejection." });
      return;
    }
    await postStatus("rejected", rejectReason.trim());
    setRejectDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Record Details</CardTitle>
            <CardDescription>Detailed view for record {id}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : !record ? (
              <div>No record found.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{record.CERTIFICATE_NO || record.ID || id}</h3>
                    <div className="text-sm text-gray-600">Status: <span className={`font-medium ${((record.STATUS||record.status)||'pending') === 'approved' ? 'text-green-600' : ((record.STATUS||record.status)||'pending') === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{(record.STATUS||record.status)||'pending'}</span></div>
                  </div>
                  <div className="space-x-2">
                    {((record.STATUS||record.status)||'pending') === 'pending' && (
                      <>
                        <Button onClick={() => setRejectDialogOpen(true)} variant="destructive">Reject</Button>
                        <Button onClick={handleApprove} disabled={approving} className="bg-nepal-blue text-white">{approving ? 'Approving...' : 'Approve'}</Button>
                      </>
                    )}
                    <Button variant="ghost" onClick={() => navigate('/admin')}>Back</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(record).map(([k,v]) => (
                    <div key={k} className="p-3 border rounded bg-white">
                      <div className="text-xs text-gray-500 mb-1 font-medium">{k}</div>
                      <div className="text-sm text-gray-900 break-words">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Label>Reason for rejection</Label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full h-28 border rounded p-2 mt-2" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminRecordDetails;
