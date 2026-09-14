<template>
  <main class="page">
    <PageHeader
      eyebrow="Học viện"
      title="Giảng viên"
      subtitle="Hồ sơ hiển thị trên trang chương trình, kèm khối lượng đang phụ trách."
    >
      <template #actions>
        <button type="button" class="btn-primary btn-sm" @click="openNew">
          <span class="material-symbols-outlined text-lg">add</span>
          Thêm giảng viên
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger">
      <article
        v-for="(ins, i) in all"
        :key="ins.id"
        class="card p-3.5"
        :style="{ '--i': i }"
      >
        <div class="flex items-start gap-3">
          <span
            class="w-11 h-11 rounded-lg bg-accent-soft text-accent-ink text-sm font-bold flex items-center justify-center shrink-0"
            aria-hidden="true"
          >{{ initials(ins.name) }}</span>
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-2">
              <div class="min-w-0">
                <h2 class="text-[0.9375rem] font-headline font-bold text-ink truncate">{{ ins.name }}</h2>
                <p class="meta truncate">{{ ins.role }}</p>
              </div>
              <StatusPill :status="ins.status" class="ml-auto shrink-0" />
            </div>
          </div>
        </div>

        <p class="text-xs text-ink-2 mt-2.5 line-clamp-2">{{ ins.bio }}</p>

        <div class="flex flex-wrap gap-1 mt-2.5">
          <span v-for="s in ins.specialties" :key="s" class="chip">{{ topicLabel(s) }}</span>
        </div>

        <dl class="grid grid-cols-3 gap-2 mt-3">
          <div class="panel-quiet px-2 py-1.5 text-center">
            <dt class="label-xs">Khoá</dt>
            <dd class="num text-sm font-bold text-ink">{{ programCount(ins.id) }}</dd>
          </div>
          <div class="panel-quiet px-2 py-1.5 text-center">
            <dt class="label-xs">Học viên</dt>
            <dd class="num text-sm font-bold text-ink">{{ ins.learners }}</dd>
          </div>
          <div class="panel-quiet px-2 py-1.5 text-center">
            <dt class="label-xs">Điểm</dt>
            <dd class="num text-sm font-bold text-ink">{{ ins.rating ? ins.rating.toFixed(1) : '—' }}</dd>
          </div>
        </dl>

        <div class="flex items-center gap-1.5 mt-3 pt-3 border-t border-line-soft">
          <button type="button" class="btn-outline btn-sm" @click="edit(ins)">
            <span class="material-symbols-outlined text-base">edit</span>
            Sửa hồ sơ
          </button>
          <a :href="`mailto:${ins.email}`" class="btn-ghost btn-sm">
            <span class="material-symbols-outlined text-base">mail</span>
            Email
          </a>
          <span class="meta ml-auto">Từ {{ date(ins.joinedAt) }}</span>
        </div>
      </article>
    </div>

    <SlideOver
      v-model:open="panelOpen"
      eyebrow="Giảng viên"
      :title="form.id ? 'Sửa hồ sơ giảng viên' : 'Thêm giảng viên'"
      size="md"
    >
      <div class="space-y-3.5">
        <FormRow label="Họ và tên" required>
          <template #default="{ id }">
            <input :id="id" v-model="form.name" type="text" class="input" data-autofocus />
          </template>
        </FormRow>
        <FormRow label="Vai trò" hint="Hiển thị dưới tên ở trang chương trình.">
          <template #default="{ id }">
            <input :id="id" v-model="form.role" type="text" class="input" />
          </template>
        </FormRow>
        <div class="grid grid-cols-2 gap-3">
          <FormRow label="Email">
            <template #default="{ id }">
              <input :id="id" v-model="form.email" type="email" class="input" />
            </template>
          </FormRow>
          <FormRow label="Điện thoại">
            <template #default="{ id }">
              <input :id="id" v-model="form.phone" type="tel" class="input num" />
            </template>
          </FormRow>
        </div>
        <FormRow label="Giới thiệu" hint="Hai đến ba câu, viết thật, không dùng từ sáo.">
          <template #default="{ id }">
            <textarea :id="id" v-model="form.bio" rows="3" class="input" />
          </template>
        </FormRow>
        <FormRow label="Chuyên môn">
          <template #default>
            <div class="flex flex-wrap gap-2">
              <label v-for="t in PROGRAM_TOPICS" :key="t.value" class="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  class="checkbox"
                  :checked="form.specialties.includes(t.value)"
                  @change="toggleSpecialty(t.value)"
                />
                <span class="text-xs font-semibold text-ink-2">{{ t.label }}</span>
              </label>
            </div>
          </template>
        </FormRow>
        <FormRow label="Trạng thái">
          <template #default="{ id }">
            <select :id="id" v-model="form.status" class="select">
              <option value="active">Đang hoạt động</option>
              <option value="onboarding">Đang kèm cặp</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </template>
        </FormRow>
      </div>

      <template #footer>
        <button v-if="form.id" type="button" class="btn-danger btn-sm mr-auto" @click="destroy">Xoá hồ sơ</button>
        <button type="button" class="btn-ghost" @click="panelOpen = false">Đóng</button>
        <button type="button" class="btn-primary" @click="submit">Lưu hồ sơ</button>
      </template>
    </SlideOver>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useResource } from '@/composables/useResource.js'
import { useNotify } from '@/composables/useNotify.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import SlideOver from '@/components/ui/SlideOver.vue'
import FormRow from '@/components/ui/FormRow.vue'
import { date, initials, labelOf } from '@/utils/format.js'
import { PROGRAM_TOPICS } from '@/data/mock/learning.js'

const notify = useNotify()
const { db, all, save, remove } = useResource('instructors', { searchFields: ['name', 'role'] })

const topicLabel = (value) => labelOf(PROGRAM_TOPICS, value, value)
const programCount = (id) => db.list('programs').filter((p) => p.instructorId === id).length

const panelOpen = ref(false)
const form = ref(blank())

function blank() {
  return {
    id: null, name: '', role: '', email: '', phone: '', bio: '',
    specialties: [], programs: 0, learners: 0, rating: 0, status: 'onboarding',
    joinedAt: new Date().toISOString().slice(0, 10),
  }
}

function openNew() {
  form.value = blank()
  panelOpen.value = true
}

function edit(row) {
  form.value = { ...row, specialties: [...(row.specialties || [])] }
  panelOpen.value = true
}

function toggleSpecialty(value) {
  const i = form.value.specialties.indexOf(value)
  if (i === -1) form.value.specialties.push(value)
  else form.value.specialties.splice(i, 1)
}

function submit() {
  if (!form.value.name.trim()) {
    notify.warn('Cần nhập tên giảng viên.')
    return
  }
  save({ ...form.value })
  panelOpen.value = false
  notify.success('Đã lưu hồ sơ giảng viên.')
}

function destroy() {
  const assigned = programCount(form.value.id)
  if (assigned) {
    notify.warn(`Còn ${assigned} chương trình đang gán cho người này. Chuyển sang giảng viên khác trước.`)
    return
  }
  remove(form.value.id)
  panelOpen.value = false
  notify.success('Đã xoá hồ sơ.')
}
</script>
