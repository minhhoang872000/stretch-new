<script setup lang="ts">
import AppBadge from '~/components/ui/AppBadge.vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppInput from '~/components/ui/AppInput.vue'
import FormField from '~/components/ui/FormField.vue'
import { bitrateMbps, clock, mb } from '~/utils/format'
import type { Lesson, MediaAsset, QuizQuestion } from '~/types'

/**
 * Where a lesson's CONTENT is entered — one component for all three lesson types.
 *
 * It exists because the syllabus builder only sets a lesson's shell (title, type,
 * length) and the tabs beside it only listed sources; there was nowhere to type a
 * reading lesson's text at all. Rather than three editors that drift apart, the
 * type switch lives here and every screen that edits a lesson mounts this.
 *
 * The parent owns the lesson object; this only emits patches.
 */
const props = defineProps<{
  lesson: Lesson
  /** Matching upload, when there is one — drives the bitrate warning. */
  asset?: MediaAsset
  /** Shown above the fields so a stack of editors stays locatable. */
  caption?: string
}>()

const emit = defineEmits<{ update: [Partial<Lesson>] }>()

/** Above this, a phone on 4G buffers instead of playing. */
const BITRATE_CEILING = 4

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function addQuestion() {
  const question: QuizQuestion = {
    id: `q-${Date.now()}`,
    question: '',
    options: ['', '', '', ''],
    answer: 0,
  }
  emit('update', { quiz: [...(props.lesson.quiz ?? []), question] })
}

function patchQuestion(index: number, patch: Partial<QuizQuestion>) {
  const quiz = props.lesson.quiz ?? []
  emit('update', { quiz: quiz.map((q, i) => (i === index ? { ...q, ...patch } : q)) })
}

function removeQuestion(index: number) {
  const quiz = props.lesson.quiz ?? []
  emit('update', { quiz: quiz.filter((_, i) => i !== index) })
}

function setOption(index: number, optionIndex: number, value: string) {
  const quiz = props.lesson.quiz ?? []
  const options = [...quiz[index].options]
  options[optionIndex] = value
  patchQuestion(index, { options })
}

function addOption(index: number) {
  const quiz = props.lesson.quiz ?? []
  if (quiz[index].options.length >= LETTERS.length) return
  patchQuestion(index, { options: [...quiz[index].options, ''] })
}

function removeOption(index: number, optionIndex: number) {
  const quiz = props.lesson.quiz ?? []
  const question = quiz[index]
  if (question.options.length <= 2) return
  const options = question.options.filter((_, i) => i !== optionIndex)
  // Keep `answer` pointing at the same option, or clamp it if that one went away.
  const answer = optionIndex === question.answer ? 0 : question.answer > optionIndex ? question.answer - 1 : question.answer
  patchQuestion(index, { options, answer })
}

const readingLength = () => (props.lesson.body ?? '').trim().length
</script>

