import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://froth-eight.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const roasts = await prisma.roast.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, approvedAt: true },
    orderBy: { approvedAt: 'desc' },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stats`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const roastPages: MetadataRoute.Sitemap = roasts.map((r) => ({
    url: `${BASE_URL}/roast/${r.id}`,
    lastModified: r.approvedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...roastPages];
}
