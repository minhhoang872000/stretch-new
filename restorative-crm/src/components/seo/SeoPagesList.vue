<template>
  <section class="card overflow-hidden">
    <div class="px-4 lg:px-6 py-4 border-b border-surface-container-highest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h3 class="font-bold text-sm text-on-surface">Quản lý theo trang</h3>
      <div class="flex gap-2">
        <button @click="openAddPage" class="btn-primary flex items-center gap-1.5 !py-2 !px-4 !text-xs">
          <span class="material-symbols-outlined text-sm">add</span>
          Thêm trang
        </button>
        <button class="p-2 hover:bg-surface-container rounded-lg text-outline transition-colors">
          <span class="material-symbols-outlined text-lg">filter_list</span>
        </button>
        <button class="p-2 hover:bg-surface-container rounded-lg text-outline transition-colors">
          <span class="material-symbols-outlined text-lg">download</span>
        </button>
      </div>
    </div>
    <div class="overflow-x-auto no-scrollbar">
      <table class="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr class="bg-surface-container-low">
            <th class="px-4 lg:px-6 py-3 label-xs whitespace-nowrap">Tên trang</th>
            <th class="px-4 lg:px-6 py-3 label-xs whitespace-nowrap">Tiêu đề Meta</th>
            <th class="px-4 lg:px-6 py-3 label-xs whitespace-nowrap">Mô tả Meta</th>
            <th class="px-4 lg:px-6 py-3 label-xs whitespace-nowrap">Trạng thái</th>
            <th class="px-4 lg:px-6 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-container-highest/30">
          <tr v-for="page in pages" :key="page.id" class="hover:bg-surface-container-low/50 transition-colors group">
            <td class="px-4 lg:px-6 py-4 font-bold text-on-surface text-sm whitespace-nowrap">{{ page.name }}</td>
            <td class="px-4 lg:px-6 py-4 text-sm text-primary max-w-[180px] truncate" :title="page.title">{{ page.title }}</td>
            <td class="px-4 lg:px-6 py-4 text-sm text-on-surface-variant max-w-[220px] truncate" :class="page.status === 'Incomplete' ? '!text-tertiary' : ''">{{ page.description }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest" :class="page.statusClass">{{ page.status }}</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-right">
              <button @click="editPage(page)" class="p-1.5 rounded-full hover:bg-primary-fixed opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                <span class="material-symbols-outlined text-primary text-lg">edit</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ActionModal v-model:isOpen="isAddModalOpen" title="Thêm trang" submitLabel="Thêm trang" @submit="handleAddPage">
      <div class="space-y-4">
        <div>
          <label class="label-xs mb-1.5 block">Tên trang</label>
          <input v-model="newPage.name" type="text" class="input-field" placeholder="Tên trang" />
        </div>
        <div>
          <label class="label-xs mb-1.5 block">Tiêu đề Meta</label>
          <input v-model="newPage.title" type="text" class="input-field" placeholder="Tiêu đề Meta" />
        </div>
        <div>
          <label class="label-xs mb-1.5 block">Mô tả Meta</label>
          <textarea v-model="newPage.description" rows="3" class="input-field" placeholder="Mô tả Meta"></textarea>
        </div>
      </div>
    </ActionModal>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useSeoStore } from '@/stores/seo.js'
import { storeToRefs } from 'pinia'
import ActionModal from '@/components/ui/ActionModal.vue'

const store = useSeoStore()
const { pages } = storeToRefs(store)

const isAddModalOpen = ref(false)
const newPage = ref({ name: '', title: '', description: '' })

const openAddPage = () => { isAddModalOpen.value = true }

const editPage = (page) => {
  newPage.value = { ...page }
  isAddModalOpen.value = true
}

const handleAddPage = () => {
  if (!newPage.value.name) return
  const existing = pages.value.find(p => p.id === newPage.value.id)
  if (existing) {
    Object.assign(existing, {
      name: newPage.value.name,
      title: newPage.value.title,
      description: newPage.value.description,
      status: newPage.value.description ? 'Optimized' : 'Incomplete',
      statusClass: newPage.value.description ? 'bg-emerald-100 text-emerald-800' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
    })
  } else {
    pages.value.push({
      id: Date.now().toString(),
      name: newPage.value.name,
      title: newPage.value.title,
      description: newPage.value.description,
      status: newPage.value.description ? 'Optimized' : 'Incomplete',
      statusClass: newPage.value.description ? 'bg-emerald-100 text-emerald-800' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
    })
  }
  isAddModalOpen.value = false
  newPage.value = { name: '', title: '', description: '' }
}
</script>
