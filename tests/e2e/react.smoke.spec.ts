import { expect, test, type Page, type Request } from '@playwright/test';

const settings = {
  subToken: 'subscription-token',
  userLogin: 'sing-sub-user',
  userAvatar: '',
};

interface ReactApiMock {
  authenticated: boolean;
  connected: boolean;
  loginRequests: Request[];
  logoutRequests: Request[];
  settingsRequests: Request[];
  connectionRequests: Request[];
  compilerRequests: Request[];
  fileRequests: Request[];
  assets: Array<{ path: string; note: string }>;
  rulesets: Array<{ path: string; note: string }>;
  contents: Record<string, string>;
  syncRequests: Request[];
  stateRequests: Request[];
  profiles: Array<Record<string, unknown>>;
  revision: number;
  buildStatus: 'none' | 'failed' | 'ready';
  buildRequests: Request[];
}

async function mockReactApi(page: Page, setupRequired = true): Promise<ReactApiMock> {
  await page.addInitScript(() => {
    localStorage.setItem('sing-sub.locale', 'zh-CN');
    localStorage.setItem('sing-sub.appearance', 'light');
  });

  const state: ReactApiMock = {
    authenticated: false,
    connected: false,
    loginRequests: [],
    logoutRequests: [],
    settingsRequests: [],
    connectionRequests: [],
    compilerRequests: [],
    fileRequests: [],
    assets: [],
    rulesets: [],
    contents: {},
    syncRequests: [],
    stateRequests: [],
    profiles: [],
    revision: 1,
    buildStatus: 'none',
    buildRequests: [],
  };

  const apiPattern = new URL('/api/**', process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173').toString();
  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    const respond = (data: unknown) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });

    if (pathname === '/api/bootstrap') {
      await respond(state.authenticated
        ? { settings, state: { profiles: state.profiles }, revision: `revision-${state.revision}`, setupRequired: false }
        : { settings: null, setupRequired });
      return;
    }

    if (pathname === '/api/login' && request.method() === 'POST') {
      state.loginRequests.push(request);
      state.authenticated = true;
      await respond({ ...settings, revision: 'revision-1' });
      return;
    }

    if (pathname === '/api/logout' && request.method() === 'POST') {
      state.logoutRequests.push(request);
      state.authenticated = false;
      await respond({ ok: true });
      return;
    }

    if (pathname === '/api/settings' && request.method() === 'PUT') {
      state.settingsRequests.push(request);
      await respond({ ...settings, subToken: 'rotated-token', revision: 'revision-2' });
      return;
    }

    if (pathname === '/api/state' && request.method() === 'GET') {
      await respond({ state: { profiles: state.profiles }, revision: `revision-${state.revision}` });
      return;
    }

    if (pathname === '/api/state' && request.method() === 'PUT') {
      state.stateRequests.push(request);
      state.profiles = request.postDataJSON().state.profiles;
      state.revision += 1;
      await respond({ revision: `revision-${state.revision}` });
      return;
    }

    if (pathname === '/api/preview' && request.method() === 'POST') {
      const profile = request.postDataJSON();
      await respond({ content: JSON.stringify({ profile: profile.name, outbounds: [] }, null, 2) });
      return;
    }

    if (pathname === '/api/github-sync' && request.method() === 'GET') {
      await respond({
        connected: state.connected,
        repository: state.connected ? 'example/private-config' : undefined,
        defaultBranch: state.connected ? 'main' : undefined,
        status: state.connected ? 'local-ahead' : 'never',
        local: {
          revision: 'revision-1',
          contentHash: 'local-hash',
          changedFromBase: false,
          changes: { added: [], modified: [], deleted: [] },
        },
        remote: state.connected ? {
          revision: 'remote-1',
          contentHash: 'remote-hash',
          changedFromBase: false,
          changes: { added: [], modified: [], deleted: [] },
        } : undefined,
        sameContent: false,
        canPush: state.connected,
        canPull: false,
        requiresResolution: false,
      });
      return;
    }

    if (pathname === '/api/github-sync/push' && request.method() === 'POST') {
      state.syncRequests.push(request);
      await respond({
        action: 'pushed', revision: 'revision-2', remoteRevision: 'remote-2', contentHash: 'local-hash',
        changes: { added: [], modified: [], deleted: [] },
      });
      return;
    }

    if (pathname === '/api/github-sync/connection' && request.method() === 'PUT') {
      state.connectionRequests.push(request);
      state.connected = true;
      await respond({ connected: true, repository: 'example/private-config', defaultBranch: 'main' });
      return;
    }

    if (pathname === '/api/github-sync/connection' && request.method() === 'DELETE') {
      state.connectionRequests.push(request);
      state.connected = false;
      await respond({ connected: false });
      return;
    }

    if (pathname === '/api/srs-compiler' && request.method() === 'GET') {
      await respond({
        connected: state.connected,
        repository: state.connected ? 'example/private-config' : undefined,
        defaultBranch: state.connected ? 'main' : undefined,
        enabled: false,
        status: 'disabled',
        workflowVersion: 1,
      });
      return;
    }

    if (pathname === '/api/srs-compiler' && request.method() === 'PUT') {
      state.compilerRequests.push(request);
      await respond({
        connected: true,
        repository: 'example/private-config',
        defaultBranch: 'main',
        enabled: request.postDataJSON().enabled,
        status: request.postDataJSON().enabled ? 'ready' : 'disabled',
        workflowVersion: 1,
      });
      return;
    }

    if (/^\/api\/rulesets\/[^/]+\/build$/.test(pathname) && request.method() === 'GET') {
      const rulesetId = decodeURIComponent(pathname.split('/')[3]);
      await respond({
        revision: `revision-${state.revision}`,
        rulesetId,
        status: state.buildStatus,
        compilerAvailable: true,
        formats: { source: true, binary: state.buildStatus === 'ready' },
        build: null,
      });
      return;
    }

    if (/^\/api\/rulesets\/[^/]+\/build$/.test(pathname) && request.method() === 'POST') {
      state.buildRequests.push(request);
      state.buildStatus = 'ready';
      await respond({ accepted: true, jobId: 'job-ruleset' });
      return;
    }

    if (pathname === '/api/assets' && request.method() === 'GET') {
      await respond({ nodes: state.assets, templates: [], adapters: [], rulesets: state.rulesets });
      return;
    }

    if (pathname === '/api/file' && request.method() === 'GET') {
      const path = new URL(request.url()).searchParams.get('path') ?? '';
      const asset = [...state.assets, ...state.rulesets].find((item) => item.path === path);
      if (!asset) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 'ASSET_NOT_FOUND' } }),
        });
        return;
      }
      await respond({
        content: state.contents[path] ?? JSON.stringify({ inbounds: [], outbounds: [], note: asset.note }, null, 2),
        sha: `revision-${state.revision}`,
      });
      return;
    }

    if (pathname === '/api/file' && request.method() === 'PUT') {
      state.fileRequests.push(request);
      const payload = request.postDataJSON();
      const document = JSON.parse(payload.content);
      const isRuleset = payload.path.startsWith('sing-sub/rulesets/');
      const target = isRuleset ? state.rulesets : state.assets;
      const next = target.filter((item) => item.path !== payload.oldPath && item.path !== payload.path);
      next.push({ path: payload.path, note: isRuleset ? document._sing_sub?.note ?? '' : document.note ?? '' });
      if (isRuleset) state.rulesets = next; else state.assets = next;
      if (payload.oldPath) delete state.contents[payload.oldPath];
      state.contents[payload.path] = payload.content;
      state.revision += 1;
      await respond({ success: true, revision: `revision-${state.revision}`, content: payload.content });
      return;
    }

    if (pathname === '/api/file' && request.method() === 'DELETE') {
      state.fileRequests.push(request);
      const path = new URL(request.url()).searchParams.get('path');
      state.assets = state.assets.filter((item) => item.path !== path);
      state.rulesets = state.rulesets.filter((item) => item.path !== path);
      if (path) delete state.contents[path];
      await respond({ success: true, revision: 'revision-2' });
      return;
    }

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR' } }),
    });
  });

  return state;
}

