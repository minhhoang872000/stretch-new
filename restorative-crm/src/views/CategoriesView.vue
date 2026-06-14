<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <span class="label-xs mb-1 block">Content Management</span>
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">Categories</h1>
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
        <span class="material-symbols-outlined text-lg" style="font-variation-settings:'FILL' 1">add</span>
        New Category
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="catStore.loading" class="card p-8 text-center text-on-surface-variant">Loading categories…</div>
    <div v-else-if="catStore.error" class="card p-8 text-center text-error">{{ catStore.error }}</div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="categories.length === 0" class="card p-10 text-center">
        <span class="material-symbols-outlined text-4xl text-outline mb-3 block">category</span>
        <p class="text-sm text-on-surface-variant mb-4">No categories yet.</p>
        <button @click="openCreate" class="btn-primary !text-xs inline-flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">add</span> Create your first category
        </button>
      </div>

      <!-- Category Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="card overflow-hidden group hover:shadow-md transition-shadow"
        >
          <!-- Card Header -->
          <div class="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="cat.iconBg">
              <span class="material-symbols-outlined text-xl" :class="cat.iconColor" style="font-variation-settings:'FILL' 1">{{ cat.icon }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="font-bold text-on-surface text-base truncate">{{ cat.label }}</h2>
              <p class="text-xs text-on-surface-variant truncate">{{ cat.description || '—' }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-2xl font-extrabold text-on-surface">{{ cat.posts.length }}</p>
              <p class="text-xs text-on-surface-variant">posts</p>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-3 divide-x divide-outline-variant/20 bg-surface-container-lowest">
            <div class="px-4 py-3 text-center">
              <p class="text-base font-bold text-teal-600">{{ cat.publishedCount }}</p>
              <p class="text-xs text-on-surface-variant">Published</p>
            </div>
            <div class="px-4 py-3 text-center">
              <p class="text-base font-bold text-amber-500">{{ cat.draftCount }}</p>
              <p class="text-xs text-on-surface-variant">Draft</p>
            </div>
            <div class="px-4 py-3 text-center">
              <p class="text-base font-bold text-on-surface">{{ cat.totalViews.toLocaleString() }}</p>
              <p class="text-xs text-on-surface-variant">Views</p>
            </div>
          </div>

          <!-- Recent Posts -->
          <div class="px-6 py-4 space-y-3">
            <p class="label-xs">Recent posts</p>
            <div v-if="cat.posts.length === 0" class="text-sm text-on-surface-variant py-2">No posts yet.</div>
            <router-link
              v-for="post in cat.posts.slice(0, 3)"
              :key="post.slug"
              :to="{ name: 'BlogDetail', params: { slug: post.slug } }"
              class="flex items-center gap-3 group/item"
            >
              <div class="w-10 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                <img :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-on-surface truncate group-hover/item:text-primary transition-colors hover:underline">{{ post.title }}</p>
                <p class="text-xs text-on-surface-variant">{{ post.date }} · {{ post.views }} views</p>
              </div>
              <span
                class="text-xs font-bold shrink-0"
                :class="post.status === 'published' ? 'text-teal-600' : 'text-amber-500'"
              >{{ post.status === 'published' ? '●' : '○' }}</span>
            </router-link>
            <div v-if="cat.posts.length > 3" class="text-xs text-on-surface-variant pt-1">
              +{{ cat.posts.length - 3 }} more posts
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 pb-5 flex items-center justify-between gap-3">
            <router-link
              :to="{ name: 'Blog' }"
              @click="setFilter(cat.label)"
              class="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-70 transition-opacity"
            >
              View all {{ cat.label }} posts
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </router-link>
            <div class="flex items-center gap-1">
              <button @click="openEdit(cat)" class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all" title="Edit">
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button @click="confirmDelete(cat)" class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/20 transition-all" title="Delete">
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Summary -->
      <div v-if="categories.length" class="mt-6 card p-5 flex flex-wrap gap-6">
        <div>
          <p class="label-xs mb-0.5">Categories</p>
          <p class="text-2xl font-extrabold text-on-surface">{{ categories.length }}</p>
        </div>
        <div>
          <p class="label-xs mb-0.5">Total Posts</p>
          <p class="text-2xl font-extrabold text-on-surface">{{ blogStore.stats.total }}</p>
        </div>
        <div>
          <p class="label-xs mb-0.5">Published</p>
          <p class="text-2xl font-extrabold text-teal-600">{{ blogStore.stats.published }}</p>
        </div>
        <div>
          <p class="label-xs mb-0.5">Draft</p>
          <p class="text-2xl font-extrabold text-amber-500">{{ blogStore.stats.draft }}</p>
        </div>
        <div class="ml-auto self-center">
          <router-link :to="{ name: 'Blog' }" class="btn-primary flex items-center gap-2 !py-2 !text-xs">
            <span class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">add</span>
            New Post
          </router-link>
        </div>
      </div>
    </template>

    <!-- ════════════ Create / Edit Modal ════════════ -->
    <ActionModal
      v-model:isOpen="editorOpen"
      :title="editingCat ? 'Edit Category' : 'New Category'"
      :submitLabel="editingCat ? 'Save Changes' : 'Create Category'"
      :loading="saving"
      @submit="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="label-xs mb-1.5 block">Label *</label>
          <input v-model="form.label" type="text" class="input-field" placeholder="e.g. Knowledge" @blur="autoKey" />
        </div>
        <div>
          <label class="label-xs mb-1.5 block">
            Key * <span class="font-normal text-outline normal-case">(used by posts — lowercase, underscores)</span>
          </label>
          <input
            v-model="form.key"
            type="text"
            class="input-field font-mono text-xs"
            :class="editingCat ? 'opacity-60' : ''"
            :disabled="!!editingCat"
            placeholder="knowledge"
          />
          <p v-if="editingCat" class="text-[11px] text-on-surface-variant mt-1">Key can't be changed — posts reference it.</p>
        </div>
        <div>
          <label class="label-xs mb-1.5 block">Description</label>
          <textarea v-model="form.description" rows="2" class="input-field resize-none" placeholder="Short description of this category"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label-xs mb-1.5 block">Icon <span class="font-normal text-outline normal-case">(material symbol)</span></label>
            <input v-model="form.icon" type="text" class="input-field font-mono text-xs" placeholder="category" />
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="ic in ICON_SUGGESTIONS"
                :key="ic"
                type="button"
                @click="form.icon = ic"
                class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                :class="form.icon === ic ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'"
              >
                <span class="material-symbols-outlined text-lg">{{ ic }}</span>
              </button>
            </div>
          </div>
          <div>
            <label class="label-xs mb-1.5 block">Sort order</label>
            <input v-model.number="form.sortOrder" type="number" class="input-field" placeholder="0" />
          </div>
        </div>
        <div>
          <label class="label-xs mb-1.5 block">Color theme</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="theme in COLOR_THEMES"
              :key="theme.name"
              type="button"
              @click="form.iconBg = theme.iconBg; form.iconColor = theme.iconColor"
              class="w-9 h-9 rounded-xl flex items-center justify-center ring-2 transition-all"
              :class="[theme.iconBg, form.iconBg === theme.iconBg ? 'ring-primary' : 'ring-transparent']"
              :title="theme.name"
            >
              <span class="material-symbols-outlined text-lg" :class="theme.iconColor" style="font-variation-settings:'FILL' 1">{{ form.icon || 'category' }}</span>
            </button>
          </div>
        </div>
        <p v-if="formError" class="text-error text-xs p-2 bg-error-container/20 rounded-lg">{{ formError }}</p>
      </div>
    </ActionModal>

    <!-- Delete Confirm -->
    <ActionModal
      v-model:isOpen="isDeleteOpen"
      title="Delete Category"
      submitLabel="Delete"
      :loading="deleting"
      submitClass="btn-error"
      @submit="handleDelete"
    >
      <p class="text-sm text-on-surface-variant">
        Are you sure you want to delete <strong class="text-on-surface">{{ deletingCat?.label }}</strong>?
        <span v-if="deletingCat?.posts.length" class="block mt-2 text-amber-600">
          {{ deletingCat.posts.length }} post(s) use this category — they will keep their <code class="font-mono">{{ deletingCat.key }}</code> key but lose this label.
        </span>
      </p>
    </ActionModal>
  </main>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import ActionModal from '@/components/ui/ActionModal.vue'
import { useBlogStore } from '@/stores/blog.js'
import { useCategoriesStore } from '@/stores/categories.js'
import { useNotify } from '@/composables/useNotify.js'

const blogStore = useBlogStore()
const catStore = useCategoriesStore()
const notify = useNotify()

onMounted(() => {
  catStore.loadCategories()
  blogStore.loadPosts()
})

const COLOR_THEMES = [
  { name: 'Teal', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  { name: 'Blue', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { name: 'Purple', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { name: 'Orange', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { name: 'Rose', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  { name: 'Amber', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { name: 'Emerald', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { name: 'Indigo', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
]

const ICON_SUGGESTIONS = ['menu_book', 'campaign', 'groups', 'event', 'lightbulb', 'favorite', 'fitness_center', 'spa']

// Join categories (lead-tracker-api) with post counts (site posts via blog store)
const categories = computed(() =>
  catStore.categories.map(cat => {
    const catPosts = blogStore.posts.filter(p => p.categoryKey === cat.key)
    return {
      ...cat,
      posts: catPosts,
      publishedCount: catPosts.filter(p => p.status === 'published').length,
      draftCount: catPosts.filter(p => p.status === 'draft').length,
      totalViews: catPosts.reduce((s, p) => s + (p.views || 0), 0),
    }
  })
)

function setFilter(label) {
  blogStore.filterCategory = label
}

// ─── Create / Edit ──────────────────────────────────────────────
const editorOpen = ref(false)
const editingCat = ref(null)
const saving = ref(false)
const formError = ref('')

const emptyForm = () => ({
  key: '',
  label: '',
  description: '',
  icon: 'category',
  iconBg: 'bg-teal-50',
  iconColor: 'text-teal-600',
  sortOrder: catStore.categories.length,
})

const form = reactive(emptyForm())

function autoKey() {
  if (!editingCat.value && !form.key && form.label) {
    form.key = form.label
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .trim()
      .replace(/\s+/g, '_')
  }
}

function openCreate() {
  editingCat.value = null
  Object.assign(form, emptyForm())
  formError.value = ''
  editorOpen.value = true
}

function openEdit(cat) {
  editingCat.value = cat
  Object.assign(form, {
    key: cat.key,
    label: cat.label,
    description: cat.description || '',
    icon: cat.icon,
    iconBg: cat.iconBg,
    iconColor: cat.iconColor,
    sortOrder: cat.sortOrder,
  })
  formError.value = ''
  editorOpen.value = true
}

async function handleSubmit() {
  formError.value = ''
  if (!form.label.trim()) {
    formError.value = 'Label is required.'
    return
  }
  if (!editingCat.value && !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(form.key)) {
    formError.value = 'Key must be lowercase letters, digits and underscores only.'
    return
  }

  saving.value = true
  try {
    if (editingCat.value) {
      await catStore.editCategory(editingCat.value.id, {
        label: form.label,
        description: form.description || null,
        icon: form.icon,
        iconBg: form.iconBg,
        iconColor: form.iconColor,
        sortOrder: form.sortOrder,
      })
      notify.success('toast.categoryUpdated')
    } else {
      await catStore.addCategory({
        key: form.key,
        label: form.label,
        description: form.description || null,
        icon: form.icon,
        iconBg: form.iconBg,
        iconColor: form.iconColor,
        sortOrder: form.sortOrder,
      })
      notify.success('toast.categoryCreated')
    }
    editorOpen.value = false
  } catch (e) {
    formError.value = e.message || 'Failed to save category.'
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

// ─── Delete ─────────────────────────────────────────────────────
const isDeleteOpen = ref(false)
const deletingCat = ref(null)
const deleting = ref(false)

function confirmDelete(cat) {
  deletingCat.value = cat
  isDeleteOpen.value = true
}

async function handleDelete() {
  if (!deletingCat.value) return
  deleting.value = true
  try {
    await catStore.removeCategory(deletingCat.value.id)
    notify.success('toast.categoryDeleted')
    isDeleteOpen.value = false
    deletingCat.value = null
  } catch (e) {
    console.error(e)
    notify.error(e.message)
  } finally {
    deleting.value = false
  }
}
</script>
