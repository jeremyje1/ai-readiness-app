// Simple placeholder implementation bootstrap helpers.
// In production replace with persistent storage (DB) integration.

export interface PlaceholderInstitution {
  id: string;
  type: 'highered' | 'k12';
  name: string;
  contactEmail?: string;
  createdAt: string;
}

const higherEdStore = new Map<string, PlaceholderInstitution>();
const k12Store = new Map<string, PlaceholderInstitution>();

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createPlaceholderHigherEdInstitution(email?: string) {
  const id = generateId('inst');
  const record: PlaceholderInstitution = {
    id,
    type: 'highered',
    name: 'New Higher Ed Institution',
    contactEmail: email,
    createdAt: new Date().toISOString(),
  };
  higherEdStore.set(id, record);
  return record;
}

export function createPlaceholderK12School(email?: string) {
  const id = generateId('school');
  const record: PlaceholderInstitution = {
    id,
    type: 'k12',
    name: 'New K12 School',
    contactEmail: email,
    createdAt: new Date().toISOString(),
  };
  k12Store.set(id, record);
  return record;
}

export function getPlaceholderInstitution(id: string) {
  return higherEdStore.get(id) || k12Store.get(id);
}

export function getAllHigherEdInstitutions() {
  return Array.from(higherEdStore.values());
}

export function getAllK12Schools() {
  return Array.from(k12Store.values());
}

export function getAllInstitutions() {
  return [
    ...Array.from(higherEdStore.values()),
    ...Array.from(k12Store.values())
  ];
}
