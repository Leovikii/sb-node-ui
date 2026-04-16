<template>
  <div class="max-w-5xl mx-auto space-y-10 p-6 md:p-12">
    <header class="text-center space-y-2">
      <h1 class="text-4xl font-bold tracking-tight">Sing-Box</h1>
      <p class="text-gray-500 font-medium">GitOps 多环境分发控制台</p>
    </header>

    <AppleCard class="space-y-6">
      <h2 class="text-xl font-semibold">1. GitHub 授权配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppleInput v-model="config.owner" placeholder="GitHub 用户名" />
        <AppleInput v-model="config.repo" placeholder="私密仓库名" />
        <AppleInput v-model="config.pat" type="password" placeholder="GitHub PAT" />
      </div>
      <AppleButton @click="loadRemoteState" :loading="loadingData" variant="secondary" class="w-full">
        连接并拉取云端状态
      </AppleButton>
    </AppleCard>

    <div v-if="stateData" class="space-y-8">
      <div v-for="(profile, pIndex) in stateData.profiles" :key="pIndex" class="glass p-8 space-y-6 relative">
        <button @click="removeProfile(pIndex)" class="absolute top-6 right-8 text-sm text-red-500 font-medium hover:underline">移除该环境</button>
        <h2 class="text-2xl font-semibold border-b border-gray-200 pb-4 mb-4">
          <input v-model="profile.name" class="bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-colors w-full" placeholder="环境命名 (如: momo)" />
        </h2>
        
        <div class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-500">公开模板 URL</label>
            <AppleInput v-model="profile.templateUrl" placeholder="https://raw.githubusercontent.com/..." />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">入站节点文件路径</label>
              <AppleInput v-model="profile.inboundsPath" placeholder="例如: gates.json (留空不导入)" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-500">出站节点文件路径</label>
              <AppleInput v-model="profile.outboundsPath" placeholder="例如: nodes.json (留空不导入)" />
            </div>
          </div>
        </div>

        <div class="mt-8 border border-gray-200 rounded-2xl overflow-hidden bg-white/50">
          <div class="flex border-b border-gray-200 bg-gray-50/50">
            <button
              @click="activeTabs[pIndex] = 'outbound'"
              :class="['flex-1 py-3 text-sm font-medium transition-colors outline-none cursor-pointer', activeTabs[pIndex] !== 'inbound' ? 'text-[#0071e3] bg-white border-b-2 border-[#0071e3]' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent']"
            >出站节点分组映射</button>
            <button
              @click="activeTabs[pIndex] = 'inbound'"
              :class="['flex-1 py-3 text-sm font-medium transition-colors outline-none cursor-pointer', activeTabs[pIndex] === 'inbound' ? 'text-[#0071e3] bg-white border-b-2 border-[#0071e3]' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent']"
            >入站节点规则筛选</button>
          </div>

          <div class="p-5">
            <div v-show="activeTabs[pIndex] !== 'inbound'" class="space-y-4">
              <div v-for="(rule, rIndex) in profile.rules" :key="rIndex" class="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <AppleInput v-model="rule.group" placeholder="Selector Tag" class="flex-1" />
                <AppleInput v-model="rule.include" placeholder="包含关键字" class="flex-1" />
                <AppleInput v-model="rule.exclude" placeholder="排除关键字" class="flex-1" />
                <button @click="profile.rules.splice(rIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition shrink-0 cursor-pointer">✕</button>
              </div>
              <AppleButton @click="addRule(profile)" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-gray-300 bg-transparent">
                + 添加出站分组规则
              </AppleButton>
            </div>

            <div v-show="activeTabs[pIndex] === 'inbound'" class="space-y-4">
              <div v-for="(irule, irIndex) in profile.inboundRules" :key="irIndex" class="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <AppleInput v-model="irule.include" placeholder="包含关键字 (匹配 tag)" class="flex-1" />
                <AppleInput v-model="irule.exclude" placeholder="排除关键字" class="flex-1" />
                <button @click="profile.inboundRules.splice(irIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition shrink-0 cursor-pointer">✕</button>
              </div>
              <AppleButton @click="addInboundRule(profile)" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-gray-300 bg-transparent">
                + 添加入站筛选规则
              </AppleButton>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 pt-4">
        <AppleButton @click="addProfile" variant="secondary" class="flex-1 py-4 text-base">
          + 新增环境配置
        </AppleButton>
        <AppleButton @click="saveRemoteState" :loading="savingData" variant="primary" class="flex-1 py-4 text-base shadow-lg shadow-blue-500/20">
          保存并触发全局分发
        </AppleButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppleCard from './components/AppleCard.vue';
import AppleInput from './components/AppleInput.vue';
import AppleButton from './components/AppleButton.vue';
import type { GithubConfig, StateData, Profile } from './types';

const config = reactive<GithubConfig>({ owner: '', repo: '', pat: '' });
const stateData = ref<StateData | null>(null);
const fileSha = ref<string>('');
const loadingData = ref(false);
const savingData = ref(false);
const activeTabs = ref<Record<number, 'outbound' | 'inbound'>>({});

onMounted(() => {
  const saved = localStorage.getItem('singbox-gitops-auth');
  if (saved) {
    Object.assign(config, JSON.parse(saved));
  }
});

const encodeBase64 = (str: string) => window.btoa(unescape(encodeURIComponent(str)));
const decodeBase64 = (str: string) => decodeURIComponent(escape(window.atob(str)));

const apiCall = async (method: string, body: any = null) => {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/rules.json`;
  const opts: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${config.pat}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

const loadRemoteState = async () => {
  if (!config.owner || !config.repo || !config.pat) return;
  loadingData.value = true;
  try {
    localStorage.setItem('singbox-gitops-auth', JSON.stringify(config));
    const res = await apiCall('GET');
    fileSha.value = res.sha;
    const parsedData = JSON.parse(decodeBase64(res.content));
    parsedData.profiles.forEach((p: Profile) => {
      if (!p.rules) p.rules = [];
      if (!p.inboundRules) p.inboundRules = [];
    });
    stateData.value = parsedData;
  } catch (e) {
    stateData.value = { profiles: [] };
  } finally {
    loadingData.value = false;
  }
};

const saveRemoteState = async () => {
  if (!stateData.value) return;
  savingData.value = true;
  try {
    const payload = {
      message: 'Deploy: update via WebUI',
      content: encodeBase64(JSON.stringify(stateData.value, null, 2)),
      sha: fileSha.value || undefined
    };
    const res = await apiCall('PUT', payload);
    fileSha.value = res.content.sha;
    alert('指令已下发至 GitHub Actions。产物即将自动推送到 Secret Gist。');
  } catch (e) {
    alert('保存失败');
  } finally {
    savingData.value = false;
  }
};

const addProfile = () => {
  if (!stateData.value) return;
  stateData.value.profiles.push({
    name: 'new_env',
    templateUrl: '',
    inboundsPath: '',
    outboundsPath: '',
    rules: [],
    inboundRules: []
  });
};

const removeProfile = (index: number) => {
  if (!stateData.value) return;
  stateData.value.profiles.splice(index, 1);
  delete activeTabs.value[index];
};

const addRule = (profile: Profile) => {
  profile.rules.push({ group: '', include: '', exclude: '' });
};

const addInboundRule = (profile: Profile) => {
  profile.inboundRules.push({ include: '', exclude: '' });
};
</script>