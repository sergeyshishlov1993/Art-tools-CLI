import { defineEventHandler, setResponseHeader } from 'h3'

interface Picture {
  pictures_name: string
}

interface SubCategory {
  sub_category_name: string
  category: {
    category_name: string
  }
}

interface RawProduct {
  product_id: string
  slug: string
  product_name: string
  product_description: string
  brand: string
  price: string
  sale_price: string
  sale: string
  available: string
  pictures: Picture[]
  subCategory: SubCategory
}

interface ProductsResponse {
  products: RawProduct[]
  total_pages: number
}

const escapeXml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&sup2;/g, '²')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

const buildItemXml = (product: RawProduct, siteUrl: string): string => {
  const title = escapeXml(product.product_name.slice(0, 150))
  const description = escapeXml(stripHtml(product.product_description).slice(0, 5000))
  const link = `${siteUrl}/product/${product.slug}`
  const imageLink = product.pictures[0]?.pictures_name || ''
  const availability = product.available === 'true' ? 'in_stock' : 'out_of_stock'
  const brand = escapeXml(product.brand)
  const price = parseFloat(product.price).toFixed(2)
  const salePrice = parseFloat(product.sale_price).toFixed(2)
  const isSale = product.sale === 'true' && salePrice !== price
  const category = `${product.subCategory.category.category_name} > ${product.subCategory.sub_category_name}`

  const additionalImages = product.pictures
    .slice(1, 10)
    .map((pic) => `      <g:additional_image_link>${escapeXml(pic.pictures_name)}</g:additional_image_link>`)
    .join('\n')

  return `
    <item>
      <g:id>${escapeXml(product.product_id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
${additionalImages}
      <g:price>${price} UAH</g:price>
${isSale ? `      <g:sale_price>${salePrice} UAH</g:sale_price>` : ''}
      <g:availability>${availability}</g:availability>
      <g:brand>${brand}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>
    </item>`
}

const fetchAllProducts = async (apiBase: string): Promise<RawProduct[]> => {
  const allProducts: RawProduct[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const data = await $fetch<ProductsResponse>(`${apiBase}/products?page=${page}&per_page=${perPage}`)
    const products = data?.products
    if (!Array.isArray(products) || products.length === 0) break

    allProducts.push(...products)

    if (page >= (data.total_pages || 1)) break
    page += 1
  }

  return allProducts
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').replace(/\/+$/, '')
  const apiBase = String(config.apiInternalBase || '').replace(/\/+$/, '')

  let products: RawProduct[] = []

  try {
    products = await fetchAllProducts(apiBase)
  } catch {
    // empty feed on error
  }

  const items = products
    .filter((product) => product.slug && parseFloat(product.price) > 0 && product.pictures.length > 0)
    .map((product) => buildItemXml(product, siteUrl))
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Art Tools — Магазин інструментів</title>
    <link>${siteUrl}</link>
    <description>Інтернет-магазин інструментів Art Tools</description>
    ${items}
  </channel>
</rss>`
})
