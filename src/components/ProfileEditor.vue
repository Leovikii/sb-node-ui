<template>
  <div class="glass transition-all duration-300">
    <!-- Collapsed Header -->
    <div @click="isExpanded = !isExpanded" class="p-5 cursor-pointer select-none space-y-2">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-lg font-semibold text-[#f5f5f7] truncate">{{ profile.name || 'untitled' }}</span>
          <span class="text-[#86868b] font-mono text-sm select-none">.json</span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button @click.stop="$emit('preview', profile.name)" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] bg-[#2c2c2e] border border-[#38383a] hover:border-[#86868b] transition-colors cursor-pointer">
            <Eye :size="14" />预览
          </button>
          <button @click.stop="$emit('copyLink', profile.name, index)" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] bg-[#2c2c2e] border border-[#38383a] hover:border-[#86868b] transition-colors cursor-pointer">
            <component :is="copyStatus ? Check : Link" :size="14" />{{ copyStatus ? '已复制' : '复制链接' }}
          </button>
          <button @click.stop="$emit('remove', index)" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#ff6961] hover:text-[#ff3b30] bg-[#ff6961]/10 border border-[#ff6961]/20 hover:border-[#ff6961]/40 transition-colors cursor-pointer">
            <Trash2 :size="14" />移除
          </button>
          <div :class="['w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] border border-[#38383a] transition-transform duration-200 ml-1', isExpanded ? 'rotate-180' : '']">
            <span class="text-[#86868b] text-base leading-none">▾</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span v-if="profile.note" class="text-[#86868b] text-xs truncate">{{ profile.note }}</span>
        <span v-else class="text-[#48484a] text-xs italic">无备注</span>
        <div class="flex-1"></div>
        <span class="bg-[#2c2c2e] text-[#86868b] text-xs rounded-full px-2.5 py-1">入站 {{ inboundCount }}</span>
        <span class="bg-[#2c2c2e] text-[#86868b] text-xs rounded-full px-2.5 py-1">出站 {{ outboundCount }}</span>
      </div>

      <div class="flex md:hidden items-center gap-2 pt-1">
        <button @click.stop="$emit('preview', profile.name)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] bg-[#2c2c2e] border border-[#38383a] hover:border-[#86868b] transition-colors cursor-pointer">
          <Eye :size="14" />预览
        </button>
        <button @click.stop="$emit('copyLink', profile.name, index)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#f5f5f7] bg-[#2c2c2e] border border-[#38383a] hover:border-[#86868b] transition-colors cursor-pointer">
          <component :is="copyStatus ? Check : Link" :size="14" />{{ copyStatus ? '已复制' : '复制链接' }}
        </button>
        <button @click.stop="$emit('remove', index)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#ff6961] hover:text-[#ff3b30] bg-[#ff6961]/10 border border-[#ff6961]/20 hover:border-[#ff6961]/40 transition-colors cursor-pointer">
          <Trash2 :size="14" />移除
        </button>
      </div>
    </div>

    <!-- Expanded Body -->
    <div :class="['expand-grid', { 'is-open': isExpanded }]">
      <div class="expand-content">
        <div class="px-5 pb-6 space-y-6">
          <!-- Profile name -->
          <div class="border-b border-[#38383a] pb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-[#86868b] block">生成产物文件名 (Profile Name)</label>
                <div class="flex items-center bg-[#1c1c1e]/80 border border-[#38383a] rounded-xl px-4 py-2 w-full focus-within:border-[#F596AA] focus-within:ring-4 focus-within:ring-[#F596AA]/20 transition-all duration-200">
                  <input v-model="profile.name" class="bg-transparent text-[#f5f5f7] outline-none text-xl font-bold w-full" placeholder="例如: la" />
                  <span class="text-[#86868b] font-mono text-lg ml-2 select-none">.json</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-[#86868b] block">备注</label>
                <AppleInput :modelValue="profile.note ?? ''" @update:modelValue="profile.note = $event" placeholder="例如: 洛杉矶节点" />
              </div>
            </div>
          </div>

          <!-- Template URL and file paths -->
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

          <!-- Rules tabs -->
          <div class="border border-[#38383a] rounded-2xl overflow-hidden bg-[#1c1c1e]/50">
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

            <div class="p-4 sm:p-5">
              <!-- Inbound rules -->
              <div v-show="activeTab === 'inbound'" class="space-y-4">
                <div v-for="(irule, irIndex) in profile.inboundRules" :key="irIndex" class="flex flex-col sm:flex-row gap-3 bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] shadow-sm">
                  <div class="flex flex-col sm:flex-row gap-3 flex-1">
                    <AppleInput v-model="irule.include" placeholder="包含关键字" class="flex-1" />
                    <AppleInput v-model="irule.exclude" placeholder="排除关键字" class="flex-1" />
                  </div>
                  <button @click="profile.inboundRules.splice(irIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff6961]/10 text-[#ff6961] hover:bg-[#ff6961]/20 transition shrink-0 self-end sm:self-center cursor-pointer">✕</button>
                </div>
                <AppleButton @click="profile.inboundRules.push({ include: '', exclude: '' })" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-[#38383a] bg-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]">
                  + 添加入站筛选规则
                </AppleButton>
              </div>

              <!-- Outbound rules -->
              <div v-show="activeTab === 'outbound'" class="space-y-4">
                <div v-for="(rule, rIndex) in profile.rules" :key="rIndex" class="flex flex-col sm:flex-row gap-3 bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] shadow-sm">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <AppleInput v-model="rule.group" placeholder="分组 Tag" />
                    <AppleInput v-model="rule.include" placeholder="包含关键字" />
                    <AppleInput v-model="rule.exclude" placeholder="排除关键字" />
                  </div>
                  <button @click="profile.rules.splice(rIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff6961]/10 text-[#ff6961] hover:bg-[#ff6961]/20 transition shrink-0 self-end sm:self-center cursor-pointer">✕</button>
                </div>
                <AppleButton @click="profile.rules.push({ group: '', include: '', exclude: '' })" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-[#38383a] bg-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]">
                  + 添加出站分组规则
                </AppleButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Eye, Link, Check, Trash2 } from 'lucide-vue-next';
import AppleInput from './AppleInput.vue';
import AppleButton from './AppleButton.vue';
import type { Profile } from '../types';

const props = defineProps<{
  profile: Profile;
  index: number;
  copyStatus: boolean;
  expanded?: boolean;
}>();

const emit = defineEmits<{
  preview: [name: string];
  copyLink: [name: string, index: number];
  remove: [index: number];
  'update:expanded': [value: boolean];
}>();

const isExpanded = computed({
  get: () => props.expanded ?? false,
  set: (v) => emit('update:expanded', v),
});

const activeTab = ref<'inbound' | 'outbound'>('inbound');
const inboundCount = computed(() => props.profile.inboundRules.length);
const outboundCount = computed(() => props.profile.rules.length);
</script>
