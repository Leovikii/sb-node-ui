<template>
  <input
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :placeholder="placeholder"
    class="rounded-xl border border-[#d2d2d7] bg-white/80 transition-all duration-200 outline-none py-3 px-4 w-full text-[14px] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  type?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>