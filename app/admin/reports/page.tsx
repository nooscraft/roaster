'use client';

import { useState, useEffect } from 'react';
import { RetroCard } from '@/components/retro/RetroCard';
import { RetroTable } from '@/components/retro/RetroTable';
import { RetroBadge } from '@/components/retro/RetroBadge';

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  roast: {
    id: string;
    archetype: string;
    post: {
      textExcerpt: string;
      source: {
        handle: string;
      };
    };
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'REVIEWED' | 'DISMISSED'>('PENDING');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${filter}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchReports();
      }
    } catch (error) {
      alert('Failed to update report');
    }
  };

  return (
    <div>
      <h1 className="pixel-font mb-6 glow-text" style={{ fontSize: '18px', color: '#1a1a1a' }}>
        REPORT REVIEW
      </h1>

      <div className="flex gap-2 mb-6">
        {(['PENDING', 'REVIEWED', 'DISMISSED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`admin-tab ${filter === f ? 'admin-tab--active' : 'admin-tab--inactive'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <RetroCard variant="yellow">
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>Loading...</p>
        </RetroCard>
      ) : reports.length === 0 ? (
        <RetroCard variant="yellow">
          <p className="pixel-font text-center py-8" style={{ fontSize: '10px', color: '#888' }}>No reports found</p>
        </RetroCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <RetroCard key={report.id} variant="yellow">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <RetroBadge>{report.reason}</RetroBadge>
                    <span className="roast-handle">@{report.roast.post.source.handle}</span>
                  </div>
                  <p className="roast-translation mb-2" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
                    {report.roast.post.textExcerpt.substring(0, 150)}...
                  </p>
                  {report.details && (
                    <p className="mb-2" style={{ fontFamily: 'VT323, monospace', fontSize: '16px', color: '#888', fontStyle: 'italic' }}>
                      Details: {report.details}
                    </p>
                  )}
                  <p className="roast-label mt-2">
                    Reported: {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <a
                    href={`/roast/${report.roast.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-action-btn admin-action-btn--primary text-center"
                  >
                    VIEW ROAST
                  </a>
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdate(report.id, 'REVIEWED')}
                        className="admin-action-btn admin-action-btn--success"
                      >
                        MARK REVIEWED
                      </button>
                      <button
                        onClick={() => handleUpdate(report.id, 'DISMISSED')}
                        className="admin-action-btn admin-action-btn--danger"
                      >
                        DISMISS
                      </button>
                    </>
                  )}
                </div>
              </div>
            </RetroCard>
          ))}
        </div>
      )}
    </div>
  );
}
