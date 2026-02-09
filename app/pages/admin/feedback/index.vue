<script setup lang="ts">
import { useFeedbackAdminAPI, type Feedback } from '~/models/feedback/FeedbackAdminApi'
import { useAdminSocket } from '~/models/admin/composables/useAdminSocket'
import { useAdminStore } from '~/models/admin/AdminStore'
import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'

definePageMeta({
  layout: 'admin'
})

const api = useFeedbackAdminAPI()
const toast = useToast()
const adminStore = useAdminStore()
const { onNewFeedback } = useAdminSocket()

const feedbackList = ref<Feedback[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const deleteModal = ref(false)
const deleting = ref(false)
const feedbackToDelete = ref<Feedback | null>(null)
const newCount = computed(() => feedbackList.value.filter(f => f.status !== 'Виконано').length)
const doneCount = computed(() => feedbackList.value.filter(f => f.status === 'Виконано').length)


async function loadFeedback() {
  loading.value = true
  try {
    const res = await api.getAll(currentPage.value, 10)
    feedbackList.value = res.feedback
    totalPages.value = res.totalPages
    totalItems.value = res.totalItems
  } catch {
    toast.add({ title: 'Помилка завантаження', color: 'error' })
  } finally {
    loading.value = false
  }
}

if (import.meta.client) {
  onNewFeedback(async (data) => {
    await loadFeedback()
    toast.add({ title: `Нова заявка від ${data.name}`, color: 'success' })
  })
}

async function markAsDone(item: Feedback) {
  try {
    await api.changeStatus(item.id)
    item.status = 'Виконано'
    adminStore.decrementFeedback()
    toast.add({ title: 'Статус змінено', color: 'success' })
  } catch {
    toast.add({ title: 'Помилка', color: 'error' })
  }
}

function confirmDelete(item: Feedback) {
  feedbackToDelete.value = item
  deleteModal.value = true
}

async function deleteFeedback() {
  if (!feedbackToDelete.value) return

  deleting.value = true
  try {
    const wasNew = feedbackToDelete.value.status !== 'Виконано'
    await api.delete(feedbackToDelete.value.id)
    feedbackList.value = feedbackList.value.filter(f => f.id !== feedbackToDelete.value!.id)
    totalItems.value--
    if (wasNew) adminStore.decrementFeedback()
    toast.add({ title: 'Видалено', color: 'success' })
    deleteModal.value = false
  } catch {
    toast.add({ title: 'Помилка видалення', color: 'error' })
  } finally {
    deleting.value = false
    feedbackToDelete.value = null
  }
}

function goToPage(page: number) {
  currentPage.value = page
  loadFeedback()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Щойно'
  if (minutes < 60) return `${minutes} хв тому`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} год тому`
  const days = Math.floor(hours / 24)
  return `${days} дн тому`
}

onMounted(loadFeedback)
</script>

<template>
  <div class="feedback-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">💬 Зворотній зв'язок</h1>
        <span class="total-badge">{{ totalItems }} заявок</span>
      </div>
      <button class="btn btn-outline" :disabled="loading" @click="loadFeedback">
        <span :class="{ 'spin': loading }">🔄</span>
        Оновити
      </button>
    </header>

    <div class="stats-row">
      <div class="stat-card stat-new">
        <div class="stat-icon">📥</div>
        <div class="stat-info">
          <span class="stat-value">{{ newCount }}</span>
          <span class="stat-label">Нових</span>
        </div>
      </div>
      <div class="stat-card stat-done">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <span class="stat-value">{{ doneCount }}</span>
          <span class="stat-label">Виконано</span>
        </div>
      </div>
      <div class="stat-card stat-total">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <span class="stat-value">{{ totalItems }}</span>
          <span class="stat-label">Всього</span>
        </div>
      </div>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="loading" key="loading" class="loading-state">
        <div class="spinner" />
        <p>Завантаження...</p>
      </div>

      <div v-else-if="feedbackList.length === 0" key="empty" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Заявок поки немає</h3>
        <p>Нові заявки з'являться тут</p>
      </div>

      <div v-else key="table" class="table-container">
        <table class="feedback-table">
          <thead>
            <tr>
              <th>Статус</th>
              <th>Ім'я</th>
              <th>Телефон</th>
              <th class="hide-mobile">Дата</th>
              <th>Дії</th>
            </tr>
          </thead>
          <TransitionGroup name="list" tag="tbody">
            <tr
              v-for="item in feedbackList"
              :key="item.id"
              :class="{ 'row-new': item.status !== 'Виконано' }"
            >
              <td>
                <span
                  class="status-badge"
                  :class="item.status === 'Виконано' ? 'status-done' : 'status-new'"
                >
                  {{ item.status === 'Виконано' ? '✓ Виконано' : '● Новий' }}
                </span>
              </td>
              <td>
                <div class="name-cell">
                  <span class="name">{{ item.name }}</span>
                  <span v-if="item.status !== 'Виконано'" class="time-ago">
                    {{ getTimeAgo(item.createdAt) }}
                  </span>
                </div>
              </td>
              <td>
                <a :href="`tel:${item.phone}`" class="phone-link">
                  📞 {{ item.phone }}
                </a>
              </td>
              <td class="hide-mobile">
                {{ formatDate(item.createdAt) }}
              </td>
              <td>
                <div class="actions">
                  <button
                    v-if="item.status !== 'Виконано'"
                    class="action-btn action-done"
                    title="Позначити виконаним"
                    @click="markAsDone(item)"
                  >
                    ✓
                  </button>
                  <a
                    :href="`tel:${item.phone}`"
                    class="action-btn action-call"
                    title="Зателефонувати"
                  >
                    📞
                  </a>
                  <button
                    class="action-btn action-delete"
                    title="Видалити"
                    @click="confirmDelete(item)"
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </Transition>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        ←
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        →
      </button>
    </div>

    <ConfirmModal
      v-model="deleteModal"
      title="Видалити заявку?"
      icon="🗑️"
      confirm-text="Видалити"
      confirm-color="danger"
      :loading="deleting"
      @confirm="deleteFeedback"
    >
      Заявка від <strong>{{ feedbackToDelete?.name }}</strong> буде видалена назавжди.
    </ConfirmModal>
  </div>
</template>

<style scoped>
.feedback-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.total-badge {
  padding: 6px 14px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-new { border-left: 4px solid #f59e0b; }
.stat-done { border-left: 4px solid #10b981; }
.stat-total { border-left: 4px solid #6366f1; }

/* Loading & Empty */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: 16px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #374151;
  margin: 0 0 8px;
}

.empty-state p {
  color: #9ca3af;
  margin: 0;
}

/* Table */
.table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.feedback-table {
  width: 100%;
  border-collapse: collapse;
}

.feedback-table th {
  text-align: left;
  padding: 14px 16px;
  background: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
}

.feedback-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.feedback-table tr:last-child td {
  border-bottom: none;
}

.row-new {
  background: #fffbeb;
}

.row-new:hover {
  background: #fef3c7;
}

.feedback-table tbody tr:not(.row-new):hover {
  background: #f9fafb;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-new {
  background: #fef3c7;
  color: #b45309;
}

.status-done {
  background: #d1fae5;
  color: #047857;
}

/* Name Cell */
.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  font-weight: 600;
  color: #1a1a1a;
}

.time-ago {
  font-size: 12px;
  color: #f59e0b;
  font-weight: 500;
}

/* Phone Link */
.phone-link {
  color: #059669;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
}

.phone-link:hover {
  color: #047857;
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-done {
  background: #d1fae5;
  color: #047857;
}

.action-done:hover {
  background: #a7f3d0;
}

.action-call {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-call:hover {
  background: #bfdbfe;
}

.action-delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-delete:hover {
  background: #fecaca;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.page-btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .feedback-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 22px;
  }

  .hide-mobile {
    display: none;
  }

  .feedback-table th,
  .feedback-table td {
    padding: 12px 10px;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 11px;
  }

  .actions {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .name {
    font-size: 14px;
  }

  .phone-link {
    font-size: 13px;
  }
}
</style>