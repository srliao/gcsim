import type { db } from "@gcsim/types";
import raw from "./entries.json";

/**
 * 48 real DB entries snapshotted from gcsim.app (varied teams, submitters, and
 * tags 1/5/6/7/8/9). Heavy per-character `stats`/`snapshot` arrays were trimmed;
 * everything DBCard and the surfaces read is intact. This keeps the archive
 * rendering offline and deterministic.
 */
export const ARCHIVED_ENTRIES = raw as unknown as db.Entry[];

const QUERY = {
	query: {},
	limit: 25,
	sort: { create_date: -1 },
};

/**
 * Live fetch through the vite `/api` proxy. Returns null on any failure so the
 * caller can fall back to the archived fixture.
 */
export async function fetchLiveEntries(): Promise<db.Entry[] | null> {
	try {
		const res = await fetch(
			`/api/db?q=${encodeURIComponent(JSON.stringify(QUERY))}`,
		);
		if (!res.ok) return null;
		const body = (await res.json()) as { data?: db.Entry[] };
		if (!body?.data?.length) return null;
		return body.data;
	} catch {
		return null;
	}
}
