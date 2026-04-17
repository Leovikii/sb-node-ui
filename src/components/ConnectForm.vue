<template>
  <div class="max-w-md mx-auto mt-16 relative z-10">
    <AppleCard class="space-y-8 shadow-2xl">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-semibold text-[#f5f5f7]">连接到云端仓库</h2>
        <p class="text-sm text-[#86868b]">请输入 GitHub 授权信息以加载配置</p>
      </div>
      <form @submit.prevent="$emit('connect')" class="space-y-6" autocomplete="on">
        <div class="space-y-4">
          <AppleInput :modelValue="ownerRepo" @update:modelValue="onOwnerRepoChange" placeholder="owner/repo (如: user/singbox-private)" name="username" autocomplete="username" />
          <AppleInput :modelValue="config.pat" @update:modelValue="update('pat', $event)" type="password" placeholder="GitHub PAT" name="password" autocomplete="current-password" />
        </div>
        <div class="space-y-2">
          <AppleInput :modelValue="config.gistId" @update:modelValue="update('gistId', $event)" placeholder="Secret Gist ID (可选，自动记忆)" />
          <p class="text-xs text-[#86868b] pl-1">首次连接需填写，之后自动关联</p>
        </div>
        <AppleButton type="submit" :loading="loading" variant="primary" class="w-full !py-3">
          验证并连接
        </AppleButton>
      </form>
    </AppleCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

const ownerRepo = ref('');

watch(() => [props.config.owner, props.config.repo], ([o, r]) => {
  const combined = o && r ? `${o}/${r}` : o || r;
  if (combined !== ownerRepo.value) ownerRepo.value = combined;
}, { immediate: true });

function onOwnerRepoChange(value: string) {
  ownerRepo.value = value;
  const slash = value.indexOf('/');
  const owner = slash >= 0 ? value.slice(0, slash) : value;
  const repo = slash >= 0 ? value.slice(slash + 1) : '';
  emit('update:config', { ...props.config, owner, repo });
}

function update(key: keyof GithubConfig, value: string) {
  emit('update:config', { ...props.config, [key]: value });
}
</script>
