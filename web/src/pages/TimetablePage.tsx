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
      <h2>Timetable</h2>
      {error && <p className="error" role="alert">{error}</p>}
      <table>
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
                <strong>{e.className}</strong>
                <div className="muted">{e.description}</div>
              </td>
              <td>{formatWhen(e.startsAt)}</td>
              <td>
                {e.spotsLeft} / {e.capacity}
                {e.isFull && <span className="tag full">Full</span>}
              </td>
              <td>
                {e.myBookingId !== null ? (
                  <button
                    className="cancel"
                    disabled={busy !== null}
                    onClick={() => onCancel(e.myBookingId!)}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    className="book"
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
    </section>
  );
}
