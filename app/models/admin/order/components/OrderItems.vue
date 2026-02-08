<script setup lang="ts">
import type { OrderItem } from '~/models/admin/types/orders'
import { useOrderHelpers } from '../composables/useOrderHelpers'

interface Props {
  items: OrderItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  delete: [item: OrderItem]
}>()

const { formatPrice } = useOrderHelpers()

// Є знижка якщо old_price більше за price
function hasDiscount(item: OrderItem): boolean {
  return !!(item.old_price && item.old_price > item.price)
}
</script>

<template>
  <section class="modal-section">
    <h3 class="section-title">🛒 Товари ({{ items.length }})</h3>

    <div class="items-list">
      <div v-for="item in items" :key="item.item_id" class="item-row">
        <div class="item-img">
          <img v-if="item.product_img" :src="item.product_img" :alt="item.order_name">
          <span v-else class="item-img-placeholder">📦</span>
        </div>

        <div class="item-info">
          <div class="item-name">{{ item.order_name }}</div>
          <div class="item-id">{{ item.product_id }}</div>
        </div>

        <div class="item-qty">{{ item.count }} шт.</div>

        <div class="item-price">
          <!-- Акційна ціна -->
          <span
            class="price-current"
            :class="{ 'price-sale': hasDiscount(item) }"
          >
            {{ formatPrice(item.price) }} ₴
          </span>
          <!-- Стара ціна -->
          <span v-if="hasDiscount(item)" class="price-old">
            {{ formatPrice(item.old_price!) }} ₴
          </span>
          <!-- Бейдж -->
          <span v-if="item.discount && item.discount > 0" class="discount-badge">
            -{{ item.discount }}%
          </span>
        </div>

        <div class="item-total">
          {{ formatPrice(item.price * item.count) }} ₴
        </div>

        <button class="btn-remove" title="Видалити" @click="emit('delete', item)">×</button>
      </div>

      <div v-if="items.length === 0" class="items-empty">
        Товари відсутні
      </div>
    </div>
  </section>
</template>

<style scoped>
.modal-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
}

.item-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e5e7eb;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-id {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

.item-qty {
  font-size: 14px;
  color: #6b7280;
  min-width: 50px;
  text-align: center;
}

.item-price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  min-width: 160px;
  justify-content: flex-end;
}

.price-current {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
}

.price-sale {
  color: #dc2626;
}

.price-old {
  font-size: 13px;
  color: #9ca3af;
  text-decoration: line-through;
}

.discount-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-weight: 600;
}

.item-total {
  font-size: 15px;
  font-weight: 700;
  color: #22c55e;
  min-width: 100px;
  text-align: right;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #fecaca;
}

.items-empty {
  text-align: center;
  padding: 24px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .item-row {
    flex-wrap: wrap;
  }

  .item-info {
    flex-basis: calc(100% - 72px);
  }

  .item-qty,
  .item-price,
  .item-total {
    min-width: auto;
  }

  .item-price {
    justify-content: flex-start;
  }
}
</style>
