module.exports = () => {
  let memStats = {};
  const now = require("perf_hooks").performance.now;
  const start = now();
  const cpuUsage = process.cpuUsage()
  process.nextTick(() => {
    const current = process.memoryUsage();
    for (const key in current) {
      memStats[key] = Math.max(memStats[key] || 0, current[key]);
    }
  });

  process.on("exit", () => {
    console.log({
      memStats,
      timeMilliseconds: now() - start,
      cpuUsage: process.cpuUsage(cpuUsage),
      pid: process.pid,
    });
  });
};
