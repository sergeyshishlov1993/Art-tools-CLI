<script setup lang="ts">
import { useAuthStore } from '~/models/auth/AuthStore'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import BInput from '~/models/common/components/ui/BInput.vue'

definePageMeta({
  layout: 'blank',
  middleware: 'admin'
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const showPassword = ref(false)

async function handleSubmit() {
  const success = await authStore.login(form.username, form.password)
  if (success) {
    router.push('/admin/orders')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">🔧</div>
        <h1>Адмін панель</h1>
        <p>Увійдіть для доступу до управління</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div v-if="authStore.error" class="error-alert">
          {{ authStore.error }}
        </div>

        <div class="form-group">
          <label>Логін</label>
          <BInput
            v-model="form.username"
            type="text"
            placeholder="Введіть логін"
            icon="heroicons-user"
            required
          />
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <div class="password-input">
            <BInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введіть пароль"
              icon="heroicons-lock-closed"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <UIcon :name="showPassword ? 'heroicons-eye-slash' : 'heroicons-eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <BBtn
          type="submit"
          variant="primary"
          size="lg"
          class="w-full"
          :loading="authStore.loading"
        >
          Увійти
        </BBtn>
      </form>

      <div class="login-footer">
        <NuxtLink to="/" class="back-link">
          ← Повернутися на сайт
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.login-header p {
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-alert {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}

.toggle-password:hover {
  color: #6b7280;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.back-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #374151;
}
</style>