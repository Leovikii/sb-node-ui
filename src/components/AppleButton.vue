<template>
  <button
    :class="[
      'rounded-[20px] px-6 py-2.5 font-medium text-[14px] transition-all duration-200 cursor-pointer border-none inline-flex justify-center items-center',
      variant === 'primary' ? 'bg-[#F596AA] text-[#121212] hover:bg-[#ffb1c2] hover:scale-[1.02] shadow-lg shadow-[#F596AA]/20' : 'bg-[#2c2c2e] text-[#f5f5f7] hover:bg-[#3a3a3c]',
      { 'opacity-70 cursor-not-allowed': loading }
    ]"
    :disabled="loading"
    :type="type"
  >
    <span v-if="loading" class="mr-2 animate-spin">⚪</span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  loading: false,
  type: 'button'
});
</script>