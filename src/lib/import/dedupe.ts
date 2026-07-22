export function normalizeName(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export type PlayerLite = { id: string; first_name: string; last_name: string };

/** Exact normalized first+last name match — the only dedupe signal we have from a CSV. */
export function findPlayerMatch(
  firstName: string,
  lastName: string,
  players: PlayerLite[],
): PlayerLite | null {
  const fn = normalizeName(firstName);
  const ln = normalizeName(lastName);
  if (!fn || !ln) return null;
  return players.find((p) => normalizeName(p.first_name) === fn && normalizeName(p.last_name) === ln) ?? null;
}
