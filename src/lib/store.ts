import { writable, type Writable } from 'svelte/store';
import type { SchemaType } from './load';

export const file: Writable<SchemaType | null> = writable(null);
