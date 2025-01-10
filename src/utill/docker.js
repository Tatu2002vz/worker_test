/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-inner-declarations */
const { exec } = require('child_process');
const Docker = require('dockerode');
const { logMessage } = require('./util');
const { EventNameSocket } = require('../enum/gpu');
// import { IpcMainEvent } from 'electron';

const docker = new Docker();

const executeCommand = (string) => {
  return new Promise((resolve, reject) => {
    exec(string, (err, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
};
async function getContainerStats() {
  let rs = await executeCommand('docker stats --no-stream --format json');
  // rs = JSON.parse(rs)
  rs = rs.split('\n');
  rs.pop();
  rs.forEach((item, index) => {
    rs[index] = JSON.parse(item);
  });
  return rs;
}

// eslint-disable-next-line consistent-return
async function getAllContainers() {
  try {
    const containers = await docker.listContainers({ all: false });
    const listContainers = [...containers];
    // const stats = await getContainerStats();
    // Array.from(stats).forEach((item: any, index) => {
    //   listContainers[index].CPUPerc = item?.CPUPerc;
    //   listContainers[index].MemPerc = item?.MemPerc;
    //   listContainers[index].MemUsage = item?.MemUsage;
    // });
    listContainers.forEach(async (item, index) => {
      const container = await docker.getContainer(item.Id);
      const stats = await container.stats({ stream: false });
      // get percentage cpu
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuPer = (cpuDelta / systemDelta) * 100;
      console.log(`Cpu percentage: ${cpuPer}`);
      // memory usage
      const memoryUsage = ((stats?.memory_stats?.usage || 0) / 1024 / 1024).toFixed(2); // MB
      const maxMemory = ((stats?.memory_stats?.limit || 0) / 1024 / 1024 / 1024).toFixed(2); // GB
      listContainers[index].CPUPerc = cpuPer.toFixed(2);
      listContainers[index].MemPerc = (Number(memoryUsage) / Number(maxMemory) / 1024).toFixed(2);
      listContainers[index].MemUsage = `${memoryUsage} MB / ${maxMemory} GB`;
    });
    const updatedContainers = await Promise.all(
      listContainers.map(async (item) => {
        const container = await docker.getContainer(item.Id);
        const stats = await container.stats({ stream: false });

        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
        const cpuPer = (cpuDelta / systemDelta) * 1000;

        console.log(`Cpu percentage: ${cpuPer}`);

        const memoryUsage = ((stats?.memory_stats?.usage || 0) / 1024 / 1024).toFixed(2);
        const maxMemory = ((stats?.memory_stats?.limit || 0) / 1024 / 1024 / 1024).toFixed(2);

        return {
          ...item,
          CPUPerc: cpuPer.toFixed(2),
          MemPerc: `${((Number(memoryUsage) / Number(maxMemory) / 1024) * 100).toFixed(2)}%`,
          MemUsage: `${memoryUsage} MB / ${maxMemory} GB`
        };
      })
    );
    return updatedContainers;
  } catch (error) {
    logMessage(`Error`, error);
  }
}

// eslint-disable-next-line consistent-return
async function getStatusDocker() {
  try {
    await docker.ping();
    return true;
  } catch (error) {
    await logMessage('Docker not available!', '');
  }
}
// eslint-disable-next-line consistent-return
const getContainerAndImageCounts = async () => {
  try {
    const containers = (await docker.listContainers({ all: true })) || [];
    const images = (await docker.listImages()) || [];
    return {
      container: containers.length,
      images: images.length
    };
  } catch (err) {
    console.error('Error:', err);
  }
};

const generateRandomString = (length = 10) => {
  let result = '';
  const characters = '0123456789'; // Chỉ chứa các chữ số

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};
async function logContainer(containerDockerId, containerId, socket) {
  try {
    const container = docker.getContainer(containerDockerId);
    const stream = await container.logs({ follow: true, stdout: true, stderr: true, tail: 1 });

    await stream.on('data', async (chunk) => {
      console.log(chunk.toString('utf8'));
      await socket.send(EventNameSocket.ContainerLog, {
        containerId,
        log: chunk.toString('utf8'),
        timestamp: new Date()
      });
    });
  } catch (err) {
    console.log(err);
  }
}
// eslint-disable-next-line consistent-return
const createContainer = async (data, socket) => {
  try {
    if (data && data.service) {
      const { ports } = data.service;

      const { envs } = data.service;

      const portBindings = {};
      const exposedPorts = {};

      if (ports && ports.length > 0) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < ports.length; i++) {
          if (ports[i].publicPort === 'host-managed') {
            // eslint-disable-next-line no-unreachable-loop, no-constant-condition
            while (true) {
              const port = String(Math.floor(Math.random() * (Number(10000) - Number(8000) + 1)) + Number(8000));
              ports[i].publicPort = port;
              break;
            }
          }
          ports[i].proxyHost = 'prx0.dev-space.cloud';
          ports[i].proxyPort = ports[i].publicPort;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const port of ports) {
          const internalPort = `${port.internalPort}/tcp`;
          exposedPorts[internalPort] = {};
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const port of ports) {
          const internalPort = `${port.internalPort}/tcp`;
          const publicPort = `${port.publicPort}`;
          portBindings[internalPort] = [{ HostPort: publicPort }];
        }
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < envs.length; i++) {
        if (envs[i].value === 'random') {
          envs[i].value = generateRandomString(10);
        }
      }
      const envVariables = envs.map(({ name, value }) => `${name}=${value}`);
      console.log('data container:: ', data);
      logMessage('message', 'Pulling image...');
      docker.pull(data.service.image, async (err, stream) => {
        if (err) {
          console.error('Error pulling image:', err);
          data.result = 'failed';
          await socket.send(EventNameSocket.CreateGpuContainerResult, data);
          logMessage('message', 'Error pulling image');
        } else {
          async function onFinished(err1) {
            if (err) {
              logMessage('Error pulling image:', err1);
              logMessage('message', 'Error pulling image');
              data.result = 'failed';
              await socket.send(EventNameSocket.CreateGpuContainerResult, data);
              // errorMessage.innerHTML = 'Error pulling image: ' + err.message;
              logMessage(`error-pull-image${err1.message}`);
            } else {
              logMessage('Pull image success!');
              logMessage('Image pulled successfully!');
              logMessage('image-pull-success');
              const containerOptions = {
                Image: data.service.image,
                // Image: `nginx`,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                OpenStdin: true,
                ExposedPorts: exposedPorts,
                HostConfig: {
                  Binds: [],
                  Memory: Number(data.service.ram.value) * 1024 ** 3,
                  NanoCPUs: Number(data.service.cpu.value) * 1e9, // Convert CPU to NanoCPUs
                  CpuCount: Number(data.service.cpu.value),
                  PortBindings: portBindings, // Map port container with port on host machine
                  DeviceRequests: [
                    {
                      Driver: 'nvidia',
                      Count: Number(data.service?.gpu?.value) || 0,
                      // "DeviceIDs": [`${data.gpu}`],
                      Capabilities: [['gpu']],
                      Options: {}
                    }
                  ]
                },
                Env: envVariables,
                Labels: {
                  containerId: data.service.containerId,
                  packageCode: data.service?.packageCode || '',
                  userId: data.user.id,
                  subscriptionId: data.subscription.id,
                  name: data.service.name
                }
              };
              console.log('Create container....');
              logMessage('Create container...');
              docker.createContainer(containerOptions, async (err_container, container) => {
                if (err_container) {
                  logMessage('Error create container: ', err_container);
                  logMessage('message', 'Error creating container: ');
                  data.result = 'failed';
                  await socket.send(EventNameSocket.CreateGpuContainerResult, data);
                  return;
                }

                container?.start(async (err_start) => {
                  if (err_start) {
                    logMessage('Error start container: ', err_start);
                    logMessage('message', 'Error starting container');
                    data.result = 'failed';
                    await socket.send(EventNameSocket.CreateGpuContainerResult, data);
                    return;
                  }
                  const containerInfo = await container.inspect();
                  console.log('Container created successfully');
                  logMessage('message', 'Container created successfully');
                  await logContainer(containerInfo.Id, containerInfo.Config.Labels.containerId, socket);

                  data.container = containerInfo;
                  data.result = 'success';
                  await socket.send(EventNameSocket.CreateGpuContainerResult, data);
                  // return data;
                });
              });
            }
          }

          function onProgress(ev) {
            console.log(ev.status);
            logMessage('Đang pull image: ', ev.status);
            logMessage('message', `Pulling image: ${ev.status}`);
          }
          docker.modem.followProgress(stream, onFinished, onProgress);
        }
      });
    }
  } catch (error) {
    console.log(error);
    data.result = 'failed';
    await socket.send(EventNameSocket.CreateGpuContainerResult, data);
    return data;
  }
};

const conntainerUsages = async (socket) => {
  const containers = await docker.listContainers({ all: true });
  const rs = [];
  if (containers.length > 0) {
    await containers.forEach(async (item) => {
      const container = await docker.getContainer(item.Id);
      const stats = await container.stats({ stream: false });
      // if (index === 0) {
      //   // console.log('docker stats: ', JSON.stringify(stats));
      // }
      const containerInfo = await container.inspect({ size: true });
      let totalReceivedBytes = 0;
      let totalTransmittedBytes = 0;
      let totalRead = 0;
      let totalWrite = 0;
      Object.values(stats?.blkio_stats).forEach((array) => {
        // Check if the array has elements
        if (Array.isArray(array) && array.length > 0) {
          // If so, iterate through each item in the array
          array.forEach((item1) => {
            if (item1.op === 'Read') {
              totalRead += item1.value; // Add read value to total read
            } else if (item1.op === 'Write') {
              totalWrite += item1.value; // Add write value to total write
            }
          });
        }
      });
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const interfaceName in stats.networks) {
        const interfaceStats = stats.networks[interfaceName];
        totalReceivedBytes += interfaceStats?.rx_bytes || 0;
        totalTransmittedBytes += interfaceStats?.tx_bytes || 0;
      }
      const networks = {
        total: {
          receivedBytes: totalReceivedBytes,
          transmittedBytes: totalTransmittedBytes
        }
      };
      const statsObject = {
        containerId: item.Id,
        status: item.Status,
        read: stats.read,
        preread: stats.preread,
        currentCPU: {
          totalUsage: stats?.cpu_stats?.cpu_usage?.total_usage || null,
          perCoreUsage: containerInfo?.HostConfig?.CpuCount || null,
          hostUsage: stats?.cpu_stats?.system_cpu_usage || null,
          cores: stats?.cpu_stats?.cpu_usage?.online_cpus || null
        },
        preCPU: {
          totalUsage: stats?.precpu_stats?.cpu_usage?.total_usage || null,
          perCoreUsage: containerInfo?.HostConfig?.CpuCount || null,
          hostUsage: stats?.precpu_stats?.system_cpu_usage || null,
          cores: stats?.precpu_stats?.cpu_usage?.online_cpus || null
        },
        memory: {
          usage: stats?.memory_stats?.usage || null,
          capacity: stats?.memory_stats?.max_usage || null
        },
        blockIo: {
          readBytes: totalRead,
          writeBytes: totalWrite
        },
        size: containerInfo?.SizeRw || 0,
        virtualSize: containerInfo?.SizeRootFs || 0,
        networks: {
          total: networks.total,
          tier: 'medium',
          bandwitdhs: {
            download: {
              value: 800,
              unit: 'Mbps'
            },
            upload: {
              value: 600,
              unit: 'Mbps'
            }
          }
        },
        pids: {
          current: stats?.pids_stats?.current || null
        },
        location: 'VN',
        refund: 0.5,
        uptime: {
          averagePercentage: 0,
          lastChecks: [
            {
              time: new Date(),
              status: 'up'
            }
          ]
        }
      };
      // console.log('startObject: ', JSON.stringify(statsObject));
      rs.push(statsObject);
      await socket.send(EventNameSocket.UsageContainerResult, {
        usage: statsObject
      });
    });
  }
};

module.exports = {
  executeCommand,
  getContainerStats,
  getStatusDocker,
  getAllContainers,
  getContainerAndImageCounts,
  createContainer,
  conntainerUsages,
  logContainer
};
