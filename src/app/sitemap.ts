import { MetadataRoute } from 'next';
import { getBlogPosts, getAcademicItems } from '@/lib/data';
import { getPublicSpecialProjects } from '@/app/actions/specialProjectCrud';
import { initialSpecialProjectsData } from '@/lib/seedData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sadiquiqbal.com').replace(/\/$/, '');
  const [blogPosts, researchProjects, specialProjects] = await Promise.all([
    getBlogPosts(50).catch(() => []),
    getAcademicItems({ category: 'project', limit: 50 }).catch(() => []),
    getPublicSpecialProjects().catch(() => initialSpecialProjectsData),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publications`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/students`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const researchRoutes: MetadataRoute.Sitemap = researchProjects
    .filter((item) => Boolean(item.slug))
    .map((item) => ({
      url: `${baseUrl}/research/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  const projectList = (specialProjects && specialProjects.length > 0)
    ? specialProjects
    : initialSpecialProjectsData;

  const projectRoutes: MetadataRoute.Sitemap = projectList
    .filter((item: any) => Boolean(item.slug || item._id))
    .map((item: any) => ({
      url: `${baseUrl}/projects/${item.slug || item._id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

  return [...staticRoutes, ...blogRoutes, ...researchRoutes, ...projectRoutes];
}
