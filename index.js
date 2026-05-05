const express = require("express");
const cors = require("cors");
const os = require("os");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_ROOT = process.cwd();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function safeValue(value, fallback = "Nao disponivel") {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function bytesToReadable(bytes) {
  if (!Number.isFinite(bytes)) return "Nao disponivel";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function formatUptime(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  parts.push(`${hours}h`, `${minutes}min`, `${remainingSeconds}s`);
  return parts.join(" ");
}

function getMainIpAddress() {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (!address.internal && address.family === "IPv4") {
        return address.address;
      }
    }
  }

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (!address.internal) {
        return address.address;
      }
    }
  }

  return "Nao disponivel";
}

function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();

  return Object.entries(interfaces).flatMap(([name, addresses]) =>
    (addresses || []).map((address) => ({
      name,
      address: address.address,
      family: address.family,
      internal: Boolean(address.internal),
    }))
  );
}

function getProjectFiles() {
  const ignoredDirectories = new Set([".git", "node_modules"]);
  const files = [];

  function walk(directory) {
    let entries = [];

    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".gitignore") continue;
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

      const fullPath = path.join(directory, entry.name);
      const relativePath = path.relative(PROJECT_ROOT, fullPath);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;

      let stats;
      try {
        stats = fs.statSync(fullPath);
      } catch (error) {
        continue;
      }

      const extension = path.extname(entry.name).replace(".", "").toUpperCase();

      files.push({
        name: relativePath,
        type: extension || "FILE",
        sizeBytes: stats.size,
        size: bytesToReadable(stats.size),
      });
    }
  }

  walk(PROJECT_ROOT);
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

function getUserInfo() {
  try {
    const user = os.userInfo();

    return {
      username: safeValue(user.username),
      homedir: safeValue(user.homedir),
      tempdir: safeValue(os.tmpdir()),
      shell: safeValue(user.shell || process.env.SHELL || process.env.ComSpec),
      uid: safeValue(user.uid),
      gid: safeValue(user.gid),
    };
  } catch (error) {
    return {
      username: "Nao disponivel",
      homedir: safeValue(os.homedir()),
      tempdir: safeValue(os.tmpdir()),
      shell: safeValue(process.env.SHELL || process.env.ComSpec),
      uid: "Nao disponivel",
      gid: "Nao disponivel",
    };
  }
}

function getCpuUsageFromTimes(cpu) {
  const times = cpu.times || {};
  const idle = times.idle || 0;
  const total = Object.values(times).reduce((sum, value) => sum + value, 0);

  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round(((total - idle) / total) * 100)));
}

function detectEnvironment() {
  const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);
  const isAws =
    Boolean(process.env.AWS_REGION || process.env.AWS_EXECUTION_ENV) ||
    os.hostname().toLowerCase().includes("aws");
  const isCloud = isRender || isRailway || isAws || Boolean(process.env.K_SERVICE);

  let runtime = "Local";
  if (isRender) runtime = "Render / Nuvem";
  else if (isRailway) runtime = "Railway / Nuvem";
  else if (isAws) runtime = "AWS ou infraestrutura similar";
  else if (isCloud) runtime = "Nuvem";

  return {
    runtime,
    port: String(PORT),
    nodeEnv: process.env.NODE_ENV || "development",
    isRender,
    looksLikeAws: isAws,
    statusMessage: isCloud
      ? "Aplicacao executando em ambiente de nuvem."
      : "Aplicacao executando em ambiente local.",
  };
}

function collectSystemData() {
  const cpus = os.cpus() || [];
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = Math.max(0, totalMemory - freeMemory);
  const memoryUsagePercent = totalMemory ? Math.round((usedMemory / totalMemory) * 100) : 0;
  const perCoreUsage = cpus.map((cpu, index) => ({
    core: index + 1,
    model: cpu.model,
    speedMHz: cpu.speed,
    usagePercent: getCpuUsageFromTimes(cpu),
  }));
  const averageCpuUsage = perCoreUsage.length
    ? Math.round(perCoreUsage.reduce((sum, core) => sum + core.usagePercent, 0) / perCoreUsage.length)
    : 0;
  const projectFiles = getProjectFiles();
  const processMemory = process.memoryUsage();
  const mainIpAddress = getMainIpAddress();
  const uptimeSeconds = os.uptime();

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      ramUsagePercent: memoryUsagePercent,
      averageCpuUsagePercent: averageCpuUsage,
      formattedUptime: formatUptime(uptimeSeconds),
      projectFileCount: projectFiles.length,
      mainIpAddress,
      machineStatus: "Online",
    },
    system: {
      hostname: safeValue(os.hostname()),
      type: safeValue(os.type()),
      release: safeValue(os.release()),
      platform: safeValue(os.platform()),
      architecture: safeValue(os.arch()),
      endianness: safeValue(os.endianness()),
      nodeVersion: process.version,
    },
    user: getUserInfo(),
    memory: {
      totalBytes: totalMemory,
      total: bytesToReadable(totalMemory),
      usedBytes: usedMemory,
      used: bytesToReadable(usedMemory),
      freeBytes: freeMemory,
      free: bytesToReadable(freeMemory),
      processRssBytes: processMemory.rss,
      processRss: bytesToReadable(processMemory.rss),
      usagePercent: memoryUsagePercent,
    },
    cpu: {
      coreCount: cpus.length,
      model: cpus[0] ? cpus[0].model : "Nao disponivel",
      loadAverage: os.loadavg(),
      averageUsagePercent: averageCpuUsage,
      perCoreUsage,
    },
    network: {
      mainIpAddress,
      interfaces: getNetworkInterfaces(),
    },
    project: {
      currentDirectory: PROJECT_ROOT,
      files: projectFiles,
    },
    time: {
      uptimeSeconds,
      formattedUptime: formatUptime(uptimeSeconds),
      timezoneUtc: new Date().toString().match(/GMT[+-]\d{4}/)?.[0] || "UTC",
      isoTimestamp: new Date().toISOString(),
    },
    application: {
      pid: process.pid,
      currentDirectory: PROJECT_ROOT,
      nodeExecutablePath: process.execPath,
      processMemory: bytesToReadable(processMemory.rss),
      processMemoryBytes: processMemory.rss,
    },
    environment: detectEnvironment(),
  };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/system", (req, res) => {
  res.json(collectSystemData());
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "dashboard-so",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Dashboard de SO rodando na porta ${PORT}`);
});
