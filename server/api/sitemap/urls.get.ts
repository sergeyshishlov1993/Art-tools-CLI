// server/api/sitemap/urls.get.ts
import { defineEventHandler } from 'h3'

type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapUrl {
  loc: string
  changefreq?: Changefreq
  priority?: number
}

interface Product {
  slug: string
}

interface ProductsResponse {
  products: Product[]
  total_pages: number
}

interface Category {
  slug: string
  children?: Category[]
}

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '')
const normalizePath = (path: string): string => `/${path}`.replace(/\/+/g, '/')
const joinUrl = (baseUrl: string, path: string): string =>
  `${normalizeBaseUrl(baseUrl)}${normalizePath(path).replace(/^\/+/, '/')}`

const ensureAbsolute = (siteUrl: string, loc: string): string => {
  if (loc.startsWith('http://') || loc.startsWith('https://')) return loc
  return `${normalizeBaseUrl(siteUrl)}${normalizePath(loc)}`
}

const pushStatic = (urls: SitemapUrl[], siteUrl: string): void => {
  urls.push({ loc: ensureAbsolute(siteUrl, '/'), changefreq: 'weekly', priority: 1.0 })
  urls.push({ loc: ensureAbsolute(siteUrl, '/catalog'), changefreq: 'weekly', priority: 0.9 })
  urls.push({ loc: ensureAbsolute(siteUrl, '/contacts'), changefreq: 'monthly', priority: 0.5 })
}

const addCategoryUrls = (urls: SitemapUrl[], siteUrl: string, category: Category, parentPath: string): void => {
  const currentPath = `${parentPath}/${category.slug}`.replace(/\/+/g, '/')
  urls.push({ loc: ensureAbsolute(siteUrl, currentPath), changefreq: 'weekly', priority: 0.8 })

  const children = category.children
  if (Array.isArray(children) && children.length > 0) {
    children.forEach((child) => addCategoryUrls(urls, siteUrl, child, currentPath))
  }
}

export default defineEventHandler(async (): Promise<SitemapUrl[]> => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').trim() || 'http://localhost:3000'
  const apiInternalBase = String(config.apiInternalBase || '').trim()
  const urls: SitemapUrl[] = []

  pushStatic(urls, siteUrl)

  if (!apiInternalBase) return urls

  try {
    const categories = await $fetch<Category[]>(joinUrl(apiInternalBase, '/categories/active'))
    if (Array.isArray(categories)) {
      categories.forEach((category) => addCategoryUrls(urls, siteUrl, category, '/catalog'))
    }
  } catch {
    // ignore
  }

  try {
    let page = 1
    const perPage = 100
    const maxPages = 1000

    while (page <= maxPages) {
      const data = await $fetch<ProductsResponse>(
        joinUrl(apiInternalBase, `/products?page=${page}&per_page=${perPage}`)
      )

      const products = data?.products
      if (!Array.isArray(products) || products.length === 0) break

      products.forEach((product) => {
        if (typeof product.slug === 'string' && product.slug.length > 0) {
          urls.push({
            loc: ensureAbsolute(siteUrl, `/product/${product.slug}`),
            changefreq: 'daily',
            priority: 0.9,
          })
        }
      })

      const totalPages = typeof data.total_pages === 'number' ? data.total_pages : 1
      if (page >= totalPages) break
      page += 1
    }
  } catch {
    // ignore
  }

  return urls
})
