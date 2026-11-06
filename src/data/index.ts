export type { Knowledge } from '../types.js';

import raw from './knowledge.json' with { type: 'json' };
export const knowledge = raw as import('../types.js').Knowledge;
