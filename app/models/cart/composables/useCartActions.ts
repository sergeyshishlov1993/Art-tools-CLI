
import { useCartStore } from '~/models/cart/CartStore'
import { useProductStore } from '~/models/product/ProductStore'
import type { Product, ProductCardData } from '~/models/product/types/Product'

export function useCartActions() {
  const cartStore = useCartStore()
  const productStore = useProductStore()

  const isCartModalOpen = ref(false)
  const isOneClickModalOpen = ref(false)
  const lastAddedProduct = ref<ProductCardData | null>(null)

  function addToCart(product: Product) {
    const cardData = productStore.transformToCard(product)

    cartStore.addToCart({
      id: cardData.id,
      slug: product.slug,
      name: cardData.name,
      price: cardData.price,
      oldPrice: cardData.oldPrice,
      image: cardData.image,
      code: cardData.code,
    })

    lastAddedProduct.value = cardData
    isCartModalOpen.value = true
  }

  function quickBuy(product: Product) {
    lastAddedProduct.value = productStore.transformToCard(product)
    isOneClickModalOpen.value = true
  }

  // Універсальний метод для пошуку і додавання
  function addToCartById(productId: string, products: Product[]) {
    const product = products.find((p) => p.product_id === productId)
    if (product) addToCart(product)
  }

  function quickBuyById(productId: string, products: Product[]) {
    const product = products.find((p) => p.product_id === productId)
    if (product) quickBuy(product)
  }

  // Для секцій з кількома джерелами
  function createHandlers(getProducts: () => Product[]) {
    return {
      handleAddToCart: (productId: string) => addToCartById(productId, getProducts()),
      handleQuickBuy: (productId: string) => quickBuyById(productId, getProducts()),
    }
  }

  return {
    isCartModalOpen,
    isOneClickModalOpen,
    lastAddedProduct,
    addToCart,
    quickBuy,
    addToCartById,
    quickBuyById,
    createHandlers,
  }
}
