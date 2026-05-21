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
        <div class="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-8 animate-scale-in">
          <span class="material-symbols-outlined text-5xl text-primary" style="font-variation-settings: 'FILL' 1">
            check_circle
          </span>
        </div>

        <h1 class="font-heading text-display-sm mb-4">Đặt Lịch Thành Công!</h1>
        <p class="text-body-lg text-on-surface-variant mb-10">
          Cảm ơn bạn đã tin tưởng Stretch.vn. Email xác nhận sẽ được gửi trong vài phút.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <BaseButton variant="primary" size="lg" href="/">
            <span class="material-symbols-outlined text-lg">home</span>
            Về trang chủ
          </BaseButton>
          <BaseButton variant="outline" size="lg" href="/booking">
            <span class="material-symbols-outlined text-lg">add</span>
            Đặt lịch mới
          </BaseButton>
        </div>
      </div>
    </main>
    <TheFooter />
  </div>
</template>
