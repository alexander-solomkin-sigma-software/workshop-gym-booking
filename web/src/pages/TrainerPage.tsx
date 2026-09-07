import { useCallback, useEffect, useState } from 'react';
import { getTrainerSessions } from '../api.js';
import type { TrainerSessionEntry } from '../types.js';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** A session's start–finish range, e.g. "Tue Sep 1, 08:00–09:00". */
function formatRange(startsAt: string, endsAt: string): string {
  return `${formatWhen(startsAt)}–${formatTime(endsAt)}`;
}

/**
 * Trainer view: read-only list of the acting trainer's assigned sessions, each
 * with its roster (booked member ids) and count. An unknown/blank trainer id
 * shows a "no sessions assigned" empty state (UC-03 A1/A2).
 */
export function TrainerPage({ trainerId }: { trainerId: string }) {
  const [entries, setEntries] = useState<TrainerSessionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const id = trainerId.trim();
    if (!id) {
      setEntries([]);
      return;
    }
    try {
      setEntries(await getTrainerSessions(id));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [trainerId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Trainer</h2>
      {error && (
        <div role="alert" className="alert alert-error mb-3">
          {error}
        </div>
      )}

      {entries.length === 0 ? (
        <p className="opacity-60">No sessions assigned.</p>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table">
            <thead>
              <tr>
                <th>Class</th>
                <th>When</th>
                <th>Roster</th>
                <th>Booked</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.sessionId} data-session={e.sessionId}>
                  <td className="font-medium">{e.className}</td>
                  <td className="whitespace-nowrap">{formatRange(e.startsAt, e.endsAt)}</td>
                  <td>
                    {e.roster.length > 0 ? (
                      e.roster.join(', ')
                    ) : (
                      <span className="opacity-60">— empty —</span>
                    )}
                  </td>
                  <td>{e.booked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