async function login(page: Page, state: ReactApiMock) {
  await page.goto('/react.html');
  await expect(page.getByRole('heading', { name: '初始化工作区' })).toBeVisible();
  await page.getByRole('textbox', { name: '管理员口令', exact: true }).fill('test-admin-password');
  await page.getByRole('button', { name: '初始化', exact: true }).click();

  await expect.poll(() => state.loginRequests.length).toBe(1);
  expect(state.loginRequests[0].postDataJSON()).toEqual({ adminPassword: 'test-admin-password' });
  await expect(page).toHaveURL(/react\.html#\/profiles$/);
  await expect(page.getByRole('heading', { name: '配置', exact: true })).toBeVisible();
}

test('React entry initializes with a password-only request and guarded route', async ({ page }) => {
  const state = await mockReactApi(page);
  await login(page, state);
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeAttached();
});

test('React entry persists language and color scheme with native Mantine controls', async ({ page }) => {
  await mockReactApi(page, false);
  await page.goto('/react.html#/connect');

  await page.getByRole('button', { name: '切换颜色模式', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');

  await page.getByRole('button', { name: '切换语言', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
});

test('React navigation separates nested active states and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await mockReactApi(page);
  await login(page, state);

  const navigation = page.getByRole('navigation', { name: '主导航' });
  const resourcesLink = navigation.getByRole('link', { name: '资源', exact: true });
  const nodesLink = navigation.getByRole('link', { name: '节点集', exact: true });
  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  await nodesLink.click();
  await expect(page.getByRole('heading', { name: '节点集', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '打开导航', exact: true }).click();

  const [parentBox, childBox, parentBackground, childBackground] = await Promise.all([
    resourcesLink.boundingBox(),
    nodesLink.boundingBox(),
    resourcesLink.evaluate((element) => getComputedStyle(element).backgroundColor),
    nodesLink.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(parentBox).not.toBeNull();
  expect(childBox).not.toBeNull();
  expect(childBox!.y - (parentBox!.y + parentBox!.height)).toBeGreaterThanOrEqual(4);
  expect(parentBackground).not.toBe(childBackground);

  const routeSurface = page.getByTestId('route-transition');
  await expect(routeSurface).toHaveCSS('transition-property', 'opacity');
  await expect(routeSurface).toHaveCSS('transition-duration', '0.12s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await navigation.getByRole('link', { name: '模板', exact: true }).click();
  await expect(page.getByRole('heading', { name: '模板', exact: true })).toBeVisible();
  await expect(page.getByTestId('route-transition')).toHaveCSS('transition-duration', '0s');
});

test('React entry opens mobile navigation and confirms sign out', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await mockReactApi(page);
  await login(page, state);

  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  await expect(page.getByRole('link', { name: '同步', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '退出登录', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('只退出当前设备，不影响数据和其他设备。')).toBeVisible();
  await dialog.getByRole('button', { name: '退出登录', exact: true }).click();

  await expect.poll(() => state.logoutRequests.length).toBe(1);
  await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible();
  await expect(page).toHaveURL(/react\.html#\/connect$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('React entry stays within the viewport matrix and keeps modal actions keyboard accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await mockReactApi(page);
  await login(page, state);
  await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

  for (const width of [320, 390, 412, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    )), { message: `viewport ${width}px should settle without horizontal overflow` }).toBeLessThanOrEqual(0);
    const viewport = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return style.display !== 'none' && rect.width > 0
            && (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1);
        })
        .slice(0, 5)
        .map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.slice(0, 40) })),
    }));
    expect(viewport.scrollWidth, JSON.stringify(viewport)).toBeLessThanOrEqual(viewport.clientWidth);
  }

  const newProfile = page.getByRole('button', { name: '新建配置', exact: true }).first();
  await newProfile.focus();
  await page.keyboard.press('Enter');
  const editor = page.getByRole('dialog');
  await expect(editor).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
  await editor.getByRole('button', { name: '关闭', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(editor).toBeHidden();
});

test('React settings rotate tokens and connect repository with validated Mantine forms', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await mockReactApi(page);
  await login(page, state);

  await page.getByRole('link', { name: '设置', exact: true }).click();
  await page.getByRole('tab', { name: '订阅', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '订阅 Token', exact: true })).toHaveValue('subscription-token');

  await page.getByRole('button', { name: '重新生成', exact: true }).click();
  const rotateDialog = page.getByRole('dialog');
  await rotateDialog.getByRole('button', { name: '确认', exact: true }).click();
  await expect.poll(() => state.settingsRequests.length).toBe(1);
  expect(state.settingsRequests[0].postDataJSON()).toEqual({
    expectedRevision: 'revision-1',
    rotateSubscriptionToken: true,
  });

  await page.getByRole('tab', { name: '仓库', exact: true }).click();
  await page.getByRole('textbox', { name: '仓库', exact: true }).fill('example/private-config');
  await page.getByRole('textbox', { name: 'Fine-grained PAT', exact: true }).fill('github-pat');
  await page.getByRole('button', { name: '连接', exact: true }).click();

  await expect.poll(() => state.connectionRequests.length).toBe(1);
  expect(state.connectionRequests[0].postDataJSON()).toEqual({
    owner: 'example',
    repo: 'private-config',
    pat: 'github-pat',
  });
  await expect(page.getByText('example/private-config', { exact: true })).toBeVisible();

  await page.getByRole('switch', { name: 'SRS 编译', exact: true }).press('Space');
  await expect.poll(() => state.compilerRequests.length).toBe(1);
  expect(state.compilerRequests[0].postDataJSON()).toEqual({ enabled: true });
});

