<template>
  <div class="glass p-8 space-y-6 relative group">
    <div class="absolute top-6 right-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button @click="$emit('preview', profile.name)" class="text-sm text-[#86868b] hover:text-[#f5f5f7] font-medium flex items-center gap-1 cursor-pointer">
        👁️ 预览
      </button>
      <button @click="$emit('copyLink', profile.name, index)" class="text-sm text-[#86868b] hover:text-[#f5f5f7] font-medium flex items-center gap-1 cursor-pointer w-20 justify-center">
        {{ copyStatus ? '已复制 ✅' : '🔗 复制链接' }}
      </button>
      <div class="w-px h-4 bg-[#38383a]"></div>
      <button @click="$emit('remove', index)" class="text-sm text-[#ff6961] hover:text-[#ff3b30] font-medium cursor-pointer">
        🗑️ 移除
      </button>
    </div>

    <div class="border-b border-[#38383a] pb-6 mb-4 mt-4">
      <label class="text-sm font-medium text-[#86868b] block mb-2">生成产物文件名 (Profile Name)</label>
      <div class="flex items-center bg-[#1c1c1e]/80 border border-[#38383a] rounded-xl px-4 py-2 w-full md:w-1/2 focus-within:border-[#F596AA] focus-within:ring-4 focus-within:ring-[#F596AA]/20 transition-all duration-200">
        <input v-model="profile.name" class="bg-transparent text-[#f5f5f7] outline-none text-xl font-bold w-full" placeholder="例如: la" />
        <span class="text-[#86868b] font-mono text-lg ml-2 select-none">.json</span>
      </div>
    </div>

    <div class="space-y-6">
      <div class="space-y-2">
        <label class="text-sm font-medium text-[#86868b]">公开模板 URL</label>
        <AppleInput v-model="profile.templateUrl" placeholder="https://raw.githubusercontent.com/..." />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-sm font-medium text-[#86868b]">入站节点文件路径</label>
          <AppleInput v-model="profile.inboundsPath" placeholder="例如: gates.json (留空不导入)" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-[#86868b]">出站节点文件路径</label>
          <AppleInput v-model="profile.outboundsPath" placeholder="例如: nodes.json (留空不导入)" />
        </div>
      </div>
    </div>

    <div class="mt-8 border border-[#38383a] rounded-2xl overflow-hidden bg-[#1c1c1e]/50">
      <div class="flex border-b border-[#38383a] bg-[#121212]/50">
        <button
          @click="activeTab = 'inbound'"
          :class="['flex-1 py-3 text-sm font-medium transition-colors outline-none cursor-pointer', activeTab === 'inbound' ? 'text-[#F596AA] bg-[#2c2c2e] border-b-2 border-[#F596AA]' : 'text-[#86868b] hover:text-[#f5f5f7] border-b-2 border-transparent']"
        >入站节点规则筛选</button>
        <button
          @click="activeTab = 'outbound'"
          :class="['flex-1 py-3 text-sm font-medium transition-colors outline-none cursor-pointer', activeTab === 'outbound' ? 'text-[#F596AA] bg-[#2c2c2e] border-b-2 border-[#F596AA]' : 'text-[#86868b] hover:text-[#f5f5f7] border-b-2 border-transparent']"
        >出站节点分组映射</button>
      </div>

      <div class="p-5">
        <div v-show="activeTab === 'inbound'" class="space-y-4">
          <div v-for="(irule, irIndex) in profile.inboundRules" :key="irIndex" class="flex gap-3 items-center bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] shadow-sm">
            <AppleInput v-model="irule.include" placeholder="包含关键字 (匹配入站 Tag)" class="flex-1" />
            <AppleInput v-model="irule.exclude" placeholder="排除关键字 (匹配入站 Tag)" class="flex-1" />
            <button @click="profile.inboundRules.splice(irIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff6961]/10 text-[#ff6961] hover:bg-[#ff6961]/20 transition shrink-0 cursor-pointer">✕</button>
          </div>
          <AppleButton @click="profile.inboundRules.push({ include: '', exclude: '' })" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-[#38383a] bg-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]">
            + 添加入站筛选规则
          </AppleButton>
        </div>

        <div v-show="activeTab === 'outbound'" class="space-y-4">
          <div v-for="(rule, rIndex) in profile.rules" :key="rIndex" class="flex gap-3 items-center bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] shadow-sm">
            <AppleInput v-model="rule.group" placeholder="模板出站分组 Tag (如: MR)" class="flex-1" />
            <AppleInput v-model="rule.include" placeholder="包含关键字 (如: HK,SG)" class="flex-1" />
            <AppleInput v-model="rule.exclude" placeholder="排除关键字 (如: 0.1x)" class="flex-1" />
            <button @click="profile.rules.splice(rIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff6961]/10 text-[#ff6961] hover:bg-[#ff6961]/20 transition shrink-0 cursor-pointer">✕</button>
          </div>
          <AppleButton @click="profile.rules.push({ group: '', include: '', exclude: '' })" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-[#38383a] bg-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]">
            + 添加出站分组规则
          </AppleButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppleInput from './AppleInput.vue';
import AppleButton from './AppleButton.vue';
import type { Profile } from '../types';

defineProps<{
  profile: Profile;
  index: number;
  copyStatus: boolean;
}>();

defineEmits<{
  preview: [name: string];
  copyLink: [name: string, index: number];
  remove: [index: number];
}>();

const activeTab = ref<'inbound' | 'outbound'>('inbound');
</script>
