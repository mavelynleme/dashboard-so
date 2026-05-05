const state = {
  nextProcessId: 1,
  processQueue: [],
  memoryBlocks: Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    size: 64,
    used: false,
  })),
};

function byId(id) {
  return document.getElementById(id);
}

function setRows(containerId, rows) {
  byId(containerId).innerHTML = rows
    .map(
      ([key, value]) => `
        <div class="info-row">
          <span class="info-label">${key}</span>
          <span class="info-value">${value ?? "Nao disponivel"}</span>
        </div>
      `
    )
    .join("");
}

function setProgress(id, percent) {
  byId(id).style.width = `${Math.max(0, Math.min(100, percent || 0))}%`;
}

function escapeAttribute(value) {
  return String(value ?? "Nao disponivel")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function appRow(label, value, shouldTruncate = false) {
  const displayValue = value ?? "Nao disponivel";
  const truncateClass = shouldTruncate ? " truncate-value" : "";
  const title = shouldTruncate ? ` title="${escapeAttribute(displayValue)}"` : "";

  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value${truncateClass}"${title}>${displayValue}</span>
    </div>
  `;
}

function renderSummary(summary) {
  const cards = [
    ["#icon-memory", "RAM", `${summary.ramUsagePercent}%`, "Uso de memoria", summary.ramUsagePercent],
    ["#icon-cpu", "CPU Media", `${summary.averageCpuUsagePercent}%`, "Aproximacao por nucleo", summary.averageCpuUsagePercent],
    ["#icon-clock", "Uptime", summary.formattedUptime, "Tempo ligado", 100],
    ["#icon-folder", "Arquivos", summary.projectFileCount, "Itens do projeto", 100],
    ["#icon-network", "IP Principal", summary.mainIpAddress, "Rede ativa", 100],
    ["#icon-env", "Status", summary.machineStatus, "Maquina monitorada", 100],
  ];

  byId("summaryCards").innerHTML = cards
    .map(
      ([icon, label, value, note, percent]) => `
        <article class="metric-card">
          <div class="metric-top">
            <span class="metric-icon"><svg><use href="${icon}"></use></svg></span>
            <p class="summary-label">${label}</p>
          </div>
          <p class="summary-value">${value}</p>
          <p class="summary-note">${note}</p>
          <div class="metric-line"><span style="width: ${Math.min(percent, 100)}%"></span></div>
        </article>
      `
    )
    .join("");
  byId("machineStatus").textContent = summary.machineStatus;
}

function renderSystem(data) {
  setRows("systemInfo", [
    ["Hostname", data.system.hostname],
    ["Tipo do SO", data.system.type],
    ["Release / kernel", data.system.release],
    ["Plataforma", data.system.platform],
    ["Arquitetura", data.system.architecture],
    ["Endianness", data.system.endianness],
    ["Node.js", data.system.nodeVersion],
  ]);
}

function renderUser(data) {
  setRows("userInfo", [
    ["Usuario atual", data.user.username],
    ["Diretorio home", data.user.homedir],
    ["Diretorio temporario", data.user.tempdir],
    ["Shell", data.user.shell],
    ["UID", data.user.uid],
    ["GID", data.user.gid],
  ]);
}

function renderMemory(data) {
  byId("ramPercent").textContent = `${data.memory.usagePercent}%`;
  setProgress("ramBar", data.memory.usagePercent);
  setRows("memoryInfo", [
    ["Memoria total", data.memory.total],
    ["Memoria usada", data.memory.used],
    ["Memoria livre", data.memory.free],
    ["Processo Node.js", data.memory.processRss],
  ]);
}

function renderCpu(data) {
  byId("cpuPercent").textContent = `${data.cpu.averageUsagePercent}%`;
  setProgress("cpuBar", data.cpu.averageUsagePercent);
  setRows("cpuInfo", [
    ["Nucleos", data.cpu.coreCount],
    ["Modelo", data.cpu.model],
    ["Load average", data.cpu.loadAverage.map((item) => item.toFixed(2)).join(" / ")],
  ]);

  byId("coreList").innerHTML = data.cpu.perCoreUsage
    .map(
      (core) => `
        <div class="core-row">
          <span>Nucleo ${core.core}</span>
          <div class="progress-bar"><span style="width: ${core.usagePercent}%"></span></div>
          <strong>${core.usagePercent}%</strong>
        </div>
      `
    )
    .join("");
}

function renderNetwork(data) {
  setRows("networkInfo", [["IP principal", data.network.mainIpAddress]]);
  byId("networkTable").innerHTML = data.network.interfaces
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.address}</td>
          <td>${item.family}</td>
          <td>${item.internal ? "Interna" : "Externa"}</td>
        </tr>
      `
    )
    .join("");
}

