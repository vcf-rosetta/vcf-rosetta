// vCenter REST 取数助手(best-effort)。
// 插件部署后由 vCenter 反向代理托管,与 vCenter 同源,尝试带当前登录会话调用
// vSphere Automation REST API。取不到时调用方负责优雅降级。
window.VcApi = (function () {
  'use strict';

  // 优先用 vSphere Client SDK 提供的会话;否则靠同源 cookie。
  function sessionHeaders() {
    var h = { 'Accept': 'application/json' };
    try {
      var sdk = window.htmlClientSdk || window.vSphereClientSdk;
      var sid = sdk && sdk.app && sdk.app.getSessionId && sdk.app.getSessionId();
      if (sid) h['vmware-api-session-id'] = sid;
    } catch (e) { /* 忽略,退回 cookie */ }
    return h;
  }

  // 调 GET,返回解析后的 JSON;失败抛错(含状态码)。
  async function get(path) {
    var res = await fetch(path, {
      method: 'GET',
      credentials: 'include',
      headers: sessionHeaders(),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' @ ' + path);
    return res.json();
  }

  // 多端点依次尝试(不同 vCenter 版本路径有差异),返回首个成功的。
  async function getFirst(paths) {
    var lastErr;
    for (var i = 0; i < paths.length; i++) {
      try { return await get(paths[i]); } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('no endpoint');
  }

  return {
    // 资产计数
    clusters: function () { return getFirst(['/api/vcenter/cluster']); },
    hosts: function () { return getFirst(['/api/vcenter/host']); },
    vms: function () { return getFirst(['/api/vcenter/vm']); },
    datastores: function () { return getFirst(['/api/vcenter/datastore']); },
    // 最近任务(版本路径不一,依次尝试)
    tasks: function () { return getFirst(['/api/cis/tasks', '/rest/cis/tasks']); },
    get: get,
  };
})();
