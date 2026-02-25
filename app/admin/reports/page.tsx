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
      <h1 className="pixel-font text-3xl text-yellow-300 mb-6 glow-text">
        REPORT REVIEW
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 ${
            filter === 'PENDING' ? 'bg-pink-600' : 'bg-purple-800'
          }`}
        >
          PENDING
        </button>
        <button
          onClick={() => setFilter('REVIEWED')}
          className={`px-4 py-2 ${
            filter === 'REVIEWED' ? 'bg-pink-600' : 'bg-purple-800'
          }`}
        >
          REVIEWED
        </button>
        <button
          onClick={() => setFilter('DISMISSED')}
          className={`px-4 py-2 ${
            filter === 'DISMISSED' ? 'bg-pink-600' : 'bg-purple-800'
          }`}
        >
          DISMISSED
        </button>
      </div>

      {loading ? (
        <RetroCard variant="yellow">
          <p className="text-cyan-300 text-center py-8">Loading...</p>
        </RetroCard>
      ) : reports.length === 0 ? (
        <RetroCard variant="yellow">
          <p className="text-cyan-300 text-center py-8">No reports found</p>
        </RetroCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <RetroCard key={report.id} variant="coral">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <RetroBadge>{report.reason}</RetroBadge>
                    <span className="text-cyan-300 text-sm">
                      @{report.roast.post.source.handle}
                    </span>
                  </div>
                  <p className="text-white text-sm mb-2">
                    {report.roast.post.textExcerpt.substring(0, 150)}...
                  </p>
                  {report.details && (
                    <p className="text-yellow-300 text-sm italic">
                      Details: {report.details}
                    </p>
                  )}
                  <p className="text-cyan-300 text-xs mt-2">
                    Reported: {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <a
                    href={`/roast/${report.roast.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-2 bg-purple-800 hover:bg-purple-700 text-center"
                  >
                    VIEW ROAST
                  </a>
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdate(report.id, 'REVIEWED')}
                        className="text-xs px-3 py-2 bg-green-700 hover:bg-green-600"
                      >
                        MARK REVIEWED
                      </button>
                      <button
                        onClick={() => handleUpdate(report.id, 'DISMISSED')}
                        className="text-xs px-3 py-2 bg-red-700 hover:bg-red-600"
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
