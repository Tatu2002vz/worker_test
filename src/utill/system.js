const geoip = require('geoip-lite');

const checkDiskSpace = require('check-disk-space');
// eslint-disable-next-line import/no-extraneous-dependencies
const NetworkSpeed = require('network-speed');

const path = require('path');
const si = require('systeminformation');
// eslint-disable-next-line import/no-extraneous-dependencies
// const { getGPUTier } =require('detect-gpu');
const process = require('process');
const osUtils = require('os-utils');

const docker = require('./docker');
const gpuEnum = require('../enum/gpu');

// // const si = window.require('systeminformation');

const testNetworkSpeed = new NetworkSpeed();
const { GPU } = gpuEnum;

// eslint-disable-next-line consistent-return
async function getNetworkStats() {
  try {
    const networkStats = await si.networkStats();
    const totalStats = networkStats.reduce(
      (totals, stat) => {
        return {
          rx_sec: totals.rx_sec + (stat.rx_sec || 0),
          tx_sec: totals.tx_sec + (stat.tx_sec || 0)
        };
      },
      { rx_sec: 0, tx_sec: 0 }
    );
    totalStats.rx_sec = (totalStats.rx_sec / 1024).toFixed(2);
    totalStats.tx_sec = (totalStats.tx_sec / 1024).toFixed(2);
    return totalStats;
  } catch (error) {
    console.error('Error:', error);
  }
}
function getGigabytes(a) {
  return (a / 1024 / 1024 / 1024).toFixed(2);
}
async function getUsageCpu() {
  return new Promise((resolve, reject) => {
    osUtils.cpuUsage((v) => {
      const cpuUsage = Math.ceil(v * 100);
      resolve(cpuUsage);
    });
  });
}

