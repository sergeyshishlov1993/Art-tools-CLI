<template>
  <div class="relative h-96 md:h-96 lg:h-[450px] rounded-lg overflow-hidden">
    <picture>
      <source media="(max-width: 767px)" srcset="/baner-sm.webp">
      <source media="(min-width: 768px)" srcset="/baner.webp">
      <img
        src="/baner.webp"
        alt="Art Tools"
        class="w-full h-full object-cover"
      >
    </picture>
  </div>
</template>