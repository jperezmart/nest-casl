import type { RawRuleOf } from '@casl/ability';
import { createMongoAbility } from '@casl/ability';
import type { PackRule } from '@casl/ability/extra';
import { unpackRules } from '@casl/ability/extra';

import type { AppAbility } from './ability.js';

/**
 * Base URL of the example-rest API. Defaults to the same-origin `/api` prefix,
 * which Vite proxies to the backend (see `vite.config.ts`). Override with
 * `VITE_API_URL` to hit a backend directly.
 */
export const API_URL = import.meta.env['VITE_API_URL'] ?? '/api';

export interface DemoUser {
  id: string;
  name: string;
  roles: string[];
}

export interface Article {
  id: string;
  title: string;
  authorId: string;
  published: boolean;
}

function authHeaders(user: DemoUser): HeadersInit {
  return {
    'x-user-id': user.id,
    'x-user-roles': user.roles.join(','),
    'content-type': 'application/json',
  };
}

export async function fetchUsers(): Promise<DemoUser[]> {
  const response = await fetch(`${API_URL}/users`);
  return response.json() as Promise<DemoUser[]>;
}

export async function fetchArticles(user: DemoUser): Promise<Article[]> {
  const response = await fetch(`${API_URL}/articles`, {
    headers: authHeaders(user),
  });
  return response.json() as Promise<Article[]>;
}

/** Fetch the user's packed rules and rebuild a client-side ability. */
export async function fetchAbility(user: DemoUser): Promise<{
  ability: AppAbility;
  rawRules: PackRule<RawRuleOf<AppAbility>>[];
}> {
  const response = await fetch(`${API_URL}/me/abilities`, {
    headers: authHeaders(user),
  });
  const data = (await response.json()) as {
    rules: PackRule<RawRuleOf<AppAbility>>[];
  };
  const ability = createMongoAbility(unpackRules(data.rules));
  return { ability, rawRules: data.rules };
}

export interface ApiResult {
  status: number;
  body: unknown;
}

/** Call a mutating endpoint and return the raw status + body for the activity log. */
export async function callApi(
  user: DemoUser,
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<ApiResult> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(user),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw text */
  }
  return { status: response.status, body: parsed };
}