async function getSystemStats() {
  const memory = await si.mem();
  // const cpu = process.getCPUUsage();
  const cpuPercent = await getUsageCpu();
  return {
    mem: `${getGigabytes(memory.used)} / ${getGigabytes(memory.total)}`,
    memPerc: Number(`${((memory.used / memory.total) * 100).toFixed(2)}`),
    cpu: cpuPercent,
    memoryUsage: memory.used,
    totalUsage: memory.total
  };
}
// eslint-disable-next-line consistent-return
async function getDiskUsage() {
  try {
    const os1 = await si.osInfo();
    const { platform } = os1;
    let data = {
      total: '',
      free: '',
      used: '',
      platform: JSON.stringify(platform)
    };
    if (platform === 'Windows' || platform === 'linux') {
      const disk = await si.fsSize();
      console.log('disk: ', disk);
      const diskTotal = disk.reduce(
        (totals, stat) => {
          return {
            free: totals.free + stat.available,
            size: totals.size + stat.size
          };
        },
        { free: 0, size: 0 }
      );
      data = {
        total: (diskTotal.size / 1024 / 1024 / 1024).toFixed(2),
        free: (diskTotal.free / 1024 / 1024 / 1024).toFixed(2),
        used: ((diskTotal.size - diskTotal.free) / 1024 / 1024 / 1024).toFixed(2),
        platform: JSON.stringify(platform)
      };
      return data;
    }
    // if (platform === 'darwin') {
    //   const disk = await si.fsSize();
    //   console.log('disk: ', disk);
    //   const diskTotal = disk.reduce(
    //     (totals: any, stat: any) => {
    //       return {
    //         free: totals.free + stat.available,
    //         size: stat.size
    //       };
    //     },
    //     { free: 0, size: 0 }
    //   );
    //   data = {
    //     total: (diskTotal.size / 1024 / 1024 / 1024).toFixed(2),
    //     free: (diskTotal.free / 1024 / 1024 / 1024).toFixed(2),
    //     used: ((diskTotal.size - diskTotal.free) / 1024 / 1024 / 1024).toFixed(2),
    //     platform: JSON.stringify(platform)
    //   };
    //   return data;
    // }
    // if (platform === 'linux') {
    //   const pathDisk = '/';
    //   const diskSpace = await checkDiskSpace(path.resolve(pathDisk));
    //   if (diskSpace)
    //     data = {
    //       total: (diskSpace.size / 1024 / 1024 / 1024).toFixed(2) || '5',
    //       free: (diskSpace.free / 1024 / 1024 / 1024).toFixed(2) || '5',
    //       used: ((diskSpace.size - diskSpace.free) / 1024 / 1024 / 1024).toFixed(2) || '5',
    //       platform: JSON.stringify(platform)
    //     };
    //   else
    //     data = {
    //       total: '5',
    //       free: '5',
    //       used: '5',
    //       platform: JSON.stringify(platform)
    //     };
    //   return data;
    // }
    if (platform === 'darwin') {
      const pathDisk = '/';
      const diskSpace = await checkDiskSpace(path.resolve(pathDisk));
      if (diskSpace)
        data = {
          total: (diskSpace.size / 1000 / 1000 / 1000).toFixed(2) || '5',
          free: (diskSpace.free / 1000 / 1000 / 1000).toFixed(2) || '5',
          used: ((diskSpace.size - diskSpace.free) / 1000 / 1000 / 1000).toFixed(2) || '5',
          platform: JSON.stringify(platform)
        };
      else
        data = {
          total: '5',
          free: '5',
          used: '5',
          platform: JSON.stringify(platform)
        };
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return `Error: ${error}`;
  }
}
async function getGPU() {
  const graphicsData = await si.graphics();
  // const memory = await si.mem();
  // console.log('graphics: ', graphicsData);
  const gpus = graphicsData.controllers.map((controller) => controller.name).filter((name) => name);
  const gpuDisplay = graphicsData.displays[0] || 60;
  return { gpus, gpuDisplay };
}
// eslint-disable-next-line consistent-return
async function getSystemInfo() {
  try {
    const diskTotal = await getDiskUsage();
    const cpu = await si.cpu();
    const gpus = await getGPU();
    // const disk = await si.fsSize();
    // console.log(disk);
    // logMessage('Disk si::', JSON.stringify(disk));

    const systemInfo = {
      cpu: `${cpu.brand}`,
      gpu: gpus.gpus,
      disk: diskTotal
    };
    return systemInfo;
  } catch (error) {
    console.error('Error:', error);
  }
}

// // -----------------
// function delay(timeoutInMilliseconds: number) {
//   return new Promise<void>((resolve) => {
//     setTimeout(() => {
//       resolve();
//     }, timeoutInMilliseconds);
//   });
// }
// const gpuFPS = async () => {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   await page.goto('https://pmndrs.github.io/detect-gpu/', { waitUntil: 'domcontentloaded', timeout: 300000 });
//   await page.waitForSelector('#root', { timeout: 5000 });
//   await delay(1000);
//   // eslint-disable-next-line consistent-return
//   const gpuData = await page.evaluate(() => {
//     if (document && document.getElementById('root')) {
//       return document.getElementById('root')?.innerText;
//     }
//   });
//   let gpuInfo;
//   try {
//     gpuInfo = JSON.parse(gpuData || '');
//   } catch (error) {
//     console.error('Error parsing GPU data:', error);
//   }
//   await browser.close();
//   return gpuInfo;
// };

async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ipV4 = data.ip;
    return ipV4;
  } catch (error) {
    console.error('Error fetching public IP address:', error);
    return null;
  }
}

async function getGeolocation(ip) {
  const geo = geoip.lookup(ip);
  return geo ? { latitude: geo.ll[0], longitude: geo.ll[1] } : null;
}

