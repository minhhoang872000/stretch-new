<template>
  <main class="p-4 lg:p-8 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <span class="label-xs mb-1 block">{{ $t('blog.contentRepo') }}</span>
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight">{{ $t('blog.title') }}</h1>
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
        <span class="material-symbols-outlined text-lg" style="font-variation-settings:'FILL' 1">add</span>
        {{ $t('blog.newPost') }}
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <p class="label-xs mb-1">Total Posts</p>
        <p class="text-2xl font-bold text-on-surface">{{ store.stats.total }}</p>
      </div>
      <div class="card p-4">
        <p class="label-xs mb-1">Published</p>
        <p class="text-2xl font-bold text-teal-600">{{ store.stats.published }}</p>
      </div>
      <div class="card p-4">
        <p class="label-xs mb-1">Draft</p>
        <p class="text-2xl font-bold text-amber-500">{{ store.stats.draft }}</p>
      </div>
      <div class="card p-4">
        <p class="label-xs mb-1">Total Views</p>
        <p class="text-2xl font-bold text-on-surface">{{ store.stats.totalViews.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input v-model="store.searchQuery" type="text" placeholder="Search posts..."
        class="input-field flex-1 min-w-[180px]" />
      <select v-model="store.filterCategory" class="input-field w-auto" @change="store.applyFilters()">
        <option value="">All Categories</option>
        <option v-for="c in catStore.categories" :key="c.id" :value="c.key">{{ c.label }}</option>
      </select>
      <select v-model="store.filterStatus" class="input-field w-auto" @change="store.applyFilters()">
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <!-- Loading / Error -->
    <div v-if="store.loading" class="card p-8 text-center text-on-surface-variant">Loading posts…</div>
    <div v-else-if="store.error" class="card p-8 text-center text-error">{{ store.error }}</div>

    <!-- Table -->
    <div v-else class="card overflow-hidden shadow-sm">
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
            <tr v-if="store.posts.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-on-surface-variant text-sm">No posts found.</td>
            </tr>
            <tr v-for="post in store.posts" :key="post.id" class="group hover:bg-surface transition-colors">
              <td class="px-4 lg:px-6 py-3.5">
                <div class="flex items-center gap-3 cursor-pointer" @click="openDetail(post)">
                  <div class="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                    <img :alt="post.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" :src="post.image" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px] hover:underline">{{ post.title }}</p>
                    <p class="text-xs text-on-surface-variant">{{ post.readTime }} · {{ post.views }} views</p>
                  </div>
                </div>
              </td>
              <td class="px-4 lg:px-6 py-3.5">
                <span class="bg-secondary-container/30 text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-semibold">{{ post.category }}</span>
              </td>
              <td class="px-4 lg:px-6 py-3.5 text-sm">{{ post.author }}</td>
              <td class="px-4 lg:px-6 py-3.5 text-sm text-on-surface-variant whitespace-nowrap">{{ post.date }}</td>
              <td class="px-4 lg:px-6 py-3.5">
                <button @click="togglePublish(post)" class="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
                  :class="post.status === 'published' ? 'text-teal-700' : 'text-amber-600'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="post.status === 'published' ? 'bg-teal-500' : 'bg-amber-400'"></span>
                  {{ post.status === 'published' ? 'Published' : 'Draft' }}
                </button>
              </td>
              <td class="px-4 lg:px-6 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEdit(post)" class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all" title="Edit">
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button @click="confirmDelete(post)" class="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/20 transition-all" title="Delete">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="store.total > store.limit" class="flex items-center justify-between px-4 lg:px-6 py-3 bg-surface-container-low border-t border-outline-variant/10">
        <span class="text-xs text-on-surface-variant">{{ store.total }} post{{ store.total !== 1 ? 's' : '' }} total</span>
        <div class="flex items-center gap-2">
          <button :disabled="store.page <= 1" @click="store.setPage(store.page - 1)" class="btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Prev</button>
          <span class="px-2 py-1.5 text-xs font-semibold text-on-surface">{{ store.page }} / {{ Math.max(1, Math.ceil(store.total / store.limit)) }}</span>
          <button :disabled="store.page >= Math.ceil(store.total / store.limit)" @click="store.setPage(store.page + 1)" class="btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>
      <div v-else class="px-4 lg:px-6 py-3 bg-surface-container-low">
        <p class="text-xs text-on-surface-variant">{{ store.total }} post{{ store.total !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         FULL-PAGE BLOG EDITOR
         ════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="editorOpen"
        class="fixed inset-0 z-50 bg-surface flex flex-col"
        style="animation: slideUp 0.25s ease">

        <!-- Editor Topbar -->
        <div class="shrink-0 h-14 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 gap-4">
          <div class="flex items-center gap-3">
            <button @click="closeEditor" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
            <span class="text-sm font-bold text-on-surface">{{ editingPost ? 'Edit Post' : 'New Post' }}</span>
            <span v-if="autoSaved" class="text-xs text-teal-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">check_circle</span> Saved
            </span>
          </div>
          <div class="flex items-center gap-2">
            <select v-model="form.status" class="text-xs bg-surface-container border border-outline-variant/30 rounded-full px-3 py-1.5 font-semibold text-on-surface">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button @click="handleSubmit" :disabled="saving"
              class="btn-primary flex items-center gap-1.5 !py-1.5 !text-xs">
              <span v-if="saving" class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span v-else class="material-symbols-outlined text-sm" style="font-variation-settings:'FILL' 1">save</span>
              {{ saving ? 'Saving…' : (editingPost ? 'Save Changes' : 'Publish') }}
            </button>
          </div>
        </div>

        <!-- Editor Body — single scroll column on mobile, two independent scroll panes on desktop -->
        <div class="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">

          <!-- ── Left: Metadata Panel ── -->
          <div class="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-outline-variant/20 lg:overflow-y-auto p-5 space-y-4 bg-surface-container-lowest">
            <!-- Language toggle (Title / Excerpt / Content are per-language) -->
            <div class="flex items-center gap-1 bg-surface-container rounded-full p-1">
              <button type="button" @click="activeLang = 'vi'"
                class="flex-1 text-xs font-bold py-1.5 rounded-full transition-all"
                :class="activeLang === 'vi' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'">
                Tiếng Việt
              </button>
              <button type="button" @click="activeLang = 'en'"
                class="flex-1 text-xs font-bold py-1.5 rounded-full transition-all"
                :class="activeLang === 'en' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'">
                English
              </button>
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Title · {{ langLabel }} *</label>
              <input v-model="titleModel" type="text"
                :class="['input-field', titleError ? 'border-red-400 ring-1 ring-red-300' : '']"
                :placeholder="`Post title (${langLabel})`"
                @blur="autoSlug"
                @input="errors.titleVi = ''; errors.titleEn = ''" />
              <p v-if="titleError" class="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">error</span>{{ titleError }}
              </p>
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Slug * <span class="font-normal text-outline normal-case">(shared)</span></label>
              <input v-model="form.slug" type="text"
                :class="['input-field font-mono text-xs', errors.slug ? 'border-red-400 ring-1 ring-red-300' : '']"
                placeholder="post-slug-here"
                @input="errors.slug = ''" />
              <p v-if="errors.slug" class="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">error</span>{{ errors.slug }}
              </p>
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Excerpt · {{ langLabel }}</label>
              <textarea v-model="excerptModel"
                :class="['input-field resize-none', excerptError ? 'border-red-400 ring-1 ring-red-300' : '']"
                rows="3" :placeholder="`Short description (${langLabel})`"
                @input="errors.excerpt = ''"></textarea>
              <p v-if="excerptError" class="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">error</span>{{ excerptError }}
              </p>
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Cover Image</label>
              <div class="flex gap-2">
                <input v-model="form.image" type="text" class="input-field text-xs flex-1" placeholder="/image.webp or https://… (or upload)" />
                <button
                  type="button"
                  class="btn-secondary text-xs whitespace-nowrap px-3"
                  :disabled="coverUploading"
                  @click="coverFileInput?.click()"
                >
                  {{ coverUploading ? 'Uploading…' : 'Upload' }}
                </button>
                <input ref="coverFileInput" type="file" accept="image/*" class="hidden" @change="onCoverFileChange" />
              </div>
              <p v-if="coverUploadError" class="text-error text-xs mt-1">{{ coverUploadError }}</p>
              <div v-if="form.image" class="mt-2 rounded-xl overflow-hidden h-28 bg-surface-container">
                <img :src="form.image" class="w-full h-full object-cover" @error="form.image = ''" />
              </div>
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Category *</label>
              <select v-model="form.categoryKey" class="input-field" @change="syncCategory">
                <option v-if="catStore.categories.length === 0" value="articles">Knowledge</option>
                <option v-for="c in catStore.categories" :key="c.id" :value="c.key">{{ c.label }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label-xs mb-1.5 block">Author *</label>
                <input v-model="form.author" type="text"
                  :class="['input-field', errors.author ? 'border-red-400 ring-1 ring-red-300' : '']"
                  placeholder="Stretch Team"
                  @input="errors.author = ''" />
                <p v-if="errors.author" class="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">error</span>{{ errors.author }}
                </p>
              </div>
              <div>
                <label class="label-xs mb-1.5 block">Read Time</label>
                <input v-model="form.readTime" type="text" class="input-field" placeholder="5 min read" />
              </div>
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Date</label>
              <input v-model="dateInput" type="date" class="input-field" />
            </div>
            <div>
              <label class="label-xs mb-1.5 block">Tags <span class="font-normal text-outline normal-case">(comma separated)</span></label>
              <input v-model="tagsInput" type="text" class="input-field" placeholder="Recovery, Movement, Performance" />
            </div>
            <p v-if="formError" class="text-red-600 text-xs p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-1.5">
              <span class="material-symbols-outlined text-sm mt-0.5 shrink-0">warning</span>
              <span>{{ formError }}</span>
            </p>
          </div>

          <!-- ── Right: Content Editor + Preview ── -->
          <div class="flex-1 overflow-hidden flex flex-col">

            <!-- Tab bar -->
            <div class="shrink-0 flex items-center gap-1 border-b border-outline-variant/20 px-5 lg:px-8 bg-surface">
              <button type="button" @click="previewMode = false"
                :class="['flex items-center gap-1.5 text-xs font-bold px-1 py-3.5 border-b-2 transition-colors -mb-px',
                  !previewMode ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface']">
                <span class="material-symbols-outlined text-base">edit</span>
                Chỉnh sửa <span class="font-normal opacity-60">({{ langLabel }})</span>
              </button>
              <button type="button" @click="previewMode = true"
                :class="['flex items-center gap-1.5 text-xs font-bold px-1 py-3.5 border-b-2 transition-colors -mb-px ml-3',
                  previewMode ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface']">
                <span class="material-symbols-outlined text-base">visibility</span>
                Xem trước
              </button>
            </div>

            <!-- Editor panel -->
            <div v-show="!previewMode" class="flex-1 overflow-y-auto p-5 lg:p-8">
              <p v-if="errors.content" class="text-red-500 text-xs mb-3 flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">error</span>{{ errors.content }}
              </p>
              <CKEditorField
                :key="activeLang"
                v-model="contentModel"
                placeholder="Write your post content here…"
                :class="errors.content ? 'ck-editor-wrapper--error' : ''"
                @update:modelValue="errors.content = ''" />
            </div>

            <!-- Preview panel -->
            <div v-show="previewMode" class="flex-1 overflow-y-auto bg-[#f5f5f0]">

              <!-- Hero (matches site layout) -->
              <div class="bg-white border-b border-[#e6ecf2] px-6 lg:px-10 py-8">
                <div class="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div class="lg:col-span-7 flex flex-col">
                    <span class="text-[#f47a1f] font-bold text-xs tracking-wider uppercase mb-2">
                      {{ previewData.category || 'Category' }}
                    </span>
                    <h1 class="text-2xl lg:text-3xl font-bold text-[#0b2a4a] leading-tight mb-3">
                      {{ previewData.title || '(Chưa có tiêu đề)' }}
                    </h1>
                    <p class="text-gray-500 text-sm leading-relaxed mb-4">
                      {{ previewData.excerpt || '(Chưa có mô tả)' }}
                    </p>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">calendar_today</span>
                        {{ form.date || '—' }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">person</span>
                        {{ form.author || '—' }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">schedule</span>
                        {{ form.readTime || '—' }}
                      </span>
                    </div>
                  </div>
                  <div class="lg:col-span-5">
                    <div class="rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 flex items-center justify-center">
                      <img v-if="form.image" :src="form.image" :alt="previewData.title" class="w-full h-full object-cover" />
                      <span v-else class="material-symbols-outlined text-5xl text-gray-300">image</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Article body -->
              <div class="max-w-3xl mx-auto px-6 lg:px-10 py-8">
                <div class="bg-white rounded-2xl border border-[#e6ecf2] p-6 lg:p-10 shadow-sm">
                  <div v-if="previewData.content" class="blog-preview-html" v-html="previewData.content"></div>
                  <p v-else class="text-gray-300 text-sm text-center py-10 italic">Nội dung sẽ hiện ở đây…</p>
                </div>
                <!-- Tags -->
                <div v-if="previewTags.length" class="mt-5 flex flex-wrap gap-2">
                  <span v-for="tag in previewTags" :key="tag"
                    class="px-3 py-1 bg-white border border-[#e6ecf2] rounded-full text-xs font-semibold text-[#0b2a4a]">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <ActionModal
      v-model:isOpen="isDeleteOpen"
      title="Delete Post"
      submitLabel="Delete"
      :loading="deleting"
      submitClass="btn-error"
      @submit="handleDelete"
    >
      <p class="text-sm text-on-surface-variant">Are you sure you want to delete <strong class="text-on-surface">{{ deletingPost?.title }}</strong>? This action cannot be undone.</p>
    </ActionModal>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionModal from '@/components/ui/ActionModal.vue'
import CKEditorField from '@/components/ui/CKEditorField.vue'
import { useBlogStore } from '@/stores/blog.js'
import { useCategoriesStore } from '@/stores/categories.js'
import { uploadImage } from '@/services/api'
import { formatDate } from '@/utils/date.js'
import { useNotify } from '@/composables/useNotify.js'

const store = useBlogStore()
const catStore = useCategoriesStore()
const route = useRoute()
const router = useRouter()
const notify = useNotify()

onMounted(async () => {
  await Promise.all([store.loadPosts(), store.loadStats(), catStore.loadCategories()])
  // Arrived from the detail page's "Edit" button → open the editor directly.
  if (route.query.edit) {
    const target = store.posts.find(p => p.slug === route.query.edit)
    if (target) openEdit(target)
    router.replace({ query: {} })
  }
})

function openDetail(post) {
  router.push({ name: 'BlogDetail', params: { slug: post.slug } })
}

// Debounce the search box so we don't hit the API on every keystroke.
let searchTimer = null
watch(() => store.searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters(), 350)
})

// ─── Editor state ───────────────────────────────────────────────
const editorOpen = ref(false)
const editingPost = ref(null)
const saving = ref(false)
const formError = ref('')
const autoSaved = ref(false)

// Per-field validation errors
const errors = reactive({
  titleVi: '',
  titleEn: '',
  slug: '',
  author: '',
  excerpt: '',
  content: '',
})

function clearErrors() {
  Object.keys(errors).forEach(k => { errors[k] = '' })
}

function validate() {
  clearErrors()
  let valid = true

  // Title: require at least ONE language (the payload fills the other as a
  // fallback, matching how excerpt/content are validated below).
  const titleVi = (form.titleVi || '').trim()
  const titleEn = (form.titleEn || '').trim()
  if (!titleVi && !titleEn) {
    errors.titleVi = 'Vui lòng nhập tiêu đề (ít nhất một ngôn ngữ)'
    errors.titleEn = 'Please enter a title (at least one language)'
    valid = false
  }

  if (!form.slug.trim()) {
    errors.slug = 'Slug không được để trống'
    valid = false
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    errors.slug = 'Slug chỉ được dùng chữ thường, số và dấu gạch ngang (vd: my-post-title)'
    valid = false
  }

  if (!form.author.trim()) {
    errors.author = 'Tên tác giả không được để trống'
    valid = false
  }

  const hasExcerpt = (form.excerptVi || '').trim() || (form.excerptEn || '').trim()
  if (!hasExcerpt) {
    errors.excerpt = 'Vui lòng nhập mô tả ngắn cho ít nhất một ngôn ngữ'
    valid = false
  }

  const hasContent = (form.contentVi || '').trim() || (form.contentEn || '').trim()
  if (!hasContent) {
    errors.content = 'Nội dung bài viết không được để trống'
    valid = false
  }

  return valid
}

// Language toggle — Title / Excerpt / Content are stored per language.
const activeLang = ref('vi')
const langLabel = computed(() => (activeLang.value === 'vi' ? 'Tiếng Việt' : 'English'))

// Show the title/excerpt error for whichever language tab is active
const titleError = computed(() => activeLang.value === 'vi' ? errors.titleVi : errors.titleEn)
const excerptError = computed(() => errors.excerpt)

// ─── Preview tab ────────────────────────────────────────────────
const previewMode = ref(false)

const previewData = computed(() => {
  const isVi = activeLang.value === 'vi'
  return {
    title:   isVi ? form.titleVi   : form.titleEn,
    excerpt: isVi ? form.excerptVi : form.excerptEn,
    content: isVi ? form.contentVi : form.contentEn,
    category: form.category,
  }
})

const previewTags = computed(() =>
  tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
)

// Explicit get/set proxies for the active language. (A dynamic
// `v-model="form[computedKey]"` does not reliably write back, so we bind
// these instead.)
const titleModel = computed({
  get: () => (activeLang.value === 'vi' ? form.titleVi : form.titleEn),
  set: (v) => { if (activeLang.value === 'vi') form.titleVi = v; else form.titleEn = v },
})
const excerptModel = computed({
  get: () => (activeLang.value === 'vi' ? form.excerptVi : form.excerptEn),
  set: (v) => { if (activeLang.value === 'vi') form.excerptVi = v; else form.excerptEn = v },
})
const contentModel = computed({
  get: () => (activeLang.value === 'vi' ? form.contentVi : form.contentEn),
  set: (v) => { if (activeLang.value === 'vi') form.contentVi = v; else form.contentEn = v },
})

const emptyForm = () => ({
  titleEn: '',
  titleVi: '',
  slug: '',
  excerptEn: '',
  excerptVi: '',
  contentEn: '',   // CKEditor HTML (English)
  contentVi: '',   // CKEditor HTML (Vietnamese)
  categoryKey: 'articles',
  category: 'Knowledge',
  status: 'draft',
  author: 'Stretch Team',
  readTime: '5 min read',
  date: formatDate(new Date()),
  image: '/homepage-hero.webp',
  tags: [],
})

const form = reactive(emptyForm())
const tagsInput = ref('')

// Date picker proxy: the editor uses a native <input type="date"> (YYYY-MM-DD),
// while posts store/display a friendly date string ("May 10, 2025").
const dateInput = computed({
  get() {
    if (!form.date) return ''
    const d = new Date(form.date)
    if (isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },
  set(iso) {
    if (!iso) { form.date = ''; return }
    form.date = formatDate(new Date(iso + 'T00:00:00'))
  },
})

// ─── Cover image upload ─────────────────────────────────────────
const coverFileInput = ref(null)
const coverUploading = ref(false)
const coverUploadError = ref('')

async function onCoverFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  coverUploadError.value = ''
  coverUploading.value = true
  try {
    const { url } = await uploadImage(file)
    form.image = url
    notify.success('toast.imageUploaded')
  } catch (err) {
    coverUploadError.value = err.message || 'Upload failed'
    notify.error(err.message || 'toast.imageUploadError')
  } finally {
    coverUploading.value = false
    e.target.value = '' // allow re-selecting the same file
  }
}

function syncCategory() {
  const found = catStore.categories.find(c => c.key === form.categoryKey)
  form.category = found ? found.label : form.categoryKey
}

function autoSlug() {
  const base = form.titleEn || form.titleVi
  if (!editingPost.value && !form.slug && base) {
    form.slug = base
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }
}

// Extract existing sections into editor HTML
function sectionsToHtml(sections = []) {
  if (!sections.length) return ''
  return sections.map(s => {
    let html = ''
    if (s.title) html += `<h2>${s.title}</h2>`
    if (s.text) html += `<p>${s.text}</p>`
    if (s.quote) html += `<blockquote><p>${s.quote}</p></blockquote>`
    if (s.bullets?.length) html += `<ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
    if (s.items?.length) html += `<ul>${s.items.map(i => `<li><strong>${i.title}</strong>${i.desc ? ': ' + i.desc : ''}</li>`).join('')}</ul>`
    return html
  }).join('\n')
}

function openCreate() {
  editingPost.value = null
  Object.assign(form, emptyForm())
  activeLang.value = 'vi'
  // Default to the first available category (in case the seeded ones changed)
  const first = catStore.categories[0]
  if (first && !catStore.categories.some(c => c.key === form.categoryKey)) {
    form.categoryKey = first.key
    form.category = first.label
  }
  tagsInput.value = ''
  formError.value = ''
  clearErrors()
  autoSaved.value = false
  previewMode.value = false
  editorOpen.value = true
}

function openEdit(post) {
  editingPost.value = post
  activeLang.value = 'vi'
  Object.assign(form, {
    titleEn: post.titleEn ?? post.title ?? '',
    titleVi: post.titleVi ?? post.title ?? '',
    slug: post.slug,
    excerptEn: post.excerptEn ?? post.excerpt ?? '',
    excerptVi: post.excerptVi ?? post.excerpt ?? '',
    contentEn: post.contentEn ?? (activeLang.value === 'en' ? post.content : '') ?? '',
    contentVi: post.contentVi ?? post.content ?? '',
    categoryKey: post.categoryKey,
    category: post.category,
    status: post.status,
    author: post.author,
    readTime: post.readTime,
    date: post.date,
    image: post.image,
    tags: post.tags ?? [],
  })
  tagsInput.value = (post.tags ?? []).join(', ')
  formError.value = ''
  clearErrors()
  autoSaved.value = false
  previewMode.value = false
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
}

async function handleSubmit() {
  formError.value = ''
  if (!validate()) return

  const titleVi = (form.titleVi || '').trim()
  const titleEn = (form.titleEn || '').trim()
  const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
  syncCategory()

  // Send both languages; fall back to the filled one so the API (which requires
  // both titleEn and titleVi) always gets non-empty values.
  const payload = {
    slug: form.slug,
    titleVi: titleVi || titleEn,
    titleEn: titleEn || titleVi,
    excerptVi: form.excerptVi || form.excerptEn || '',
    excerptEn: form.excerptEn || form.excerptVi || '',
    contentVi: form.contentVi || form.contentEn || '',
    contentEn: form.contentEn || form.contentVi || '',
    categoryKey: form.categoryKey,
    status: form.status,
    author: form.author,
    readTime: form.readTime,
    date: form.date,
    image: form.image,
    tags,
  }

  saving.value = true
  try {
    if (editingPost.value) {
      await store.editPost(form.slug, payload)
      notify.success('toast.blogUpdated')
    } else {
      await store.addPost(payload)
      notify.success('toast.blogCreated')
    }
    autoSaved.value = true
    setTimeout(() => {
      editorOpen.value = false
    }, 600)
  } catch (e) {
    formError.value = e.message || 'Failed to save post.'
    notify.error(e.message)
  } finally {
    saving.value = false
  }
}

// ─── Delete ─────────────────────────────────────────────────────
const isDeleteOpen = ref(false)
const deletingPost = ref(null)
const deleting = ref(false)

function confirmDelete(post) {
  deletingPost.value = post
  isDeleteOpen.value = true
}

async function handleDelete() {
  if (!deletingPost.value) return
  deleting.value = true
  try {
    await store.removePost(deletingPost.value.slug)
    notify.success('toast.blogDeleted')
    isDeleteOpen.value = false
    deletingPost.value = null
  } catch (e) {
    console.error(e)
    notify.error(e.message)
  } finally {
    deleting.value = false
  }
}

// ─── Toggle publish/draft (with feedback) ───────────────────────
async function togglePublish(post) {
  const willPublish = post.status !== 'published'
  try {
    await store.toggleStatus(post.slug)
    notify.success(willPublish ? 'toast.postPublished' : 'toast.postUnpublished')
  } catch (e) {
    notify.error(e.message)
  }
}
</script>

<style>
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.btn-error {
  @apply bg-error text-on-error px-5 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all;
}

/* ── Blog preview: replicate site article-html styles ── */
.blog-preview-html h1 {
  font-weight: 700; font-size: 1.5rem; color: #0b2a4a;
  margin: 0 0 1rem; line-height: 1.3;
}
.blog-preview-html h2 {
  font-weight: 700; font-size: 1.2rem; color: #0b2a4a;
  padding-bottom: 0.5rem; border-bottom: 2px solid #f47a1f;
  margin: 2rem 0 1rem;
}
.blog-preview-html h2:first-child { margin-top: 0; }
.blog-preview-html h3 {
  font-weight: 700; font-size: 1.05rem; color: #0b2a4a;
  margin: 1.5rem 0 0.75rem;
}
.blog-preview-html h4 {
  font-weight: 600; font-size: 0.95rem; color: #0b2a4a;
  margin: 1.25rem 0 0.5rem;
}
.blog-preview-html p {
  font-size: 0.95rem; line-height: 1.8; color: #1f2937;
  margin: 0 0 1.1rem;
}
.blog-preview-html ul, .blog-preview-html ol {
  margin: 0 0 1.25rem; padding-left: 1.4rem;
}
.blog-preview-html ul { list-style: disc; }
.blog-preview-html ol { list-style: decimal; }
.blog-preview-html li { margin-bottom: 0.5rem; line-height: 1.7; font-size: 0.95rem; }
.blog-preview-html a { color: #f47a1f; text-decoration: underline; font-weight: 600; }
.blog-preview-html strong { font-weight: 700; color: #0b2a4a; }
.blog-preview-html em { font-style: italic; }
.blog-preview-html blockquote {
  background: #f8f8f6; border-left: 4px solid #f47a1f;
  border-radius: 0 0.75rem 0.75rem 0;
  padding: 0.85rem 1.25rem; margin: 1.5rem 0;
  font-style: italic; font-weight: 600; color: #0b2a4a;
}
.blog-preview-html blockquote p { margin: 0; }
.blog-preview-html img {
  border-radius: 0.75rem; max-width: 100%; height: auto;
  margin: 1.5rem 0; border: 1px solid #e6ecf2;
}
.blog-preview-html pre, .blog-preview-html code {
  background: #f1f5f9; border-radius: 0.5rem;
  font-family: 'Courier New', monospace; font-size: 0.85rem;
}
.blog-preview-html pre { padding: 1rem 1.25rem; overflow-x: auto; margin: 1rem 0; }
.blog-preview-html code { padding: 0.1rem 0.35rem; }
.blog-preview-html table {
  width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem;
}
.blog-preview-html th, .blog-preview-html td {
  padding: 0.6rem 0.85rem; border: 1px solid #e6ecf2; text-align: left;
}
.blog-preview-html th { background: #f8f9fa; font-weight: 700; color: #0b2a4a; }
</style>
