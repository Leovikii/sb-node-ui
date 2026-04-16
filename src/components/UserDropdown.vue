<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-2 scale-95"
  >
    <div v-if="visible" ref="panelRef" class="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-[#38383a] shadow-2xl glass p-5 space-y-4">
      <div class="flex items-center gap-3">
        <img v-if="user" :src="user.avatar_url" class="w-12 h-12 rounded-full border-2 border-[#38383a]" />
        <div>
          <div class="text-[#f5f5f7] font-medium">{{ user?.login }}</div>
          <div class="text-[#86868b] text-xs">已连接</div>
        </div>
      </div>

      <div class="space-y-3">
        <AppleInput :modelValue="config.owner" @update:modelValue="update('owner', $event)" placeholder="GitHub 用户名" />
        <AppleInput :modelValue="config.repo" @update:modelValue="update('repo', $event)" placeholder="私密仓库名" />
        <AppleInput :modelValue="config.pat" @update:modelValue="update('pat', $event)" type="password" placeholder="GitHub PAT" />
        <AppleInput :modelValue="config.gistId" @update:modelValue="update('gistId', $event)" placeholder="Secret Gist ID" />
      </div>

      <div class="flex items-center justify-between pt-1">
        <button @click="$emit('disconnect')" class="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer">
          断开连接
        </button>
        <AppleButton @click="$emit('save')" :loading="loading" variant="primary" class="px-5">
          保存
        </AppleButton>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import AppleInput from './AppleInput.vue';
import AppleButton from './AppleButton.vue';
import type { GithubConfig, GithubUser } from '../types';

const props = defineProps<{
  visible: boolean;
  user: GithubUser | null;
  config: GithubConfig;
  loading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [];
  disconnect: [];
  'update:config': [value: GithubConfig];
}>();

const panelRef = ref<HTMLElement>();

function update(key: keyof GithubConfig, value: string) {
  emit('update:config', { ...props.config, [key]: value });
}

function onClickOutside(e: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside, true));
</script>
