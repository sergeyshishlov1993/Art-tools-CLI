<script setup lang="ts">
import HeroBanner from '~/models/hero/components/HeroBanner.vue'
import CategorySlider from '~/models/category/components/CategorySlider.vue'
import ProductSection from '~/models/product/components/ProductSection.vue'
import ContactForm from '~/models/common/components/ContactForm.vue'
import CartModal from '~/models/cart/components/CartModal.vue'
import OneClickModal from '~/models/cart/components/OneClickModal.vue'
import { useProductSections } from '~/models/product/composables/useProductSections'
import { useCartActions } from '~/models/cart/composables/useCartActions'

const { sale, popular, new: newProducts, getAllRawProducts } = useProductSections()
const { isCartModalOpen, isOneClickModalOpen, lastAddedProduct, createHandlers } = useCartActions()

const { handleAddToCart, handleQuickBuy } = createHandlers(getAllRawProducts)

onMounted(() => {
  sale.load()
  newProducts.load()
  popular.load()
})

useHead({
  title: 'Головна - Інтернет-магазин інструментів',
})
</script>

<template>
  <div class="space-y-8 lg:space-y-12 py-6 lg:py-8">
    <HeroBanner />

    <div class="max-w-7xl mx-auto px-4 lg:px-8 space-y-8 lg:space-y-12">
      <CategorySlider />

      <ProductSection
        v-if="sale.loading.value || sale.products.value.length > 0"
        title="Акції"
        :products="sale.products.value"
        :loading="sale.loading.value"
        view-all-link="/catalog?sale=true"
        @add-to-cart="handleAddToCart"
        @quick-buy="handleQuickBuy"
      />

      <ProductSection
        v-if="newProducts.loading.value || newProducts.products.value.length > 0"
        title="Новинки"
        :products="newProducts.products.value"
        :loading="newProducts.loading.value"
        view-all-link="/catalog?sort=new"
        @add-to-cart="handleAddToCart"
        @quick-buy="handleQuickBuy"
      />

      <ProductSection
        v-if="popular.loading.value || popular.products.value.length > 0"
        title="Хіти продажів"
        :products="popular.products.value"
        :loading="popular.loading.value"
        view-all-link="/catalog?bestseller=true"
        @add-to-cart="handleAddToCart"
        @quick-buy="handleQuickBuy"
      />

      <ContactForm />
    </div>

    <CartModal v-model="isCartModalOpen" :product="lastAddedProduct" @quick-buy="() => isOneClickModalOpen = true" />
    <OneClickModal v-model="isOneClickModalOpen" :product="lastAddedProduct" />
  </div>
</template>