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
        <label className="form-control">
          <div className="label py-1">
            <span className="label-text">Class name</span>
          </div>
          <input
            aria-label="class name"
            className="input input-bordered input-sm"
            placeholder="Class name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="form-control flex-1 min-w-40">
          <div className="label py-1">
            <span className="label-text">Description</span>
          </div>
          <input
            aria-label="class description"
            className="input input-bordered input-sm w-full"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
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
                      {new Date(s.startsAt).toLocaleString()}–
                      {new Date(s.endsAt).toLocaleTimeString()} — capacity {s.capacity} (booked{' '}
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
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [trainer, setTrainer] = useState('');

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    try {
      // Compose start/finish ISO timestamps from the shared date + each time.
      // Sharing one date picker makes a session structurally single-day; the
      // server still re-validates all scheduling rules.
      const startIso = new Date(`${date}T${startTime}`).toISOString();
      const endIso = new Date(`${date}T${finishTime}`).toISOString();
      await scheduleSession(classId, startIso, endIso, Number(capacity), trainer.trim() || undefined);
      setDate('');
      setStartTime('');
      setFinishTime('');
      setTrainer('');
      await onDone();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="form-control">
        <div className="label py-1">
          <span className="label-text">Date</span>
        </div>
        <input
          type="date"
          className="input input-bordered input-sm"
          aria-label={`session date for class ${classId}`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <label className="form-control">
        <div className="label py-1">
          <span className="label-text">Start time</span>
        </div>
        <input
          type="time"
          className="input input-bordered input-sm"
          aria-label={`start time for class ${classId}`}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </label>
      <label className="form-control">
        <div className="label py-1">
          <span className="label-text">Finish time</span>
        </div>
        <input
          type="time"
          className="input input-bordered input-sm"
          aria-label={`finish time for class ${classId}`}
          value={finishTime}
          onChange={(e) => setFinishTime(e.target.value)}
          required
        />
      </label>
      <label className="form-control">
        <div className="label py-1">
          <span className="label-text">Capacity</span>
        </div>
        <input
          type="number"
          min={1}
          className="input input-bordered input-sm w-24"
          aria-label={`capacity for new session of class ${classId}`}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </label>
      <label className="form-control">
        <div className="label py-1">
          <span className="label-text">Trainer (optional)</span>
        </div>
        <input
          type="text"
          className="input input-bordered input-sm w-32"
          aria-label={`trainer for new session of class ${classId}`}
          placeholder="e.g. t-morgan"
          value={trainer}
          onChange={(e) => setTrainer(e.target.value)}
        />
      </label>
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
    <span className="inline-flex items-center gap-1">
      <span className="text-xs opacity-60">Capacity</span>
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
    </span>
  );
}
