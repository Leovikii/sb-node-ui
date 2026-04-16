<template>
  <div class="max-w-5xl mx-auto space-y-10 p-6 md:p-12">
    <header class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-[#f5f5f7]">Sing-Box</h1>
        <p class="text-[#86868b] font-medium text-sm md:text-base">GitOps 多环境分发控制台</p>
      </div>
      
      <div v-if="isConnected && user" class="flex items-center gap-3 cursor-pointer group" @click="showSettings = true">
        <div class="hidden md:block text-right">
          <div class="text-[#f5f5f7] font-medium text-sm">{{ user.login }}</div>
          <div class="text-[#86868b] text-xs group-hover:text-[#F596AA] transition-colors">设置配置</div>
        </div>
        <img :src="user.avatar_url" class="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#38383a] group-hover:border-[#F596AA] transition-all duration-200" />
      </div>
    </header>

    <div v-if="isInitializing" class="flex justify-center items-center py-32 text-[#86868b]">
      <span class="animate-spin text-3xl">⚪</span>
    </div>

    <div v-else-if="!isConnected" class="max-w-md mx-auto mt-16 relative z-10">
      <AppleCard class="space-y-8 shadow-2xl">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-semibold text-[#f5f5f7]">连接到云端仓库</h2>
          <p class="text-sm text-[#86868b]">请输入 GitHub 授权信息以加载配置</p>
        </div>
        <div class="space-y-4">
          <AppleInput v-model="config.owner" placeholder="GitHub 用户名" />
          <AppleInput v-model="config.repo" placeholder="私密仓库名 (如: singbox-private)" />
          <AppleInput v-model="config.pat" type="password" placeholder="GitHub PAT" />
        </div>
        <AppleButton @click="loadRemoteState" :loading="loadingData" variant="primary" class="w-full !py-3">
          验证并连接
        </AppleButton>
      </AppleCard>
    </div>

    <div v-else-if="stateData" class="space-y-8">
      <div v-for="(profile, pIndex) in stateData.profiles" :key="pIndex" class="glass p-8 space-y-6 relative">
        <button @click="removeProfile(pIndex)" class="absolute top-6 right-8 text-sm text-[#ff6961] font-medium hover:underline cursor-pointer">移除该环境</button>
        
        <div class="border-b border-[#38383a] pb-6 mb-4">
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
              @click="activeTabs[pIndex] = 'inbound'"
              :class="['flex-1 py-3 text-sm font-medium transition-colors outline-none cursor-pointer', activeTabs[pIndex] === 'inbound' || !activeTabs[pIndex] ? 'text-[#F596AA] bg-[#2c2c2e] border-b-2 border-[#F596AA]' : 'text-[#86868b] hover:text-[#f5f5f7] border-b-2 border-transparent']"
            >入站节点规则筛选</button>
            <button
              @click="activeTabs[pIndex] = 'outbound'"
              :class="['flex-1 py-3 text-sm font-medium transition-colors outline-none cursor-pointer', activeTabs[pIndex] === 'outbound' ? 'text-[#F596AA] bg-[#2c2c2e] border-b-2 border-[#F596AA]' : 'text-[#86868b] hover:text-[#f5f5f7] border-b-2 border-transparent']"
            >出站节点分组映射</button>
          </div>

          <div class="p-5">
            <div v-show="activeTabs[pIndex] === 'inbound' || !activeTabs[pIndex]" class="space-y-4">
              <div v-for="(irule, irIndex) in profile.inboundRules" :key="irIndex" class="flex gap-3 items-center bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] shadow-sm">
                <AppleInput v-model="irule.include" placeholder="包含关键字 (匹配入站 Tag)" class="flex-1" />
                <AppleInput v-model="irule.exclude" placeholder="排除关键字 (匹配入站 Tag)" class="flex-1" />
                <button @click="profile.inboundRules.splice(irIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff6961]/10 text-[#ff6961] hover:bg-[#ff6961]/20 transition shrink-0 cursor-pointer">✕</button>
              </div>
              <AppleButton @click="addInboundRule(profile)" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-[#38383a] bg-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]">
                + 添加入站筛选规则
              </AppleButton>
            </div>

            <div v-show="activeTabs[pIndex] === 'outbound'" class="space-y-4">
              <div v-for="(rule, rIndex) in profile.rules" :key="rIndex" class="flex gap-3 items-center bg-[#2c2c2e] p-3 rounded-xl border border-[#38383a] shadow-sm">
                <AppleInput v-model="rule.group" placeholder="模板出站分组 Tag (如: MR)" class="flex-1" />
                <AppleInput v-model="rule.include" placeholder="包含关键字 (如: HK,SG)" class="flex-1" />
                <AppleInput v-model="rule.exclude" placeholder="排除关键字 (如: 0.1x)" class="flex-1" />
                <button @click="profile.rules.splice(rIndex, 1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-[#ff6961]/10 text-[#ff6961] hover:bg-[#ff6961]/20 transition shrink-0 cursor-pointer">✕</button>
              </div>
              <AppleButton @click="addRule(profile)" variant="secondary" class="w-full !py-2 text-sm border border-dashed border-[#38383a] bg-transparent text-[#86868b] hover:text-[#f5f5f7] hover:border-[#86868b]">
                + 添加出站分组规则
              </AppleButton>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 pt-4">
        <AppleButton @click="addProfile" variant="secondary" class="flex-1 py-4 text-base border border-[#38383a]">
          + 新增环境配置
        </AppleButton>
        <AppleButton @click="saveRemoteState" :loading="savingData" variant="primary" class="flex-1 py-4 text-base">
          保存并触发全局分发
        </AppleButton>
      </div>
    </div>

    <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/80 backdrop-blur-md" @click.self="showSettings = false">
      <AppleCard class="w-full max-w-md space-y-6 shadow-2xl relative border border-[#38383a]">
        <button @click="showSettings = false" class="absolute top-6 right-6 text-[#86868b] hover:text-[#f5f5f7] transition-colors cursor-pointer">✕</button>
        <h2 class="text-xl font-semibold text-[#f5f5f7]">仓库授权设置</h2>
        <div class="space-y-4 pt-2">
          <AppleInput v-model="config.owner" placeholder="GitHub 用户名" />
          <AppleInput v-model="config.repo" placeholder="私密仓库名" />
          <AppleInput v-model="config.pat" type="password" placeholder="GitHub PAT" />
        </div>
        <div class="flex gap-3 pt-2">
          <AppleButton @click="showSettings = false" variant="secondary" class="flex-1">取消</AppleButton>
          <AppleButton @click="loadRemoteState" :loading="loadingData" variant="primary" class="flex-1">验证并保存</AppleButton>
        </div>
      </AppleCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppleCard from './components/AppleCard.vue';
import AppleInput from './components/AppleInput.vue';
import AppleButton from './components/AppleButton.vue';
import type { GithubConfig, StateData, Profile, GithubUser } from './types';

const config = reactive<GithubConfig>({ owner: '', repo: '', pat: '' });
const stateData = ref<StateData | null>(null);
const user = ref<GithubUser | null>(null);
const fileSha = ref<string>('');
const loadingData = ref(false);
const savingData = ref(false);
const isConnected = ref(false);
const showSettings = ref(false);
const isInitializing = ref(true);
const activeTabs = ref<Record<number, 'outbound' | 'inbound'>>({});

onMounted(async () => {
  const saved = localStorage.getItem('singbox-gitops-auth');
  if (saved) {
    Object.assign(config, JSON.parse(saved));
    if (config.owner && config.repo && config.pat) {
      await loadRemoteState();
    }
  }
  isInitializing.value = false;
});

const encodeBase64 = (str: string) => window.btoa(unescape(encodeURIComponent(str)));
const decodeBase64 = (str: string) => decodeURIComponent(escape(window.atob(str)));

const fetchUserInfo = async () => {
  try {
    const res = await fetch(`https://api.github.com/users/${config.owner}`);
    if (res.ok) {
      user.value = await res.json();
    }
  } catch (e) {
    user.value = null;
  }
};

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
    await fetchUserInfo();
    const res = await apiCall('GET');
    fileSha.value = res.sha;
    const parsedData = JSON.parse(decodeBase64(res.content));
    parsedData.profiles.forEach((p: Profile) => {
      if (!p.rules) p.rules = [];
      if (!p.inboundRules) p.inboundRules = [];
    });
    stateData.value = parsedData;
    isConnected.value = true;
    showSettings.value = false;
  } catch (e) {
    alert('连接失败，请检查仓库信息和 PAT 权限');
    isConnected.value = false;
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