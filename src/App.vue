<template>
  <div class="max-w-5xl mx-auto space-y-10 p-6 md:p-12 pb-32">
    <AppHeader
      :user="user"
      :appVersion="APP_VERSION"
      :hasUpdate="hasUpdate"
      :latestVersion="latestVersion"
      :updateUrl="updateUrl"
      :actionBusy="actionState === 'queued' || actionState === 'in_progress'"
      :config="config"
      :loading="loadingData"
      @refresh="handleRefresh"
      @save="handleConnect"
      @disconnect="handleDisconnect"
      @update:config="Object.assign(config, $event)"
    />

    <div v-if="isInitializing" class="flex justify-center items-center py-32 text-[#86868b]">
      <span class="animate-spin text-3xl">⚪</span>
    </div>

    <ConnectForm
      v-else-if="!isConnected"
      :config="config"
      :loading="loadingData"
      @update:config="Object.assign(config, $event)"
      @connect="handleConnect"
    />

    <div v-else-if="stateData" class="space-y-8">
      <ProfileEditor
        v-for="(profile, pIndex) in stateData.profiles"
        :key="pIndex"
        :profile="profile"
        :index="pIndex"
        :copyStatus="!!copyStatus[pIndex]"
        @preview="handlePreview"
        @copyLink="handleCopyLink"
        @remove="removeProfile"
      />

      <div class="flex gap-4 pt-4">
        <AppleButton @click="addProfile" variant="secondary" class="flex-1 py-4 text-base border border-[#38383a]">
          + 新增环境配置
        </AppleButton>
        <AppleButton @click="handleSave" :loading="savingData" variant="primary" class="flex-1 py-4 text-base relative overflow-hidden">
          保存并触发全局分发
        </AppleButton>
      </div>
    </div>

    <PreviewModal
      :visible="showPreviewModal"
      :title="previewTitle"
      :content="previewContent"
      :loading="previewLoading"
      @close="showPreviewModal = false"
    />

    <ActionStatus :state="actionState" :actionsUrl="actionsUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import ConnectForm from './components/ConnectForm.vue';
import ProfileEditor from './components/ProfileEditor.vue';
import PreviewModal from './components/PreviewModal.vue';
import ActionStatus from './components/ActionStatus.vue';
import AppleButton from './components/AppleButton.vue';
import { useApi } from './composables/useApi';
import { useActionPolling } from './composables/useActionPolling';
import type { GithubConfig, StateData, Profile } from './types';

const APP_VERSION = 'v1.0.0';
const hasUpdate = ref(false);
const latestVersion = ref('');
const updateUrl = ref('');

const config = reactive<GithubConfig>({ owner: '', repo: '', pat: '', gistId: '' });
const stateData = ref<StateData | null>(null);
const fileSha = ref('');
const loadingData = ref(false);
const savingData = ref(false);
const isInitializing = ref(true);
const copyStatus = ref<Record<number, boolean>>({});
const showPreviewModal = ref(false);
const previewTitle = ref('');
const previewContent = ref('');
const previewLoading = ref(false);

const { user, isConnected, connect, disconnect, restoreSession, saveState, refresh, getRuns, getGistPreview } = useApi();
const { actionState, startPolling, getLatestRunId } = useActionPolling(getRuns);

const actionsUrl = computed(() =>
  isConnected.value ? `https://github.com/${config.owner}/${config.repo}/actions` : ''
);

function normalizeProfiles(state: StateData): StateData {
  state.profiles.forEach((p: Profile) => {
    if (!p.rules) p.rules = [];
    if (!p.inboundRules) p.inboundRules = [];
  });
  return state;
}

onMounted(async () => {
  const session = await restoreSession();
  if (session) {
    stateData.value = normalizeProfiles(session.state);
    fileSha.value = session.sha;
    config.owner = session.owner;
    config.repo = session.repo;
    config.gistId = session.gistId;
  }
  isInitializing.value = false;

  try {
    const res = await fetch('https://api.github.com/repos/Leovikii/sb-node-ui/releases/latest');
    if (res.ok) {
      const data = await res.json();
      if (data.tag_name && data.tag_name !== APP_VERSION) {
        hasUpdate.value = true;
        latestVersion.value = data.tag_name;
        updateUrl.value = data.html_url;
      }
    }
  } catch { /* ignore */ }
});

async function handleDisconnect() {
  await disconnect();
  stateData.value = null;
  fileSha.value = '';
}

async function handleConnect() {
  if (!config.owner || !config.repo || !config.pat) return;
  loadingData.value = true;
  try {
    const data = await connect(config);
    stateData.value = normalizeProfiles(data.state);
    fileSha.value = data.sha;
    config.pat = '';
  } catch {
    alert('连接失败，请检查仓库信息和 PAT 权限');
  } finally {
    loadingData.value = false;
  }
}

async function handleSave() {
  if (!stateData.value) return;
  savingData.value = true;
  const prevRunId = await getLatestRunId();
  const oldSha = fileSha.value;
  try {
    const data = await saveState(stateData.value, fileSha.value);
    fileSha.value = data.sha;
    if (data.sha === oldSha) {
      alert('检测到配置未发生任何更改，未产生新提交。若需强制构建请点击【全局强制刷新】。');
      savingData.value = false;
      return;
    }
    startPolling(prevRunId);
  } catch (e: any) {
    alert('保存失败: ' + e.message);
  } finally {
    savingData.value = false;
  }
}

async function handleRefresh() {
  const prevRunId = await getLatestRunId();
  try {
    await refresh();
    startPolling(prevRunId);
  } catch (e: any) {
    alert('刷新指令发送失败: ' + e.message);
  }
}

async function handlePreview(name: string) {
  previewTitle.value = name;
  previewContent.value = '';
  showPreviewModal.value = true;
  previewLoading.value = true;
  try {
    previewContent.value = await getGistPreview(name);
  } catch {
    previewContent.value = '读取 Gist 失败，请检查 Gist ID 或网络。';
  } finally {
    previewLoading.value = false;
  }
}

async function handleCopyLink(name: string, index: number) {
  const url = `${window.location.origin}/sub/${config.gistId}/${name}.json`;
  try {
    await navigator.clipboard.writeText(url);
    copyStatus.value[index] = true;
    setTimeout(() => { copyStatus.value[index] = false; }, 2000);
  } catch {
    alert('复制失败');
  }
}

function addProfile() {
  if (!stateData.value) return;
  stateData.value.profiles.push({
    name: 'new_env', templateUrl: '', inboundsPath: '', outboundsPath: '',
    rules: [], inboundRules: [],
  });
}

function removeProfile(index: number) {
  if (!stateData.value) return;
  stateData.value.profiles.splice(index, 1);
}
</script>
