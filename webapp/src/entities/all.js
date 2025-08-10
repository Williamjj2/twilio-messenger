export const API = {
  async get(path, params) {
    const url = new URL(path, window.location.origin);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { credentials: 'same-origin' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async put(path, body, params) {
    const url = new URL(path, window.location.origin);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString(), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export const Contact = {
  async list() { return API.get('/api/entities/contacts'); },
  async filter(query) { return API.get('/api/entities/contacts', query); },
  async create(data) { return API.post('/api/entities/contacts', data); },
  async update(id, data) { return API.put('/api/entities/contacts', data, { id }); },
};

export const Conversation = {
  async list(order) { return API.get('/api/entities/conversations', { order: order || 'last_message_time' }); },
  async filter(query) { return API.get('/api/entities/conversations', query); },
  async create(data) { return API.post('/api/entities/conversations', data); },
  async update(id, data) { return API.put('/api/entities/conversations', data, { id }); },
};

export const Message = {
  async filter(query) { return API.get('/api/entities/messages', query); },
  async create(data) { return API.post('/api/entities/messages', data); },
};

export const User = {
  async me() { return API.get('/api/entities/users'); },
  async updateMyUserData(data) { return API.put('/api/entities/users', data); },
};


