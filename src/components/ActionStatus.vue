<template>
  <div v-if="state !== 'idle'" class="fixed bottom-6 right-6 z-40 bg-[#1c1c1e]/90 backdrop-blur-md border border-[#38383a] rounded-full px-5 py-3 shadow-2xl flex items-center gap-3 transition-all duration-300 transform scale-100">
    <div v-if="state === 'queued' || state === 'in_progress'" class="w-3 h-3 rounded-full bg-[#F596AA] animate-ping"></div>
    <div v-else-if="state === 'success'" class="w-3 h-3 rounded-full bg-[#34c759]"></div>
    <div v-else-if="state === 'failure'" class="w-3 h-3 rounded-full bg-[#ff6961]"></div>
    <span class="text-sm font-medium text-[#f5f5f7]">
      {{ state === 'queued' ? '⚡ 正在排队执行...' :
         state === 'in_progress' ? '⚙️ 节点拼装分发中...' :
         state === 'success' ? '✅ 分发成功' : '❌ 构建失败' }}
    </span>
    <a v-if="state === 'failure' && actionsUrl" :href="actionsUrl" target="_blank" class="ml-2 text-xs text-[#ff6961] underline">查看日志</a>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  state: 'idle' | 'queued' | 'in_progress' | 'success' | 'failure';
  actionsUrl?: string;
}>();
</script>
