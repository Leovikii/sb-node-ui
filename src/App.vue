<template>
  <div class="max-w-7xl mx-auto space-y-10 p-6 md:p-12 pb-32">
    <AppHeader
      :user="user"
      :appVersion="APP_VERSION"
      :hasUpdate="hasUpdate"
      :latestVersion="latestVersion"
      :updateUrl="updateUrl"
      :settings="settings"
      :loading="loadingData"
      @save="handleSaveSettings"
      @disconnect="handleDisconnect"
      @update:settings="handleUpdateSettings"
    />

    <div v-if="isInitializing" class="flex justify-center items-center py-32 text-[#86868b]">
      <span class="animate-spin text-3xl">⚪</span>
    </div>

    <ConnectForm
      v-else-if="!settings"
      :setupData="setupData"
      :loading="loadingData"
      @update:setupData="Object.assign(setupData, $event)"
      @save="handleSetup"
    />

    <div v-else-if="stateData" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <ProfileEditor
        v-for="(profile, pIndex) in stateData.profiles"
        :key="pIndex"
        :profile="profile"
        :index="pIndex"
        :copyStatus="!!copyStatus[pIndex]"
        :expanded="expandedIndex === pIndex"
        @update:expanded="toggleExpand(pIndex)"
        @preview="handlePreview"
        @copyLink="handleCopyLink"
        @remove="removeProfile"
      />

      <div class="lg:col-span-2 flex gap-4 pt-4">
        <AppleButton @click="addProfile" variant="secondary" class="flex-1 py-4 text-base border border-[#38383a]">
          <Plus :size="16" class="inline -mt-0.5" /> 新增配置
        </AppleButton>
        <AppleButton @click="handleSave" :loading="savingData" variant="primary" class="flex-1 py-4 text-base relative overflow-hidden">
          <Upload :size="16" class="inline -mt-0.5" /> 保存分发
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

    <ConfirmModal
      :visible="showDisconnectConfirm"
      title="确认断开连接"
      message="此操作将清除服务器上保存的所有设置和缓存配置。下次需要重新配置仓库信息。"
      confirmText="确认断开"
      @confirm="confirmDisconnect"
      @cancel="showDisconnectConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import ConnectForm from './components/ConnectForm.vue';
import ProfileEditor from './components/ProfileEditor.vue';
import PreviewModal from './components/PreviewModal.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import AppleButton from './components/AppleButton.vue';
import { Plus, Upload } from 'lucide-vue-next';
import { useApi } from './composables/useApi';
import type { SetupData, UserSettings, StateData, Profile } from './types';

const APP_VERSION = 'v2.0.0';
const hasUpdate = ref(false);
const latestVersion = ref('');
const updateUrl = ref('');

const setupData = reactive<SetupData>({ owner: '', repo: '', pat: '', subToken: '' });
const stateData = ref<StateData | null>(null);
const fileSha = ref<string | null>(null);
const loadingData = ref(false);
const savingData = ref(false);
const isInitializing = ref(true);
const copyStatus = ref<Record<number, boolean>>({});
const showPreviewModal = ref(false);
const showDisconnectConfirm = ref(false);
const expandedIndex = ref<number | null>(null);
const previewTitle = ref('');
const previewContent = ref('');
const previewLoading = ref(false);

const { user, settings, getIdentity, getSettings, saveSettings, deleteSettings, getState, saveState, getPreview } = useApi();

function normalizeProfiles(state: StateData): StateData {
  state.profiles.forEach((p: Profile) => {
    if (!p.rules) p.rules = [];
    if (!p.inboundRules) p.inboundRules = [];
    if (!p.note) p.note = '';
  });
  return state;
}

onMounted(async () => {
  const identity = await getIdentity();
  if (identity) {
    try {
      const s = await getSettings();
      if (s) {
        const data = await getState();
        stateData.value = normalizeProfiles(data.state);
        fileSha.value = data.sha;
      }
    } catch { /* settings not configured yet */ }
  }
  isInitializing.value = false;

  try {
    const res = await fetch('https://api.github.com/repos/Leovikii/Sing-Sub/releases/latest');
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

async function handleSetup() {
  if (!setupData.owner || !setupData.repo || !setupData.pat || !setupData.subToken) return;
  loadingData.value = true;
  try {
    await saveSettings(setupData);
    const data = await getState();
    stateData.value = normalizeProfiles(data.state);
    fileSha.value = data.sha;
    setupData.pat = '';
  } catch (e: any) {
    alert('设置失败: ' + e.message);
  } finally {
    loadingData.value = false;
  }
}

async function handleSaveSettings(newSettings: SetupData) {
  loadingData.value = true;
  try {
    await saveSettings(newSettings);
    const data = await getState();
    stateData.value = normalizeProfiles(data.state);
    fileSha.value = data.sha;
  } catch (e: any) {
    alert('更新设置失败: ' + e.message);
  } finally {
    loadingData.value = false;
  }
}

function handleUpdateSettings(partial: Partial<UserSettings>) {
  if (settings.value) {
    Object.assign(settings.value, partial);
  }
}

function handleDisconnect() {
  showDisconnectConfirm.value = true;
}

async function confirmDisconnect() {
  showDisconnectConfirm.value = false;
  await deleteSettings();
  stateData.value = null;
  fileSha.value = null;
}

async function handleSave() {
  if (!stateData.value) return;
  savingData.value = true;
  try {
    const data = await saveState(stateData.value, fileSha.value);
    fileSha.value = data.sha;
  } catch (e: any) {
    alert('保存失败: ' + e.message);
  } finally {
    savingData.value = false;
  }
}

async function handlePreview(name: string) {
  previewTitle.value = name;
  previewContent.value = '';
  showPreviewModal.value = true;
  previewLoading.value = true;
  try {
    previewContent.value = await getPreview(name);
  } catch {
    previewContent.value = '构建预览失败，请检查配置。';
  } finally {
    previewLoading.value = false;
  }
}

async function handleCopyLink(name: string, index: number) {
  const token = settings.value?.subToken;
  if (!token) return;
  const url = `${window.location.origin}/sub/${token}/${name}.json`;
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
    name: 'new_env', note: '', templateUrl: '', inboundsPath: '', outboundsPath: '',
    rules: [], inboundRules: [],
  });
  expandedIndex.value = stateData.value.profiles.length - 1;
}

function removeProfile(index: number) {
  if (!stateData.value) return;
  if (expandedIndex.value === index) expandedIndex.value = null;
  else if (expandedIndex.value !== null && expandedIndex.value > index) expandedIndex.value--;
  stateData.value.profiles.splice(index, 1);
}

function toggleExpand(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index;
}
</script>
