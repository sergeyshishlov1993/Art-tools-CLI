<script setup lang="ts">
import { CONTACTS } from '~/models/common/constants/contacts'

const route = useRoute()

const isProductPage = computed(() => route.path.startsWith('/product/'))

const contacts = [
  {
    name: 'Telegram',
    icon: CONTACTS.social.telegram.icon,
    url: CONTACTS.social.telegram.url,
    color: '#0088cc',
    hoverColor: '#006699'
  },
  {
    name: 'Viber',
    icon: CONTACTS.social.viber.icon,
    url: CONTACTS.social.viber.url,
    color: '#665CAC',
    hoverColor: '#59509a'
  },
  {
    name: 'TikTok',
    icon: CONTACTS.social.tiktok.icon,
    url: CONTACTS.social.tiktok.url,
    color: '#000000',
    hoverColor: '#333333'
  }
] as const

const isExpanded = ref(false)

function handleToggle() {
  isExpanded.value = !isExpanded.value
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.quick-contact')) {
    isExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    class="quick-contact"
    :class="{
      'product-page': isProductPage,
      'is-expanded': isExpanded
    }"
  >
    <div class="contact-buttons">
      <a
        v-for="(contact, index) in contacts"
        :key="contact.name"
        :href="contact.url"
        target="_blank"
        rel="noopener noreferrer"
        class="contact-btn"
        :style="{
          '--delay': `${index * 0.05}s`,
          '--color': contact.color,
          '--hover-color': contact.hoverColor
        }"
        :title="contact.name"
        @click.stop
      >
        <img :src="contact.icon" :alt="contact.name" class="contact-icon" width="24" height="24">
      </a>
    </div>

    <button
      class="main-btn"
      aria-label="Швидкий зв'язок"
      @click.stop="handleToggle"
    >
      <span class="main-btn-content">
        <svg class="main-icon chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <svg class="main-icon close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
      <span class="pulse-ring" />
      <span class="pulse-ring delay" />
    </button>
  </div>
</template>

<style scoped>
.quick-contact {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  -webkit-tap-highlight-color: transparent;
}

.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* Скрыто по умолчанию */
  visibility: hidden;
  pointer-events: none;
}

.contact-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Начальное состояние анимации */
  transform: scale(0) translateY(20px);
  opacity: 0;

  /* Убираем animation, используем transition для управления через классы/ховер */
  transition-delay: 0s;
}

/* --- ЛОГИКА ОТОБРАЖЕНИЯ --- */

/* 1. Мобилка / Клик (JS класс .is-expanded) */
.quick-contact.is-expanded .contact-buttons {
  visibility: visible;
  pointer-events: auto;
}

.quick-contact.is-expanded .contact-btn {
  transform: scale(1) translateY(0);
  opacity: 1;
  transition-delay: var(--delay);
}

/* 2. Десктоп (CSS Hover) - только если есть мышь */
@media (hover: hover) {
  .quick-contact:hover .contact-buttons {
    visibility: visible;
    pointer-events: auto;
  }

  .quick-contact:hover .contact-btn {
    transform: scale(1) translateY(0);
    opacity: 1;
    transition-delay: var(--delay);
  }

  .contact-btn:hover {
    background: var(--hover-color);
    transform: scale(1.1) translateY(0);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    /* Отключаем задержку при ховере на саму кнопку, чтобы она реагировала мгновенно */
    transition-delay: 0s !important;
  }
}

.contact-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

.main-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  touch-action: manipulation;
  z-index: 2; /* Поверх кнопок */
}

@media (hover: hover) {
  .main-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 24px rgba(34, 197, 94, 0.5);
  }

  /* Меняем стили при ховере на контейнер (для десктопа) ИЛИ при классе (для клика) */
  .quick-contact:hover .main-btn,
  .quick-contact.is-expanded .main-btn {
    /* Логика изменения цвета кнопки при открытии (опционально) */
    /* Если нужно менять цвет только при клике, оставьте селектор .is-expanded */
  }
}

.main-btn:active {
  transform: scale(0.95);
}

/* Состояние "Открыто" (Красная кнопка) - срабатывает при клике (класс) или ховере (медиа) */
.quick-contact.is-expanded .main-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

/* На десктопе тоже краснеем при ховере */
@media (hover: hover) {
  .quick-contact:hover .main-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  }
}

.main-btn-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-icon {
  width: 24px;
  height: 24px;
  position: absolute;
  transition: all 0.3s ease;
}

.chat-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.close-icon {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

/* Анимация иконок: JS класс ИЛИ CSS ховер */
.quick-contact.is-expanded .chat-icon,
.quick-contact:hover .chat-icon {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

/* Блокируем ховер-эффект иконок на таче через медиа-запрос (обратная логика не нужна, т.к. :hover не сработает) */
@media (hover: none) {
  .quick-contact:hover .chat-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

.quick-contact.is-expanded .close-icon,
.quick-contact:hover .close-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

@media (hover: none) {
  .quick-contact:hover .close-icon {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
  }
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(34, 197, 94, 0.6);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}

/* Скрываем пульс при открытии */
.quick-contact.is-expanded .pulse-ring,
.quick-contact:hover .pulse-ring {
  opacity: 0;
  animation: none;
}

.pulse-ring.delay {
  animation-delay: 1s;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50%, 100% { transform: scale(1.5); opacity: 0; }
}

@media (max-width: 1023px) {
  .quick-contact.product-page {
    bottom: 130px;
  }
}

@media (max-width: 640px) {
  .quick-contact {
    bottom: 16px;
    right: 16px;
  }

  .quick-contact.product-page {
    bottom: 120px;
    right: 12px;
  }

  .quick-contact.product-page .main-btn {
    width: 48px;
    height: 48px;
  }

  .quick-contact.product-page .contact-btn {
    width: 40px;
    height: 40px;
  }

  .quick-contact.product-page .contact-icon {
    width: 20px;
    height: 20px;
  }

  .main-btn {
    width: 52px;
    height: 52px;
  }

  .contact-btn {
    width: 44px;
    height: 44px;
  }

  .contact-icon {
    width: 22px;
    height: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-ring,
  .contact-btn,
  .main-btn,
  .main-icon {
    animation: none;
    transition: none;
  }
}
</style>