<script setup lang="ts">
/**
 * The player's course outline: progress at the top, then every module and
 * lesson with its completion state.
 *
 * The module holding the current lesson opens itself; the rest stay collapsed so
 * a 45-lesson course does not open as one long scroll.
 */
import type { ProgramDetail } from '~/composables/useProgramDetail'
import { lessonKey } from '~/composables/useCourseProgress'

const props = defineProps<{
  detail: ProgramDetail
  current: string
  isDone: (key: string) => boolean
  percent: number
  doneCount: number
  total: number
}>()

const emit = defineEmits<{ select: [string]; close: [] }>()

const { t } = useI18n()
const localePath = useLocalePath()

const currentModule = computed(() => Number(props.current.split('-')[0]) || 0)
const open = ref<number[]>([currentModule.value])

const isOpen = (i: number) => open.value.includes(i)
const toggle = (i: number) => {
  open.value = isOpen(i) ? open.value.filter((v) => v !== i) : [...open.value, i]
}

/** Following a lesson in another module should reveal that module. */
watch(currentModule, (index) => {
  if (!isOpen(index)) open.value = [...open.value, index]
})

/** A module is finished when every lesson in it is. */
function moduleDone(moduleIndex: number) {
  const mod = props.detail.modules[moduleIndex]
  return Boolean(mod?.items.every((_, i) => props.isDone(lessonKey(moduleIndex, i))))
}
</script>

<template>
  <aside class="side">
    <!-- ── Progress ── -->
    <div class="side__top">
      <div class="side__topbar">
        <NuxtLink :to="localePath(`/learning-hub/programs/${detail.program.slug}`)" class="side__back">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 6 9 12 15 18" />
          </svg>
          {{ t('learning.learn.back_to_course') }}
        </NuxtLink>

        <button type="button" class="side__x lg:hidden" :aria-label="t('learning.learn.close_outline')" @click="emit('close')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <p class="side__title">{{ detail.program.title }}</p>

      <div class="prog">
        <span class="prog__track"><span class="prog__fill" :style="{ width: `${percent}%` }" /></span>
        <span class="prog__num">{{ percent }}%</span>
      </div>
      <p class="side__count">{{ t('learning.learn.done_count', { done: doneCount, total }) }}</p>
    </div>

    <!-- ── Outline ── -->
    <nav class="tree">
      <div v-for="(mod, mi) in detail.modules" :key="mod.title" class="mod">
        <button type="button" class="mod__head" :aria-expanded="isOpen(mi)" @click="toggle(mi)">
          <span class="mod__tick" :class="{ 'mod__tick--on': moduleDone(mi) }">
            <svg v-if="moduleDone(mi)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="5 12.5 9.5 17 19 7" />
            </svg>
            <template v-else>{{ mi + 1 }}</template>
          </span>

          <span class="mod__text">
            <span class="mod__name">{{ mod.title }}</span>
            <span class="mod__meta">{{ t('learning.course.module_meta', { count: mod.items.length, minutes: mod.minutes }) }}</span>
          </span>

          <svg
            class="mod__caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
            :style="{ transform: isOpen(mi) ? 'rotate(180deg)' : '' }"
          >
            <polyline points="6 9.5 12 15.5 18 9.5" />
          </svg>
        </button>

        <ul v-show="isOpen(mi)" class="items">
          <li v-for="(item, ii) in mod.items" :key="`${mi}-${ii}`">
            <button
              type="button"
              class="item"
              :class="{
                'item--on': current === `${mi}-${ii}`,
                'item--done': isDone(`${mi}-${ii}`),
              }"
              @click="emit('select', `${mi}-${ii}`)"
            >
              <span class="item__tick">
                <svg v-if="isDone(`${mi}-${ii}`)" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <circle cx="12" cy="12" r="10" opacity="0.15" />
                  <polyline points="5 12.5 9.5 17 19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-else class="item__dot" />
              </span>

              <span class="item__body">
                <span class="item__title">{{ item.title }}</span>
                <span class="item__meta">
                  {{ t(`learning.learn.type_${item.type}`) }} · {{ t('learning.course.minutes', { n: item.minutes }) }}
                </span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: white;
  border-right: 1px solid var(--color-border);
}

/* ── Top ── */
.side__top {
  padding: 0.8rem 0.85rem;
  border-bottom: 1px solid var(--color-border);
}

.side__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.side__back {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-navy-light);
  transition: color 0.2s ease;
}
.side__back:hover {
  color: var(--color-accent);
}

.side__x {
  display: flex;
  color: var(--color-text-secondary);
}

.side__title {
  margin-top: 0.5rem;
  font-family: var(--font-heading);
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
  color: var(--color-navy);
}

.prog {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.prog__track {
  flex: 1;
  height: 5px;
  border-radius: 99px;
  background: #e6ecf2;
  overflow: hidden;
}

.prog__fill {
  display: block;
  height: 100%;
  border-radius: 99px;
  background: var(--color-success);
  transition: width 0.3s ease;
}

.prog__num {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  color: var(--color-navy);
}

.side__count {
  margin-top: 0.25rem;
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

/* ── Tree ── */
.tree {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.mod {
  border-bottom: 1px solid var(--color-border);
}

.mod__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  text-align: left;
  transition: background 0.2s ease;
}
.mod__head:hover {
  background: var(--color-off-white);
}

.mod__tick {
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: white;
  font-family: var(--font-heading);
  font-size: 9.5px;
  font-weight: 800;
  color: var(--color-text-secondary);
}
.mod__tick--on {
  border-color: var(--color-success);
  background: var(--color-success-container);
  color: #15803d;
}

.mod__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mod__name {
  font-family: var(--font-heading);
  font-size: 11.5px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--color-navy);
}

.mod__meta {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.mod__caret {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

/* ── Items ── */
.items {
  padding-bottom: 0.3rem;
  background: #fbfdff;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  width: 100%;
  padding: 0.42rem 0.85rem 0.42rem 1.4rem;
  text-align: left;
  border-left: 2px solid transparent;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.item:hover {
  background: #f2f7fc;
}

.item--on {
  background: #eaf2fb;
  border-left-color: var(--color-accent);
}
.item--on .item__title {
  color: var(--color-navy);
  font-weight: 700;
}

.item__tick {
  display: grid;
  place-items: center;
  width: 14px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--color-success);
}

.item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #c3d0de;
}

.item__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item__title {
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--color-text-primary);
}
.item--done .item__title {
  color: var(--color-text-secondary);
}

.item__meta {
  font-size: 9.5px;
  color: var(--color-text-secondary);
  opacity: 0.85;
}
</style>
