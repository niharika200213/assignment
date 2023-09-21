import { CacheContainer } from 'node-ts-cache'
import { MemoryStorage } from 'node-ts-cache-storage-memory'

const client = new CacheContainer(new MemoryStorage())


export default client;