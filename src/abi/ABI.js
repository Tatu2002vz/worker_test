const deviceManager = process.env.DEVICEMANAGER;
const DID_ADDRESS = process.env.DID_ADDRESS;

const deviceManagerAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_addressesProviderRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deviceId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    name: "Approve",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deviceId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "Deactivate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deviceId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "Register",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deviceId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IDeviceManager.Bandwidth",
        name: "bandwidth",
        type: "uint8",
      },
    ],
    name: "UpdateBandwidth",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deviceId",
        type: "address",
      },
      { indexed: false, internalType: "string", name: "ip", type: "string" },
      {
        indexed: false,
        internalType: "uint256",
        name: "disk",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "mem", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "cpus",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "long",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "lat", type: "uint256" },
    ],
    name: "UpdateDevice",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "deviceId",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gpuType",
        type: "uint256",
      },
    ],
    name: "UpdateGpu",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "activeDeviceIdAt",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "activeDeviceIds",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "activeDeviceIdsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "activeDevideIdscontains",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "addressesProviderRegistry",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deviceId", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
      {
        internalType: "enum IDeviceManager.Bandwidth",
        name: "_bandwidth",
        type: "uint8",
      },
      {
        components: [
          { internalType: "string", name: "ip", type: "string" },
          { internalType: "uint256", name: "disk", type: "uint256" },
          { internalType: "uint256", name: "mem", type: "uint256" },
          { internalType: "uint256", name: "cpus", type: "uint256" },
          { internalType: "uint256", name: "long", type: "uint256" },
          { internalType: "uint256", name: "lat", type: "uint256" },
        ],
        internalType: "struct IDeviceManager.Device",
        name: "_device",
        type: "tuple",
      },
      { internalType: "uint256[]", name: "_gpus", type: "uint256[]" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "bandwidth",
    outputs: [
      {
        internalType: "enum IDeviceManager.Bandwidth",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "deactivate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "device",
    outputs: [
      { internalType: "string", name: "ip", type: "string" },
      { internalType: "uint256", name: "disk", type: "uint256" },
      { internalType: "uint256", name: "mem", type: "uint256" },
      { internalType: "uint256", name: "cpus", type: "uint256" },
      { internalType: "uint256", name: "long", type: "uint256" },
      { internalType: "uint256", name: "lat", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "deviceIdAt",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deviceIds",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deviceIdsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "devideIdscontains",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAddressesProvider",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCheckerGovernor",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deviceId", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "gpu",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "gpus",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deviceId", type: "address" },
      { internalType: "uint256", name: "nonce", type: "uint256" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "deviceId", type: "address" }],
    name: "registerNonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deviceId", type: "address" },
      {
        internalType: "enum IDeviceManager.Bandwidth",
        name: "_bandwidth",
        type: "uint8",
      },
    ],
    name: "updateBandwidth",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deviceId", type: "address" },
      {
        components: [
          { internalType: "string", name: "ip", type: "string" },
          { internalType: "uint256", name: "disk", type: "uint256" },
          { internalType: "uint256", name: "mem", type: "uint256" },
          { internalType: "uint256", name: "cpus", type: "uint256" },
          { internalType: "uint256", name: "long", type: "uint256" },
          { internalType: "uint256", name: "lat", type: "uint256" },
        ],
        internalType: "struct IDeviceManager.Device",
        name: "_device",
        type: "tuple",
      },
    ],
    name: "updateDevice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "deviceId", type: "address" },
      { internalType: "uint256[]", name: "_gpus", type: "uint256[]" },
    ],
    name: "updateGpus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const DID_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "validity",
        type: "uint32",
      },
    ],
    name: "AddAttribute",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
    ],
    name: "RemoveAttribte",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "validity",
        type: "uint32",
      },
    ],
    name: "UpdateAttribute",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
      {
        internalType: "uint32",
        name: "validity_for",
        type: "uint32",
      },
    ],
    name: "addAttribute",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
    ],
    name: "readAttribute",
    outputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "name",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "value",
            type: "bytes",
          },
          {
            internalType: "uint32",
            name: "validity",
            type: "uint32",
          },
          {
            internalType: "uint256",
            name: "created",
            type: "uint256",
          },
        ],
        internalType: "struct DID.Attribute",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
    ],
    name: "removeAttribute",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "did_account",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "value",
        type: "bytes",
      },
      {
        internalType: "uint32",
        name: "validity_for",
        type: "uint32",
      },
    ],
    name: "updateAttribute",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

module.exports = {
    DID_ABI
}