<template>
  <div class="min-w-0">
    <p v-if="props.caption" class="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-navy">
      <span class="min-w-0 truncate">{{ props.caption }}</span>
      <AppBadge v-if="props.lesson.free" tone="good">Học thử</AppBadge>
    </p>

    <!-- ══════ VIDEO ══════ -->
    <div v-if="props.lesson.type === 'video'" class="grid gap-3.5">
      <div class="grid gap-3.5 sm:grid-cols-2">
        <FormField label="Link YouTube" hint="Dán dạng nào cũng được: watch?v=, youtu.be, /embed/, /shorts/, hoặc ID">
          <AppInput
            :model-value="props.lesson.youtube ?? ''"
            mono
            placeholder="https://www.youtube.com/watch?v=…"
            @update:model-value="emit('update', { youtube: $event })"
          />
        </FormField>

        <FormField label="File trong bucket" hint="Đường dẫn object, ví dụ courses/<slug>/0-1.mp4">
          <AppInput
            :model-value="props.lesson.videoKey ?? ''"
            mono
            placeholder="courses/…/0-1.mp4"
            @update:model-value="emit('update', { videoKey: $event })"
          />
        </FormField>
      </div>

      <FormField
        label="Mô tả bài học"
        hint="Hiện dưới khung video trong trang học. Ghi những gì học viên nên chú ý ở bài này."
      >
        <textarea
          :value="props.lesson.body ?? ''"
          rows="4"
          placeholder="Ví dụ: chú ý góc đặt tay ở phút 3, và so sánh với ca ở bài trước…"
          class="t-fast w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed hover:border-line-strong focus:border-accent-dark focus:outline-none"
          @input="emit('update', { body: ($event.target as HTMLTextAreaElement).value })"
        />
      </FormField>

      <!-- The measured file, when there is one. This is the "2 GB cho 15 phút"
           case, caught before it reaches a learner on mobile data. -->
      <div
        v-if="props.asset"
        class="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg px-3 py-2.5 text-[11.5px]"
        :class="
          bitrateMbps(props.asset.sizeBytes, props.asset.durationSeconds) > BITRATE_CEILING
            ? 'bg-warn-bg text-warn'
            : 'bg-shell text-ink-soft'
        "
      >
        <span class="figure">{{ mb(props.asset.sizeBytes) }}</span>
        <span class="figure">{{ clock(props.asset.durationSeconds) }}</span>
        <span class="figure">{{ props.asset.width }}×{{ props.asset.height }}</span>
        <span class="figure font-semibold">
          {{ bitrateMbps(props.asset.sizeBytes, props.asset.durationSeconds) }} Mbps
        </span>
        <span
          v-if="bitrateMbps(props.asset.sizeBytes, props.asset.durationSeconds) > BITRATE_CEILING"
          class="inline-flex items-center gap-1 font-semibold"
        >
          <AppIcon name="warning" :size="12" :stroke-width="2.2" />
          Bitrate cao — nên encode lại 720p trước khi phát
        </span>
      </div>

      <p v-else-if="!props.lesson.youtube && !props.lesson.videoKey" class="flex items-center gap-1.5 text-[11.5px] text-warn">
        <AppIcon name="warning" :size="12" :stroke-width="2.2" />
        Bài này chưa có nguồn video — trang học sẽ hiện “chưa có video”.
      </p>
    </div>

    <!-- ══════ READING ══════ -->
    <div v-else-if="props.lesson.type === 'reading'" class="grid gap-2">
      <FormField
        label="Nội dung bài đọc"
        :hint="`Xuống dòng trống để tách đoạn. ${readingLength()} ký tự — bài đọc ${props.lesson.minutes} phút thường vào khoảng ${props.lesson.minutes * 900}–${props.lesson.minutes * 1300} ký tự.`"
      >
        <textarea
          :value="props.lesson.body ?? ''"
          rows="12"
          placeholder="Nhập nội dung học viên sẽ đọc ở bài này…"
          class="t-fast w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-[13.5px] leading-[1.75] hover:border-line-strong focus:border-accent-dark focus:outline-none"
          @input="emit('update', { body: ($event.target as HTMLTextAreaElement).value })"
        />
      </FormField>

      <p v-if="!readingLength()" class="flex items-center gap-1.5 text-[11.5px] text-warn">
        <AppIcon name="warning" :size="12" :stroke-width="2.2" />
        Bài đọc đang trống — trang học sẽ hiện một trang không có gì.
      </p>
    </div>

    <!-- ══════ QUIZ ══════ -->
    <div v-else class="grid gap-3">
      <div
        v-for="(question, qi) in props.lesson.quiz ?? []"
        :key="question.id"
        class="rounded-lg border border-line p-3.5"
      >
        <div class="flex items-start gap-2.5">
          <span class="figure mt-3 w-4 shrink-0 text-[11px] font-bold text-ink-muted">{{ qi + 1 }}</span>
          <div class="min-w-0 flex-1">
            <AppInput
              :model-value="question.question"
              placeholder="Nội dung câu hỏi"
              @update:model-value="patchQuestion(qi, { question: $event })"
            />
          </div>
          <button
            type="button"
            class="t-fast grid size-11 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad sm:size-10"
            @click="removeQuestion(qi)"
          >
            <AppIcon name="trash" :size="14" label="Xoá câu hỏi" />
          </button>
        </div>

        <p class="mt-3 mb-2 text-[11px] font-bold tracking-wide text-ink-muted uppercase">
          Đáp án — chọn ô tròn ở đáp án đúng
        </p>

        <div class="flex flex-col gap-2">
          <div v-for="(option, oi) in question.options" :key="`${question.id}-${oi}`" class="flex items-center gap-2.5">
            <input
              type="radio"
              class="size-4 shrink-0 accent-[var(--color-good)]"
              :name="question.id"
              :checked="question.answer === oi"
              :aria-label="`Đáp án đúng là ${LETTERS[oi]}`"
              @change="patchQuestion(qi, { answer: oi })"
            />
            <span class="figure w-4 shrink-0 text-[11px] text-ink-muted">{{ LETTERS[oi] }}</span>
            <AppInput
              :model-value="option"
              :placeholder="`Đáp án ${LETTERS[oi]}`"
              @update:model-value="setOption(qi, oi, $event)"
            />
            <button
              type="button"
              class="t-fast grid size-11 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-bad-bg hover:text-bad disabled:opacity-30 sm:size-10"
              :disabled="question.options.length <= 2"
              @click="removeOption(qi, oi)"
            >
              <AppIcon name="x" :size="13" label="Xoá đáp án" />
            </button>
          </div>
        </div>

        <div class="mt-2.5 flex flex-wrap items-center gap-2">
          <AppButton
            size="sm"
            variant="ghost"
            icon="plus"
            :disabled="question.options.length >= LETTERS.length"
            @click="addOption(qi)"
          >
            Thêm đáp án
          </AppButton>
          <span class="text-[11px] text-ink-muted">Đáp án đúng: {{ LETTERS[question.answer] }}</span>
        </div>
      </div>

      <p v-if="!props.lesson.quiz?.length" class="flex items-center gap-1.5 text-[11.5px] text-warn">
        <AppIcon name="warning" :size="12" :stroke-width="2.2" />
        Chưa có câu hỏi nào — trang học sẽ bỏ qua phần kiểm tra này.
      </p>

      <div><AppButton size="sm" icon="plus" @click="addQuestion">Thêm câu hỏi</AppButton></div>
    </div>
  </div>
</template>