async function getInfoSystem() {
  const cpu = await si.cpu();
  const disk = (await si.diskLayout())[0];
  const os1 = await si.osInfo();
  // const versions = await si.versions();
  const ram = await si.mem();

  // CPU Info
  const cpuInfo = {
    model: `${cpu.manufacturer} ${cpu.brand} ${cpu.speed}GHz`,
    cores: {
      value: cpu.cores,
      unit: 'core'
    }
  };

  // RAM Info
  const totalRam = Math.round(ram.total / 1024 / 1024 / 1024);
  const ramInfo = {
    capacity: {
      value: totalRam,
      unit: 'GB'
    }
  };

  // Disk Info
  const diskSize = Math.round(disk.size / 1024 / 1024 / 1024);
  const storageInfo = {
    capacity: {
      value: diskSize,
      unit: 'GB'
    }
  };

  // OS and Kernel Info
  const osInfo = `${os1.distro} ${os1.codename} (${os1.platform})`;
  const kernelInfo = `${os1.kernel} ${os1.arch}`;

  // Compile all the info into a single object
  const systemInfo = {
    cpu: cpuInfo,
    memory: ramInfo,
    storage: storageInfo,
    os: osInfo,
    kernel: kernelInfo
  };

  return systemInfo;
}
const getNetworkDownloadSpeed = async () => {
  const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
  const fileSizeInBytes = 500000;
  const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
  return speed;
};

const getNetworkUploadSpeed = async () => {
  const options = {
    hostname: 'www.google.com',
    port: 80,
    path: '/catchers/544b09b4599c1d0200000289',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const fileSizeInBytes = 2000000;
  const speed = await testNetworkSpeed.checkUploadSpeed(options, fileSizeInBytes);
  return speed;
};

// eslint-disable-next-line consistent-return
const benchMarkTask = async () => {
  try {
    const ip = await getIPAddress();
    const system = await getInfoSystem();
    const location = await getGeolocation(ip);
    const uSpeed = await getNetworkUploadSpeed();
    const dSpeed = await getNetworkDownloadSpeed();
    const gpu = await getGPU();
    const benchMarkData = {
      gpu: {
        fps: gpu.gpuDisplay?.currentRefreshRate || 60,
        gpu: JSON.stringify(gpu.gpus),
        isMobile: false,
        tier: 0,
        type: 'BENCHMARK'
      },
      network: {
        upload: uSpeed,
        download: dSpeed
      },
      location: {
        ip,
        ...location
      },
      ...system
    };
    // console.log(benchMarkData);
    return benchMarkData;
  } catch (error) {
    benchMarkTask();
  }
};

async function getGpuValue(gpuName) {
  return GPU[gpuName] || 0;
}

async function reportSystemInfo() {
  const systemStats = await getSystemStats();
  const system = await getInfoSystem();
  const system1 = await getSystemInfo();
  const diskUsage = await getDiskUsage();
  const mem = {
    memoryUsage: systemStats.memoryUsage,
    totalUsage: systemStats.totalUsage
  };
  const traffic = await getNetworkStats();
  const gpuNames = await system1?.gpu;
  let gpus;
  if (gpuNames) {
    gpus = await Promise.all(
      gpuNames.map(async (gpuName) => {
        const gpu = await getGpuValue(gpuName);
        return gpu;
      })
    );
  }
  const docker1 = await docker.getContainerAndImageCounts();
  const result = {
    cpu: {
      ...system.cpu,
      usage: systemStats.cpu
    },
    disk: diskUsage,
    mem: mem || '',
    traffic: {
      inbound: traffic?.rx_sec,
      outbound: traffic?.tx_sec
    },
    gpus: gpus || '',
    gpuNames: gpuNames || '',
    images: docker1?.images,
    containers: docker1?.container
  };
  return result;
}

// export default {
//   getNetworkStats,
//   getGigabytes,
//   getSystemInfo,
//   getSystemStats,
//   benchMarkTask,
//   reportSystemInfo
// };
module.exports = {
  getNetworkStats,
  getGigabytes,
  getSystemInfo,
  getSystemStats,
  benchMarkTask,
  reportSystemInfo
};
