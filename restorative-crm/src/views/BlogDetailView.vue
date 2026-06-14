<template>
  <main class="p-4 lg:p-8 max-w-4xl mx-auto w-full">
    <!-- Top bar -->
    <div class="flex items-center justify-between gap-3 mb-6">
      <button @click="goBack" class="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Back to posts
      </button>
      <div v-if="post" class="flex items-center gap-2">
        <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="post.status === 'published' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-600'">
          {{ post.status === 'published' ? 'Published' : 'Draft' }}
        </span>
        <button @click="editPost" class="btn-primary !py-2 !text-xs flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">edit</span> Edit
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="card p-12 text-center text-on-surface-variant">
      <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>
    <div v-else-if="error || !post" class="card p-12 text-center">
      <span class="material-symbols-outlined text-4xl text-outline mb-3 block">article</span>
      <p class="text-sm text-on-surface-variant">{{ error || 'Post not found.' }}</p>
      <button @click="goBack" class="btn-primary !text-xs mt-4 inline-flex items-center gap-1.5">
        <span class="material-symbols-outlined text-sm">arrow_back</span> Back to posts
      </button>
    </div>

    <!-- Post -->
    <article v-else class="card overflow-hidden">
      <!-- Cover -->
      <div v-if="post.image" class="w-full aspect-[16/7] bg-surface-container overflow-hidden">
        <img :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
      </div>

      <div class="p-5 lg:p-8">
        <!-- Category -->
        <span v-if="post.category" class="inline-block bg-secondary-container/30 text-on-secondary-container px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3">
          {{ post.category }}
        </span>

        <!-- Title -->
        <h1 class="text-2xl lg:text-3xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">{{ post.title }}</h1>

        <!-- Meta -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-on-surface-variant">
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">person</span>{{ post.author }}</span>
          <span v-if="post.date" class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_today</span>{{ post.date }}</span>
          <span v-if="post.readTime" class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span>{{ post.readTime }}</span>
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">visibility</span>{{ post.views }} views</span>
        </div>

        <!-- Excerpt -->
        <p v-if="post.excerpt" class="mt-5 text-base text-on-surface-variant leading-relaxed border-l-4 border-primary/30 pl-4">{{ post.excerpt }}</p>

        <!-- Tags -->
        <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mt-4">
          <span v-for="tag in post.tags" :key="tag" class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">#{{ tag }}</span>
        </div>

        <hr class="my-6 border-outline-variant/20" />

        <!-- Content sections -->
        <div class="space-y-6">
          <section v-for="(s, i) in post.sections" :key="s.id || i">
            <h2 v-if="s.title" class="text-lg font-headline font-bold text-on-surface mb-2">{{ s.title }}</h2>
            <div v-if="s.text" class="prose-content text-sm text-on-surface leading-relaxed" v-html="s.text"></div>
            <blockquote v-if="s.quote" class="border-l-4 border-primary pl-4 italic text-on-surface-variant my-3">{{ s.quote }}</blockquote>
            <ul v-if="s.bullets?.length" class="list-disc pl-5 space-y-1 text-sm text-on-surface">
              <li v-for="(b, bi) in s.bullets" :key="bi">{{ b }}</li>
            </ul>
            <ul v-if="s.items?.length" class="space-y-2 mt-2">
              <li v-for="(it, ii) in s.items" :key="ii" class="text-sm text-on-surface">
                <strong>{{ it.title }}</strong><span v-if="it.desc"> — {{ it.desc }}</span>
              </li>
            </ul>
            <div v-if="s.image" class="rounded-xl overflow-hidden mt-3 bg-surface-container">
              <img :src="s.image" :alt="s.title || 'section image'" class="w-full object-cover" />
            </div>
          </section>

          <p v-if="!post.sections || post.sections.length === 0" class="text-sm text-on-surface-variant italic">
            This post has no content yet.
          </p>
        </div>
      </div>
    </article>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchPostBySlug } from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    post.value = await fetchPostBySlug(route.params.slug)
  } catch (e) {
    error.value = e.message || 'Failed to load post.'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'Blog' })
}

function editPost() {
  router.push({ name: 'Blog', query: { edit: post.value.slug } })
}

onMounted(load)
</script>

<style scoped>
/* Style the CKEditor HTML injected via v-html (scoped → needs :deep). */
.prose-content :deep(h1),
.prose-content :deep(h2),
.prose-content :deep(h3) {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1d1b20);
  line-height: 1.3;
  margin: 1.2em 0 0.5em;
}
.prose-content :deep(h1) { font-size: 1.5rem; }
.prose-content :deep(h2) { font-size: 1.25rem; }
.prose-content :deep(h3) { font-size: 1.1rem; }
.prose-content :deep(p) { margin: 0 0 1em; line-height: 1.75; }
.prose-content :deep(ul),
.prose-content :deep(ol) { margin: 0 0 1em; padding-left: 1.5rem; }
.prose-content :deep(ul) { list-style: disc; }
.prose-content :deep(ol) { list-style: decimal; }
.prose-content :deep(li) { margin-bottom: 0.35em; }
.prose-content :deep(a) { color: var(--primary, #aa3bff); text-decoration: underline; }
.prose-content :deep(strong) { font-weight: 700; }
.prose-content :deep(em) { font-style: italic; }
.prose-content :deep(blockquote) {
  border-left: 4px solid var(--primary, #aa3bff);
  padding-left: 1rem;
  margin: 1em 0;
  font-style: italic;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
.prose-content :deep(img) { border-radius: 0.75rem; max-width: 100%; margin: 1em 0; }
.prose-content :deep(a):hover { opacity: 0.8; }
</style>