test('React resources create a JSON asset through the lazy CodeMirror modal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await mockReactApi(page);
  await login(page, state);

  await page.getByRole('link', { name: '资源', exact: true }).click();
  await expect(page.getByRole('heading', { name: '节点集' })).toBeVisible();
  await page.getByRole('button', { name: '新建文件', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: '名称', exact: true }).fill('edge-nodes');
  await dialog.getByRole('textbox', { name: '备注', exact: true }).fill('Edge nodes');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();

  await expect.poll(() => state.fileRequests.length).toBe(1);
  const payload = state.fileRequests[0].postDataJSON();
  expect(payload).toMatchObject({
    path: 'sing-sub/nodes/edge-nodes.json',
    expectedRevision: 'revision-1',
    sha: null,
  });
  expect(JSON.parse(payload.content)).toMatchObject({ note: 'Edge nodes', inbounds: [], outbounds: [] });
  await expect(dialog).toBeHidden();
  await expect(page.getByText('edge-nodes', { exact: true })).toBeVisible();

  const assetCard = page.getByRole('article', { name: 'edge-nodes', exact: true });
  await assetCard.getByRole('button', { name: '更多操作', exact: true }).click();
  await page.getByRole('menuitem', { name: '删除文件', exact: true }).click();
  await expect(dialog.getByText('确定删除 edge-nodes 吗？引用该文件的配置可能会被更新。', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
});

test('React profiles create, preview, copy, duplicate, and delete through Mantine dialogs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const state = await mockReactApi(page);
  await login(page, state);

  await page.getByRole('button', { name: '新建配置', exact: true }).first().click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: '名称', exact: true }).fill('smoke-profile');
  await dialog.getByRole('textbox', { name: '备注', exact: true }).fill('Primary subscription');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();

  await expect.poll(() => state.stateRequests.length).toBe(1);
  expect(state.stateRequests[0].postDataJSON()).toMatchObject({
    expectedRevision: 'revision-1',
    profileName: 'smoke-profile',
    state: { profiles: [{ name: 'smoke-profile', note: 'Primary subscription', order: 0 }] },
  });
  await expect(page.getByText('smoke-profile', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '订阅', exact: true }).click();
  await expect(page.getByRole('button', { name: '已复制', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '更多操作', exact: true }).click();
  await page.getByRole('menuitem', { name: '复制配置', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('textbox', { name: '名称', exact: true })).toHaveValue('smoke-profile_copy');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect.poll(() => state.stateRequests.length).toBe(2);
  await expect(page.getByText('smoke-profile_copy', { exact: true })).toBeVisible();

  await page.getByText('smoke-profile', { exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByText('"profile": "smoke-profile"', { exact: false })).toBeVisible();
  await dialog.getByRole('button', { name: '关闭', exact: true }).click();

  const copyCard = page.getByRole('article', { name: 'smoke-profile_copy' });
  await copyCard.getByRole('button', { name: '更多操作', exact: true }).click();
  await page.getByRole('menuitem', { name: '删除配置', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '删除', exact: true }).click();
  await expect.poll(() => state.stateRequests.length).toBe(3);
  await expect(page.getByText('smoke-profile_copy', { exact: true })).toBeHidden();
});

test('React rulesets edit structured sources and manual rules, retry builds, and expose the SRS link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  const state = await mockReactApi(page);
  const path = 'sing-sub/rulesets/smoke-rules.json';
  state.rulesets = [{ path, note: 'Smoke rules' }];
  state.contents[path] = JSON.stringify({ version: 2, rules: [], _sing_sub: { note: 'Smoke rules', sources: [] } }, null, 2);
  state.buildStatus = 'failed';
  await login(page, state);

  await page.getByRole('link', { name: '规则集', exact: true }).click();
  const card = page.getByRole('article', { name: 'smoke-rules' });
  await expect(card.getByText('编译失败', { exact: true })).toBeVisible();
  await card.getByRole('button', { name: '重新编译', exact: true }).click();
  await expect.poll(() => state.buildRequests.length).toBe(1);
  await expect(card.getByRole('button', { name: '复制 SRS 链接', exact: true })).toBeVisible();

  await card.getByRole('button', { name: '编辑', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'SOURCE', exact: true }).fill('https://example.com/rules.json');
  await dialog.getByRole('combobox', { name: '更新周期', exact: true }).click();
  await page.getByRole('option', { name: '每天', exact: true }).click();
  await dialog.getByRole('textbox', { name: 'DOMAIN', exact: true }).fill('example.com\nwww.example.com');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();

  await expect.poll(() => state.fileRequests.length).toBe(1);
  const payload = state.fileRequests[0].postDataJSON();
  expect(payload.path).toBe(path);
  expect(JSON.parse(payload.content)).toMatchObject({
    version: 2,
    _sing_sub: {
      note: 'Smoke rules',
      sources: [{ url: 'https://example.com/rules.json', interval_hours: 24 }],
      manual: { domain: ['example.com', 'www.example.com'] },
    },
  });
});

test('React sync pushes with the current revision after status preflight', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await mockReactApi(page);
  await login(page, state);
  state.connected = true;

  await page.getByRole('link', { name: '同步', exact: true }).click();
  await expect(page.getByText('R2 有新修改', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '推送到 GitHub', exact: true }).click();

  await expect.poll(() => state.syncRequests.length).toBe(1);
  expect(state.syncRequests[0].postDataJSON()).toEqual({ expectedRevision: 'revision-1', resolution: 'safe' });
});