function renderProject(data) {
  byId("filesTable").innerHTML = data.project.files
    .filter((file) => !["server.out.log", "server.err.log"].includes(file.name))
    .map(
      (file) => `
        <tr>
          <td>${file.name}</td>
          <td>${file.type}</td>
          <td>${file.size}</td>
        </tr>
      `
    )
    .join("");
}

function renderTime(data) {
  setRows("timeInfo", [
    ["Uptime formatado", data.time.formattedUptime],
    ["Timezone UTC", data.time.timezoneUtc],
    ["Timestamp ISO", data.time.isoTimestamp],
  ]);
  byId("updatedAt").textContent = new Date(data.generatedAt).toLocaleString("pt-BR");
}

function renderApplication(data) {
  byId("appInfo").innerHTML = [
    appRow("PID", data.application.pid),
    appRow("Diretorio atual", data.application.currentDirectory, true),
    appRow("Executavel Node", data.application.nodeExecutablePath, true),
    appRow("Memoria do processo", data.application.processMemory),
  ].join("");
}

function renderEnvironment(data) {
  setRows("envInfo", [
    ["Execucao", data.environment.runtime],
    ["PORT", data.environment.port],
    ["NODE_ENV", data.environment.nodeEnv],
    ["Render", data.environment.isRender ? "Sim" : "Nao"],
    ["Parece AWS/cloud", data.environment.looksLikeAws ? "Sim" : "Nao"],
    ["Status", data.environment.statusMessage],
  ]);
}

async function loadDashboard() {
  try {
    const response = await fetch("/api/system");
    if (!response.ok) throw new Error("Falha ao carregar /api/system");
    const data = await response.json();

    renderSummary(data.summary);
    renderSystem(data);
    renderUser(data);
    renderMemory(data);
    renderCpu(data);
    renderNetwork(data);
    renderProject(data);
    renderTime(data);
    renderApplication(data);
    renderEnvironment(data);
  } catch (error) {
    byId("machineStatus").textContent = "API indisponivel";
  }
}

function renderSimulation() {
  byId("processQueue").innerHTML =
    state.processQueue
      .map((processItem) => `<span class="process">PID ${processItem.pid} - ${processItem.state}</span>`)
      .join("") || '<span class="memory-block free">Fila vazia</span>';

  byId("memoryBlocks").innerHTML = state.memoryBlocks
    .map(
      (block) => `
        <span class="memory-block ${block.used ? "" : "free"}">
          Bloco ${block.id}<br />${block.used ? "Ocupado" : "Livre"} - ${block.size}MB
        </span>
      `
    )
    .join("");
}

function allocateMemory() {
  const block = state.memoryBlocks.find((item) => !item.used);
  if (block) block.used = true;
  renderSimulation();
}

function releaseMemory() {
  const block = [...state.memoryBlocks].reverse().find((item) => item.used);
  if (block) block.used = false;
  renderSimulation();
}

function createProcess() {
  state.processQueue.push({
    pid: state.nextProcessId,
    state: "Pronto",
  });
  state.nextProcessId += 1;
  renderSimulation();
}

function terminateProcess() {
  state.processQueue.shift();
  renderSimulation();
}

byId("allocateBtn").addEventListener("click", allocateMemory);
byId("releaseBtn").addEventListener("click", releaseMemory);
byId("createProcessBtn").addEventListener("click", createProcess);
byId("terminateProcessBtn").addEventListener("click", terminateProcess);

renderSimulation();
loadDashboard();
setInterval(loadDashboard, 5000);
