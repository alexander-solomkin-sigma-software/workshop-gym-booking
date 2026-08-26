import { useCallback, useEffect, useState } from 'react';
import { createClass, getClasses, scheduleSession, setCapacity } from '../api.js';
import type { ClassWithSessions } from '../types.js';

/** Admin view: create classes, schedule sessions, adjust capacity. */
export function AdminPage() {
  const [classes, setClasses] = useState<ClassWithSessions[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setClasses(await getClasses());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onCreateClass(ev: React.FormEvent) {
    ev.preventDefault();
    await run(async () => {
      await createClass(name, description);
      setName('');
      setDescription('');
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Manage classes</h2>
      {error && (
        <div role="alert" className="alert alert-error mb-3">
          {error}
        </div>
      )}

      <form onSubmit={onCreateClass} className="flex flex-wrap items-end gap-2 mb-4">
        <input
          aria-label="class name"
          className="input input-bordered input-sm"
          placeholder="Class name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          aria-label="class description"
          className="input input-bordered input-sm flex-1 min-w-40"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="btn btn-sm btn-primary">
          Add class
        </button>
      </form>

      <div className="space-y-4">
        {classes.map((c) => (
          <div key={c.id} className="card bg-base-100 shadow">
            <div className="card-body p-4 gap-2">
              <h3 className="card-title text-base">{c.name}</h3>
              <p className="text-sm opacity-60">{c.description}</p>
              <ScheduleForm classId={c.id} onDone={refresh} onError={setError} />
              <ul className="mt-1 space-y-1">
                {c.sessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span>
                      {new Date(s.startsAt).toLocaleString()} — capacity {s.capacity} (booked{' '}
                      {s.booked})
                    </span>
                    <CapacityEditor
                      sessionId={s.id}
                      current={s.capacity}
                      onDone={refresh}
                      onError={setError}
                    />
                  </li>
                ))}
                {c.sessions.length === 0 && (
                  <li className="text-sm opacity-60">No sessions yet.</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScheduleForm({
  classId,
  onDone,
  onError,
}: {
  classId: number;
  onDone: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [startsAt, setStartsAt] = useState('');
  const [capacity, setCapacity] = useState('10');

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    try {
      const iso = new Date(startsAt).toISOString();
      await scheduleSession(classId, iso, Number(capacity));
      setStartsAt('');
      await onDone();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <input
        type="datetime-local"
        className="input input-bordered input-sm"
        aria-label={`schedule session for class ${classId}`}
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        required
      />
      <input
        type="number"
        min={1}
        className="input input-bordered input-sm w-24"
        aria-label={`capacity for new session of class ${classId}`}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />
      <button type="submit" className="btn btn-sm">
        Schedule
      </button>
    </form>
  );
}

function CapacityEditor({
  sessionId,
  current,
  onDone,
  onError,
}: {
  sessionId: number;
  current: number;
  onDone: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [value, setValue] = useState(String(current));

  async function save() {
    try {
      await setCapacity(sessionId, Number(value));
      await onDone();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <span className="join">
      <input
        type="number"
        min={1}
        className="join-item input input-bordered input-xs w-20"
        aria-label={`set capacity for session ${sessionId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="join-item btn btn-xs" onClick={save}>
        Set
      </button>
    </span>
  );
}
