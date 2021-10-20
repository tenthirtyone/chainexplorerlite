const blockData = {
  difficulty: "12549332509227",
  extraData: "0xd783010303844765746887676f312e352e31856c696e7578",
  gasLimit: 3141592,
  gasUsed: 50244,
  hash: "0x8e38b4dbf6b11fcc3b9dee84fb7986e29ca0a02cecd8977c161ff7333329681e",
  logsBloom:
    "0x00000000000000000000000000000000000800000000000000000000000800000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000",
  miner: "0x2a65Aca4D5fC5B5C859090a6c34d164135398226",
  mixHash: "0x92c4129a0ae2361b452a9edeece55c12eceeab866316195e3d87fc1b005b6645",
  nonce: "0xcd4c55b941cf9015",
  number: 1000000,
  parentHash:
    "0xb4fbadf8ea452b139718e2700dc1135cfc81145031c84b7ab27cd710394f7b38",
  receiptsRoot:
    "0x20e3534540caf16378e6e86a2bf1236d9f876d3218fbc03958e6db1c634b2333",
  sha3Uncles:
    "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  size: 768,
  stateRoot:
    "0x0e066f3c2297a5cb300593052617d1bca5946f0caa0635fdb1b85ac7e5236f34",
  timestamp: 1455404053,
  totalDifficulty: "7135202464334937706",
  transactions: [
    "0xea1093d492a1dcb1bef708f771a99a96ff05dcab81ca76c31940300177fcf49f",
    "0xe9e91f1ee4b56c0df2e9f06c2b8c27c6076195a88a7b8537ba8313d80e6f124e",
  ],
  transactionsRoot:
    "0x65ba887fcb0826f616d01f736c1d2d677bcabde2f7fc25aa91cfbc0b3bad5cb3",
  uncles: [],
};

const transactionsData = [
  {
    blockHash:
      "0x8e38b4dbf6b11fcc3b9dee84fb7986e29ca0a02cecd8977c161ff7333329681e",
    number: 1000000,
    from: "0x39fA8c5f2793459D6622857E7D9FbB4BD91766d3",
    gas: 129244,
    gasPrice: "80525500000",
    hash: "0xea1093d492a1dcb1bef708f771a99a96ff05dcab81ca76c31940300177fcf49f",
    input: "0x",
    nonce: 21,
    r: "0xa254fe085f721c2abe00a2cd244110bfc0df5f4f25461c85d8ab75ebac11eb10",
    s: "0x30b7835ba481955b20193a703ebc5fdffeab081d63117199040cdf5a91c68765",
    to: "0xc083e9947Cf02b8FfC7D3090AE9AEA72DF98FD47",
    transactionIndex: 0,
    type: 0,
    v: "0x1c",
    value: "100000000000000000000",
  },
  {
    blockHash:
      "0x8e38b4dbf6b11fcc3b9dee84fb7986e29ca0a02cecd8977c161ff7333329681e",
    number: 1000000,
    from: "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
    gas: 50000,
    gasPrice: "60000000000",
    hash: "0xe9e91f1ee4b56c0df2e9f06c2b8c27c6076195a88a7b8537ba8313d80e6f124e",
    input: "0x",
    nonce: 17387,
    r: "0x3b08715b4403c792b8c7567edea634088bedcd7f60d9352b1f16c69830f3afd5",
    s: "0x10b9afb67d2ec8b956f0e1dbc07eb79152904f3a7bf789fc869db56320adfe09",
    to: "0xDf190dC7190dfba737d7777a163445b7Fff16133",
    transactionIndex: 1,
    type: 0,
    v: "0x1c",
    value: "437194980000000000",
  },
];

module.exports = {
  blockData,
  transactionsData,
};
