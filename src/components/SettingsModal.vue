<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/80 backdrop-blur-md" @click.self="$emit('close')">
    <AppleCard class="w-full max-w-md space-y-6 shadow-2xl relative border border-[#38383a]">
      <button @click="$emit('close')" class="absolute top-6 right-6 text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer">✕</button>
      <h2 class="text-xl font-semibold text-[#f5f5f7]">仓库授权设置</h2>
      <div class="space-y-4 pt-2">
        <AppleInput :modelValue="config.owner" @update:modelValue="update('owner', $event)" placeholder="GitHub 用户名" />
        <AppleInput :modelValue="config.repo" @update:modelValue="update('repo', $event)" placeholder="私密仓库名" />
        <AppleInput :modelValue="config.pat" @update:modelValue="update('pat', $event)" type="password" placeholder="GitHub PAT" />
        <AppleInput :modelValue="config.gistId" @update:modelValue="update('gistId', $event)" placeholder="Secret Gist ID" />
      </div>
      <div class="flex gap-3 pt-2">
        <AppleButton @click="$emit('close')" variant="secondary" class="flex-1">取消</AppleButton>
        <AppleButton @click="$emit('save')" :loading="loading" variant="primary" class="flex-1">验证并保存</AppleButton>
      </div>
    </AppleCard>
  </div>
</template>

<script setup lang="ts">
import AppleCard from './AppleCard.vue';
import AppleInput from './AppleInput.vue';
import AppleButton from './AppleButton.vue';
import type { GithubConfig } from '../types';

const props = defineProps<{
  visible: boolean;
  config: GithubConfig;
  loading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
  'update:config': [value: GithubConfig];
}>();

function update(key: keyof GithubConfig, value: string) {
  emit('update:config', { ...props.config, [key]: value });
}
</script>
