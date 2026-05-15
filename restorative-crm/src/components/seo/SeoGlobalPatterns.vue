<template>
  <div class="card p-5 lg:p-6 flex flex-col gap-4 h-full">
    <h3 class="font-bold text-on-surface text-sm">Global Meta Patterns</h3>
    <div class="space-y-3 flex-1">
      <div>
        <label class="label-xs block mb-1">Default Suffix</label>
        <input v-model="suffix" class="input-field" type="text" />
      </div>
      <div>
        <label class="label-xs block mb-1">Separator</label>
        <select v-model="separator" class="input-field">
          <option>Vertical Bar (|)</option>
          <option>En Dash (–)</option>
          <option>Bullet (•)</option>
        </select>
      </div>
    </div>
    <button @click="savePatterns" class="btn-primary w-full mt-2">Save Patterns</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const suffix = ref('| Restorative Clinical Group')
const separator = ref('Vertical Bar (|)')

const savePatterns = () => {
  // Mock save - in a real app this would call an API
  alert(`Saved! Suffix: "${suffix.value}", Separator: "${separator.value}"`)
}
</script>
