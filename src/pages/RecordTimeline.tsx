import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const formatDate = (s?: string) => {
  if (!s) return 'N/A';
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString();
  } catch (e) { return s; }
};

const RecordTimeline: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrarName, setRegistrarName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/api/birth-record/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Failed to load record');
        const data = await res.json();
        if (!data || !data.success || !data.record) {
          toast({ variant: 'destructive', title: 'Not found', description: 'Record not found.' });
          setRecord(null);
          return;
        }
        setRecord(data.record);

        // try to resolve registrar name
        const regBy = data.record.registeredBy || data.record.REGISTERED_BY || data.record.REGISTERED_BY || '';
        if (regBy) {
          try {
            const ures = await apiFetch(`/api/user/${encodeURIComponent(regBy)}`);
            if (ures.ok) {
              const ud = await ures.json().catch(() => null);
              if (ud && ud.success && ud.user) {
                setRegistrarName(ud.user.NAME || ud.user.name || null);
              }
            }
          } catch (e) { /* ignore */ }
        }
      } catch (err: any) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch record.' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto py-8">Loading...</div>
    </MainLayout>
  );

  if (!record) return (
    <MainLayout>
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold">Record Not Found</h2>
        <p className="mt-2">We couldn't locate the requested registration.</p>
        <div className="mt-4"><Button onClick={() => navigate(-1)}>Go Back</Button></div>
      </div>
    </MainLayout>
  );

  const status = (record.status || record.STATUS || 'pending').toString();
  const registeredAt = record.registeredAt || record.REGISTERED_AT || '';
  const rejectReason = record.rejectReason || record.REJECT_REASON || '';
  const childName = record.childFullName || `${record.raw?.CHILD_FIRST_NAME || ''} ${record.raw?.CHILD_LAST_NAME || ''}`.trim();

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registration Timeline</CardTitle>
            <CardDescription>Application progress for {record.CERTIFICATE_NO || record.certificateNo || record.ID || id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Timeline: Submitted */}
              <div className="p-4 border rounded bg-white">
                <div className="text-sm text-gray-600">{formatDate(registeredAt)}</div>
                <div className="mt-2">
                  <h3 className="font-semibold">Application submitted</h3>
                  <p className="text-sm text-gray-700">The application form was submitted by {record.registeredBy || record.REGISTERED_BY || 'the applicant'} for {childName || 'the child'}.</p>
                </div>
              </div>

              {/* Under review / pending */}
              {status === 'pending' && (
                <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                  <h3 className="font-semibold text-yellow-700">Under review</h3>
                  <p className="text-sm text-yellow-800 mt-1">Our officials will review the application and verify the details shortly.</p>
                </div>
              )}

              {/* Rejected */}
              {status === 'rejected' && (
                <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                  <h3 className="font-semibold text-red-700">Application rejected</h3>
                  <p className="text-sm text-red-800 mt-1">The application was reviewed and rejected by our officials.</p>
                  {rejectReason && (<div className="mt-2 text-sm"><strong>Reason:</strong> {rejectReason}</div>)}
                </div>
              )}

              {/* Approved */}
              {status === 'approved' && (
                <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
                  <h3 className="font-semibold text-green-700">Verified</h3>
                  <p className="text-sm text-green-800 mt-1">The registration has been verified by our officials. The birth certificate is ready for download.</p>
                  <div className="mt-3"><Link to={`/certificate/${record.CERTIFICATE_NO || record.certificateNo || record.ID || id}`}><Button>Download Certificate</Button></Link></div>
                </div>
              )}

              {/* Re-apply CTA when rejected */}
              {status === 'rejected' && (
                <div className="p-4 border rounded bg-white">
                  <h4 className="font-semibold">Next steps</h4>
                  <p className="text-sm mt-1">If your application was rejected, please correct the issues and re-apply. We recommend addressing the reason provided above before submitting again.</p>
                  <div className="mt-3"><Link to="/birth-registration" state={{ draft: record.raw || record }}><Button>Re-apply</Button></Link></div>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecordTimeline;
