<template>
  <div class="max-w-md mx-auto mt-16 relative z-10">
    <AppleCard class="space-y-8 shadow-2xl">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-semibold text-[#f5f5f7]">连接到云端仓库</h2>
        <p class="text-sm text-[#86868b]">请输入 GitHub 授权信息以加载配置</p>
      </div>
      <div class="space-y-4">
        <AppleInput :modelValue="config.owner" @update:modelValue="update('owner', $event)" placeholder="GitHub 用户名" />
        <AppleInput :modelValue="config.repo" @update:modelValue="update('repo', $event)" placeholder="私密仓库名 (如: singbox-private)" />
        <AppleInput :modelValue="config.pat" @update:modelValue="update('pat', $event)" type="password" placeholder="GitHub PAT" />
        <AppleInput :modelValue="config.gistId" @update:modelValue="update('gistId', $event)" placeholder="Secret Gist ID" />
      </div>
      <AppleButton @click="$emit('connect')" :loading="loading" variant="primary" class="w-full !py-3">
        验证并连接
      </AppleButton>
    </AppleCard>
  </div>
</template>

<script setup lang="ts">
import AppleCard from './AppleCard.vue';
import AppleInput from './AppleInput.vue';
import AppleButton from './AppleButton.vue';
import type { GithubConfig } from '../types';

const props = defineProps<{
  config: GithubConfig;
  loading: boolean;
}>();

const emit = defineEmits<{
  connect: [];
  'update:config': [value: GithubConfig];
}>();

function update(key: keyof GithubConfig, value: string) {
  emit('update:config', { ...props.config, [key]: value });
}
</script>
