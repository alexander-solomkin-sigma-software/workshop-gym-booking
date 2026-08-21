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
      <h2>Manage classes</h2>
      {error && <p className="error" role="alert">{error}</p>}

      <form onSubmit={onCreateClass} className="new-class">
        <input
          aria-label="class name"
          placeholder="Class name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          aria-label="class description"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add class</button>
      </form>

      {classes.map((c) => (
        <div key={c.id} className="class-card">
          <h3>{c.name}</h3>
          <p className="muted">{c.description}</p>
          <ScheduleForm classId={c.id} onDone={refresh} onError={setError} />
          <ul>
            {c.sessions.map((s) => (
              <li key={s.id}>
                {new Date(s.startsAt).toLocaleString()} — capacity {s.capacity} (booked {s.booked}){' '}
                <CapacityEditor
                  sessionId={s.id}
                  current={s.capacity}
                  onDone={refresh}
                  onError={setError}
                />
              </li>
            ))}
            {c.sessions.length === 0 && <li className="muted">No sessions yet.</li>}
          </ul>
        </div>
      ))}
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
    <form onSubmit={submit} className="schedule">
      <input
        type="datetime-local"
        aria-label={`schedule session for class ${classId}`}
        value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)}
        required
      />
      <input
        type="number"
        min={1}
        aria-label={`capacity for new session of class ${classId}`}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />
      <button type="submit">Schedule</button>
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
    <span className="capacity-editor">
      <input
        type="number"
        min={1}
        aria-label={`set capacity for session ${sessionId}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={save}>Set</button>
    </span>
  );
}
