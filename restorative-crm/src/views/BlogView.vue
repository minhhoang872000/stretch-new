<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <span class="label-xs mb-1 block">{{ $t('blog.contentRepo') }}</span>
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">{{ $t('blog.title') }}</h1>
      </div>
      <button @click="openModal" class="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
        <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">add</span>
        {{ $t('blog.newPost') }}
      </button>
    </div>

    <BlogStats />
    <BlogFilterBar />
    <BlogTable />
    <BlogInsight />

    <!-- Add Post Modal -->
    <ActionModal 
      v-model:isOpen="isModalOpen" 
      :title="$t('blog.newPost')" 
      :submitLabel="$t('blog.publishPost')"
      @submit="handleNewPost"
    >
      <div class="space-y-4">
        <div>
          <label class="label-xs mb-1.5 block">{{ $t('blog.postTitle') }}</label>
          <input v-model="newPost.title" type="text" class="input-field" :placeholder="$t('blog.postTitle')" />
        </div>
        <div>
          <label class="label-xs mb-1.5 block">{{ $t('blog.category') }}</label>
          <select v-model="newPost.category" class="input-field">
            <option>{{ $t('blog.categories.physio') }}</option>
            <option>{{ $t('blog.categories.neuro') }}</option>
            <option>{{ $t('blog.categories.joint') }}</option>
            <option>{{ $t('blog.categories.nutrition') }}</option>
          </select>
        </div>
        <div>
          <label class="label-xs mb-1.5 block">{{ $t('blog.author') }}</label>
          <input v-model="newPost.authorName" type="text" class="input-field" :placeholder="$t('blog.author')" />
        </div>
      </div>
    </ActionModal>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import BlogStats from '@/components/blog/BlogStats.vue'
import BlogFilterBar from '@/components/blog/BlogFilterBar.vue'
import BlogTable from '@/components/blog/BlogTable.vue'
import BlogInsight from '@/components/blog/BlogInsight.vue'
import ActionModal from '@/components/ui/ActionModal.vue'
import { useBlogStore } from '@/stores/blog.js'

const store = useBlogStore()
const isModalOpen = ref(false)

const newPost = ref({
  title: '',
  category: 'Physical Health',
  authorName: ''
})

const openModal = () => {
  isModalOpen.value = true
}

const handleNewPost = () => {
  if (!newPost.value.title) return

  store.posts.unshift({
    id: Date.now(),
    title: newPost.value.title,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBONNuZRbnCcwVCMgjskkpzHjo9I0ndv4uf0XbV_0tikzvYNmtmvt2pN9Q1CD8KjpQ1GRbKAKNnr-xK06BA1pjpRLv66bB2tiAveWmUnt8U80C-LDX-2YVinYu_eM8YyY0YSEO6-bTM_gfqWkcHFJ9KgJq7eyUT2fKr9x5GkeuK1dloU9r4Tl3Cpzz-LnGUH3drcTVWcFZomRPdD1KlFOku3qI-oPsqJaMhcclVe4LI7wnQqP27UmDNM4PKscS3LmhYw91Q0r-t4Qo',
    readTime: '5 min read',
    views: '0 views',
    category: newPost.value.category,
    authorInitials: newPost.value.authorName.charAt(0) || 'U',
    authorName: newPost.value.authorName || 'Unknown',
    authorBg: 'bg-primary-fixed',
    authorText: 'text-on-primary-fixed',
    date: 'Just now',
    status: 'Published',
    statusColor: 'bg-teal-500',
    statusTextColor: 'text-teal-700'
  })
  
  isModalOpen.value = false
  newPost.value.title = ''
  newPost.value.authorName = ''
}
</script>
