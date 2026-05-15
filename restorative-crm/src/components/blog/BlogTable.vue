<template>
  <div class="card overflow-hidden shadow-sm">
    <div class="overflow-x-auto no-scrollbar">
      <table class="w-full text-left border-collapse min-w-[750px]">
        <thead>
          <tr class="bg-surface-container-low">
            <th class="px-4 lg:px-6 py-3.5 label-xs">Article</th>
            <th class="px-4 lg:px-6 py-3.5 label-xs">Category</th>
            <th class="px-4 lg:px-6 py-3.5 label-xs">Author</th>
            <th class="px-4 lg:px-6 py-3.5 label-xs">Date</th>
            <th class="px-4 lg:px-6 py-3.5 label-xs">Status</th>
            <th class="px-4 lg:px-6 py-3.5 text-right label-xs">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-container">
          <tr v-for="post in posts" :key="post.id" class="group hover:bg-surface transition-colors">
            <td class="px-4 lg:px-6 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    :alt="post.title"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    :src="post.image"
                  />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px]">
                    {{ post.title }}
                  </p>
                  <p class="text-xs text-on-surface-variant">
                    {{ post.readTime }} • {{ post.views }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 lg:px-6 py-3.5">
              <span class="bg-secondary-container/30 text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {{ post.category }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-3.5">
              <div class="flex items-center gap-1.5">
                <div
                  :class="['w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold', post.authorBg, post.authorText]"
                >
                  {{ post.authorInitials }}
                </div>
                <span class="text-sm">{{ post.authorName }}</span>
              </div>
            </td>
            <td class="px-4 lg:px-6 py-3.5 text-sm text-on-surface-variant whitespace-nowrap">
              {{ post.date }}
            </td>
            <td class="px-4 lg:px-6 py-3.5">
              <div :class="['flex items-center gap-1.5 text-xs font-bold', post.statusTextColor]">
                <span :class="['w-1.5 h-1.5 rounded-full', post.statusColor]"></span>
                {{ post.status }}
              </div>
            </td>
            <td class="px-4 lg:px-6 py-3.5 text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all">
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/20 transition-all">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="px-4 lg:px-6 py-3 bg-surface-container-low flex items-center justify-between">
      <p class="text-xs text-on-surface-variant">Showing <span class="text-on-surface font-medium">1-{{ posts.length }}</span> of 124 articles</p>
      <div class="flex items-center gap-0.5">
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant disabled:opacity-30" disabled>
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-on-primary text-xs font-bold">1</button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-bold">2</button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-bold">3</button>
        <span class="px-1 text-xs">…</span>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-xs font-bold">31</button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant">
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBlogStore } from '@/stores/blog.js'
import { storeToRefs } from 'pinia'

const store = useBlogStore()
const { posts } = storeToRefs(store)
</script>
