<script setup lang="ts">
import { CONTACTS } from '~/models/common/constants/contacts'

const route = useRoute()
const viewport = useViewport()

const isProductPage = computed(() => route.path.startsWith('/product/'))
const isMobile = computed(() => viewport.isLessThan('lg'))

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
let hoverTimeout: ReturnType<typeof setTimeout> | null = null

function handleMouseEnter() {
  if (hoverTimeout) clearTimeout(hoverTimeout)
  isExpanded.value = true
}

function handleMouseLeave() {
  hoverTimeout = setTimeout(() => {
    isExpanded.value = false
  }, 300)
}

function handleToggle() {
  isExpanded.value = !isExpanded.value
}

onUnmounted(() => {
  if (hoverTimeout) clearTimeout(hoverTimeout)
})
</script>

<template>
  <div
    class="quick-contact"
    :class="{ 'product-page': isProductPage }"
    @mouseenter="isMobile ? undefined : handleMouseEnter()"
    @mouseleave="isMobile ? undefined : handleMouseLeave()"
  >
    <Transition name="contacts">
      <div v-show="isExpanded" class="contact-buttons">
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
        >
          <img
            :src="contact.icon"
            :alt="contact.name"
            class="contact-icon"
            width="24"
            height="24"
          >
        </a>
      </div>
    </Transition>

    <button
      class="main-btn"
      :class="{ 'is-expanded': isExpanded }"
      aria-label="Швидкий зв'язок"
      @click="handleToggle"
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
      <span v-if="!isExpanded" class="pulse-ring" />
      <span v-if="!isExpanded" class="pulse-ring delay" />
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
  transform: scale(0);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay);
  touch-action: manipulation;
}

@media (hover: hover) {
  .contact-btn:hover {
    background: var(--hover-color);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
}

.contact-btn:active {
  transform: scale(0.95);
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
}

@media (hover: hover) {
  .main-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 24px rgba(34, 197, 94, 0.5);
  }

  .main-btn.is-expanded:hover {
    box-shadow: 0 6px 24px rgba(239, 68, 68, 0.5);
  }
}

.main-btn:active {
  transform: scale(0.95);
}

.main-btn.is-expanded {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
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

.main-btn.is-expanded .chat-icon {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.main-btn.is-expanded .close-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(34, 197, 94, 0.6);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}

.pulse-ring.delay {
  animation-delay: 1s;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50%, 100% { transform: scale(1.5); opacity: 0; }
}

.contacts-enter-active {
  transition: all 0.3s ease;
}

.contacts-leave-active {
  transition: all 0.2s ease;
}

.contacts-enter-from,
.contacts-leave-to {
  opacity: 0;
  transform: translateY(20px);
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
  .contact-btn {
    animation: none;
  }

  .contact-btn {
    transform: scale(1);
  }

  .main-btn,
  .contact-btn,
  .main-icon {
    transition-duration: 0.01ms;
  }
}
</style>