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
        <AppleInput :modelValue="ownerRepo" @update:modelValue="onOwnerRepoChange" placeholder="owner/repo" />
        <AppleInput v-model="editPat" type="password" placeholder="更新 PAT (留空则不修改)" />
        <AppleInput v-model="editToken" placeholder="订阅 Token" />
      </div>

      <div class="flex items-center justify-between pt-1">
        <button @click="$emit('disconnect')" class="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer">
          断开连接
        </button>
        <AppleButton @click="handleSave" :loading="loading" variant="primary" class="px-5">
          保存
        </AppleButton>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import AppleInput from './AppleInput.vue';
import AppleButton from './AppleButton.vue';
import type { UserSettings, GithubUser } from '../types';

const props = defineProps<{
  visible: boolean;
  user: GithubUser | null;
  settings: UserSettings | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [value: { owner: string; repo: string; pat: string; subToken: string }];
  disconnect: [];
  'update:settings': [value: Partial<UserSettings>];
}>();

const panelRef = ref<HTMLElement>();
const ownerRepo = ref('');
const editPat = ref('');
const editToken = ref('');

watch(() => props.settings, (s) => {
  if (s) {
    ownerRepo.value = `${s.owner}/${s.repo}`;
    editToken.value = s.subToken;
  }
}, { immediate: true });

function onOwnerRepoChange(value: string) {
  ownerRepo.value = value;
}

function handleSave() {
  const slash = ownerRepo.value.indexOf('/');
  const owner = slash >= 0 ? ownerRepo.value.slice(0, slash) : ownerRepo.value;
  const repo = slash >= 0 ? ownerRepo.value.slice(slash + 1) : '';
  emit('save', { owner, repo, pat: editPat.value, subToken: editToken.value });
  editPat.value = '';
}

function onClickOutside(e: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    emit('close');
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside, true));
</script>
