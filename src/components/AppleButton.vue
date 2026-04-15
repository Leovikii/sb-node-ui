<template>
  <button
    :class="[
      'rounded-[20px] px-6 py-2.5 font-medium text-[14px] transition-all duration-200 cursor-pointer border-none inline-flex justify-center items-center',
      variant === 'primary' ? 'bg-[#0071e3] text-white hover:bg-[#0077ed] hover:scale-[1.02]' : 'bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#d2d2d7]',
      { 'opacity-70 cursor-not-allowed': loading }
    ]"
    :disabled="loading"
  >
    <span v-if="loading" class="mr-2 animate-spin">⚪</span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}>(), {
  variant: 'primary',
  loading: false
});
</script>