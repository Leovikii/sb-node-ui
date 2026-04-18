<template>
  <div class="max-w-md mx-auto mt-16 relative z-10">
    <AppleCard class="space-y-8 shadow-2xl">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-semibold text-[#f5f5f7]">配置 GitHub 仓库</h2>
        <p class="text-sm text-[#86868b]">关联私有仓库以管理订阅配置</p>
      </div>
      <form @submit.prevent="$emit('save')" class="space-y-6">
        <div class="space-y-4">
          <AppleInput :modelValue="ownerRepo" @update:modelValue="onOwnerRepoChange" placeholder="owner/repo (如: user/singbox-private)" />
          <AppleInput :modelValue="setupData.pat" @update:modelValue="update('pat', $event)" type="password" placeholder="GitHub PAT (repo 读写权限)" />
        </div>
        <div class="space-y-2">
          <AppleInput :modelValue="setupData.subToken" @update:modelValue="update('subToken', $event)" placeholder="自定义订阅 Token (如: my-sub)" />
          <p class="text-xs text-[#86868b] pl-1">用于生成订阅链接，仅支持字母、数字、下划线和连字符</p>
        </div>
        <AppleButton type="submit" :loading="loading" variant="primary" class="w-full !py-3">
          保存设置
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
import type { SetupData } from '../types';

const props = defineProps<{
  setupData: SetupData;
  loading: boolean;
}>();

const emit = defineEmits<{
  save: [];
  'update:setupData': [value: SetupData];
}>();

const ownerRepo = ref('');

watch(() => [props.setupData.owner, props.setupData.repo], ([o, r]) => {
  const combined = o && r ? `${o}/${r}` : o || r;
  if (combined !== ownerRepo.value) ownerRepo.value = combined;
}, { immediate: true });

function onOwnerRepoChange(value: string) {
  ownerRepo.value = value;
  const slash = value.indexOf('/');
  const owner = slash >= 0 ? value.slice(0, slash) : value;
  const repo = slash >= 0 ? value.slice(slash + 1) : '';
  emit('update:setupData', { ...props.setupData, owner, repo });
}

function update(key: keyof SetupData, value: string) {
  emit('update:setupData', { ...props.setupData, [key]: value });
}
</script>
