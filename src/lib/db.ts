import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DB_PATH = path.join(process.cwd(), "newsapp-data.json");

interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  gemini_api_key: string | null;
  created_at: number;
}

interface Automation {
  id: string;
  user_id: string;
  name: string;
  topic_prompt: string;
  categories: string[];
  perspective: string;
  length: string;
  frequency: string;
  active: number;
  share_code: string | null;
  created_at: number;
  updated_at: number;
}

interface Newsletter {
  id: string;
  automation_id: string;
  title: string;
  summary_html: string;
  sources: { url: string; title: string; outlet: string; lean: string }[];
  article_hashes: string[];
  generated_at: number;
}

interface DbData {
  users: User[];
  automations: Automation[];
  newsletters: Newsletter[];
}

function load(): DbData {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    }
  } catch { /* corrupted file, start fresh */ }
  return { users: [], automations: [], newsletters: [] };
}

function save(data: DbData) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  async ensure() {
    // no-op — JSON file needs no async init
  },

  createUser(email: string, passwordHash: string, name: string) {
    const data = load();
    const user: User = {
      id: randomUUID(),
      email,
      password_hash: passwordHash,
      name,
      gemini_api_key: null,
      created_at: Math.floor(Date.now() / 1000),
    };
    data.users.push(user);
    save(data);
    return { id: user.id, email: user.email, name: user.name };
  },

  getUserByEmail(email: string) {
    const data = load();
    return data.users.find((u) => u.email === email) || undefined;
  },

  getUserById(id: string) {
    const data = load();
    const u = data.users.find((u) => u.id === id);
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, created_at: u.created_at };
  },

  setGeminiApiKey(userId: string, key: string) {
    const data = load();
    const u = data.users.find((u) => u.id === userId);
    if (u) { u.gemini_api_key = key || null; save(data); }
  },

  getGeminiApiKey(userId: string): string | null {
    const data = load();
    const u = data.users.find((u) => u.id === userId);
    return u?.gemini_api_key || null;
  },

  hasGeminiApiKey(userId: string): boolean {
    const key = this.getGeminiApiKey(userId);
    return !!key && key.length > 0;
  },

  createAutomation(userId: string, input: {
    name: string;
    topic_prompt: string;
    categories: string[];
    perspective: string;
    length: string;
    frequency: string;
  }) {
    const data = load();
    const now = Math.floor(Date.now() / 1000);
    const a: Automation = {
      id: randomUUID(),
      user_id: userId,
      name: input.name,
      topic_prompt: input.topic_prompt,
      categories: input.categories,
      perspective: input.perspective,
      length: input.length,
      frequency: input.frequency,
      active: 1,
      share_code: null,
      created_at: now,
      updated_at: now,
    };
    data.automations.push(a);
    save(data);
    return { ...a };
  },

  getAutomation(id: string, userId: string) {
    const data = load();
    return data.automations.find((a) => a.id === id && a.user_id === userId) || undefined;
  },

  getAutomationById(id: string) {
    const data = load();
    return data.automations.find((a) => a.id === id) || undefined;
  },

  listAutomations(userId: string) {
    const data = load();
    return data.automations
      .filter((a) => a.user_id === userId)
      .sort((a, b) => b.updated_at - a.updated_at);
  },

  updateAutomation(id: string, userId: string, updates: Partial<{
    name: string;
    topic_prompt: string;
    categories: string[];
    perspective: string;
    length: string;
    frequency: string;
    active: number;
  }>) {
    const data = load();
    const a = data.automations.find((a) => a.id === id && a.user_id === userId);
    if (!a) return undefined;

    if (updates.name !== undefined) a.name = updates.name;
    if (updates.topic_prompt !== undefined) a.topic_prompt = updates.topic_prompt;
    if (updates.categories !== undefined) a.categories = updates.categories;
    if (updates.perspective !== undefined) a.perspective = updates.perspective;
    if (updates.length !== undefined) a.length = updates.length;
    if (updates.frequency !== undefined) a.frequency = updates.frequency;
    if (updates.active !== undefined) a.active = updates.active;
    a.updated_at = Math.floor(Date.now() / 1000);

    save(data);
    return { ...a };
  },

  deleteAutomation(id: string, userId: string) {
    const data = load();
    data.automations = data.automations.filter((a) => !(a.id === id && a.user_id === userId));
    data.newsletters = data.newsletters.filter((n) => n.automation_id !== id);
    save(data);
  },

  setShareCode(automationId: string, userId: string, code: string) {
    const data = load();
    const a = data.automations.find((a) => a.id === automationId && a.user_id === userId);
    if (a) { a.share_code = code; save(data); }
  },

  getAutomationByShareCode(code: string) {
    const data = load();
    return data.automations.find((a) => a.share_code === code) || undefined;
  },

  createNewsletter(automationId: string, input: {
    title: string;
    summary_html: string;
    sources: { url: string; title: string; outlet: string; lean: string }[];
    article_hashes: string[];
  }) {
    const data = load();
    const n: Newsletter = {
      id: randomUUID(),
      automation_id: automationId,
      title: input.title,
      summary_html: input.summary_html,
      sources: input.sources,
      article_hashes: input.article_hashes,
      generated_at: Math.floor(Date.now() / 1000),
    };
    data.newsletters.push(n);
    save(data);
    return { ...n };
  },

  getNewsletter(id: string) {
    const data = load();
    return data.newsletters.find((n) => n.id === id) || undefined;
  },

  listNewsletters(automationId: string) {
    const data = load();
    return data.newsletters
      .filter((n) => n.automation_id === automationId)
      .sort((a, b) => b.generated_at - a.generated_at)
      .map((n) => ({ id: n.id, automation_id: n.automation_id, title: n.title, generated_at: n.generated_at }));
  },

  getRecentArticleHashes(automationId: string, days: number = 7): string[] {
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
    const data = load();
    const hashes = new Set<string>();
    for (const n of data.newsletters) {
      if (n.automation_id === automationId && n.generated_at > cutoff) {
        for (const h of n.article_hashes) hashes.add(h);
      }
    }
    return Array.from(hashes);
  },
};
