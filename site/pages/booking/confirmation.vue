<script setup lang="ts">
useSeo({
  title: 'Xác Nhận Đặt Lịch – Stretch.vn',
  description: 'Lịch hẹn của bạn đã được đặt thành công tại Stretch.vn.',
  noIndex: true,
})
</script>

<template>
  <div class="gradient-bg min-h-screen">
    <TheHeader />
    <main class="section-container pt-32 pb-24">
      <div class="max-w-2xl mx-auto text-center">
        <div class="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-8 animate-scale-in text-white">
          <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 class="font-heading text-display-sm mb-4">Đặt Lịch Thành Công!</h1>
        <p class="text-body-lg text-on-surface-variant mb-10">
          Cảm ơn bạn đã tin tưởng Stretch.vn. Email xác nhận sẽ được gửi trong vài phút.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <BaseButton variant="primary" size="lg" href="/">
            <svg class="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Về trang chủ
          </BaseButton>
          <BaseButton variant="outline" size="lg" href="/booking">
            <svg class="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Đặt lịch mới
          </BaseButton>
        </div>
      </div>
    </main>
    <TheFooter />
  </div>
</template>
