"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_ts_cache_1 = require("node-ts-cache");
const node_ts_cache_storage_memory_1 = require("node-ts-cache-storage-memory");
const client = new node_ts_cache_1.CacheContainer(new node_ts_cache_storage_memory_1.MemoryStorage());
exports.default = client;
//# sourceMappingURL=cacheService.js.map