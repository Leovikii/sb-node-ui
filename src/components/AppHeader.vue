<template>
  <header class="flex items-center justify-between">
    <div class="space-y-1">
      <div class="flex items-center gap-3">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-[#f5f5f7]">Sing Sub</h1>
        <span class="px-2 py-0.5 rounded-md bg-[#2c2c2e] text-[#F596AA] text-xs font-mono border border-[#38383a]">{{ appVersion }}</span>
        <a v-if="hasUpdate" :href="updateUrl" target="_blank" class="px-2 py-0.5 rounded-md bg-[#F596AA]/20 text-[#F596AA] text-xs font-medium border border-[#F596AA]/30 hover:bg-[#F596AA]/30 transition-colors animate-pulse cursor-pointer">
          发现新版本 {{ latestVersion }}
        </a>
      </div>
      <p class="text-[#86868b] font-medium text-sm md:text-base">GitOps 多环境分发控制台</p>
    </div>

    <div v-if="user" class="flex items-center gap-6">
      <button @click="$emit('refresh')" :disabled="actionBusy" class="hidden md:flex items-center gap-2 text-sm font-medium text-[#86868b] hover:text-[#F596AA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        <span :class="{'animate-spin': actionBusy}">🔄</span>
        全局强制刷新
      </button>

      <div class="relative">
        <div class="flex items-center gap-3 cursor-pointer group" @click.stop="showDropdown = !showDropdown">
          <div class="hidden md:block text-right">
            <div class="text-[#f5f5f7] font-medium text-sm">{{ user.login }}</div>
            <div class="text-[#86868b] text-xs group-hover:text-[#F596AA] transition-colors">设置配置</div>
          </div>
          <img :src="user.avatar_url" class="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#38383a] group-hover:border-[#F596AA] transition-all duration-200" />
        </div>

        <UserDropdown
          :visible="showDropdown"
          :user="user"
          :config="config"
          :loading="loading"
          @close="showDropdown = false"
          @save="showDropdown = false; $emit('save')"
          @disconnect="showDropdown = false; $emit('disconnect')"
          @update:config="$emit('update:config', $event)"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserDropdown from './UserDropdown.vue';
import type { GithubUser, GithubConfig } from '../types';

defineProps<{
  user: GithubUser | null;
  appVersion: string;
  hasUpdate: boolean;
  latestVersion: string;
  updateUrl: string;
  actionBusy: boolean;
  config: GithubConfig;
  loading: boolean;
}>();

defineEmits<{
  refresh: [];
  save: [];
  disconnect: [];
  'update:config': [value: GithubConfig];
}>();

const showDropdown = ref(false);
</script>
