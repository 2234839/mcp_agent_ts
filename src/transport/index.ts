import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

export const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
