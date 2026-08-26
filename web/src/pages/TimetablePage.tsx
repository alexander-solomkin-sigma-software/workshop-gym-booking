import { useCallback, useEffect, useState } from 'react';
import { book, cancel, getTimetable } from '../api.js';
import type { TimetableEntry } from '../types.js';

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

/** Member timetable: browse sessions, book a free spot, cancel own booking. */
export function TimetablePage({ memberId }: { memberId: string }) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setEntries(await getTimetable(memberId));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [memberId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onBook(sessionId: number) {
    setBusy(sessionId);
    setError(null);
    try {
      await book(sessionId, memberId);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function onCancel(bookingId: number) {
    setBusy(bookingId);
    setError(null);
    try {
      await cancel(bookingId, memberId);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Timetable</h2>
      {error && (
        <div role="alert" className="alert alert-error mb-3">
          {error}
        </div>
      )}
      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Class</th>
              <th>When</th>
              <th>Spots left</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.sessionId} data-session={e.sessionId}>
                <td>
                  <div className="font-medium">{e.className}</div>
                  <div className="text-sm opacity-60">{e.description}</div>
                </td>
                <td className="whitespace-nowrap">{formatRange(e.startsAt, e.endsAt)}</td>
                <td>
                  {e.spotsLeft} / {e.capacity}
                  {e.isFull && <span className="badge badge-error badge-sm ml-2">Full</span>}
                </td>
                <td>
                  {e.myBookingId !== null ? (
                    <button
                      className="btn btn-sm btn-outline"
                      disabled={busy !== null}
                      onClick={() => onCancel(e.myBookingId!)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={busy !== null || e.isFull}
                      onClick={() => onBook(e.sessionId)}
                    >
                      Book
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
