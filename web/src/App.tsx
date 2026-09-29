import { useState } from 'react';
import { TimetablePage } from './pages/TimetablePage.js';
import { AdminPage } from './pages/AdminPage.js';
import { TrainerPage } from './pages/TrainerPage.js';
import { TRAINERS, USERS, VIEWS_BY_ROLE, VIEW_LABELS, type View } from './users.js';

/** App shell: a left sidebar (title, nav menu, acting-as picker) beside the content area. */
export function App() {
  const [userId, setUserId] = useState(USERS[0].id);
  const [picked, setPicked] = useState<View>('timetable');
  const [viewedTrainerId, setViewedTrainerId] = useState(TRAINERS[0].id);

  const user = USERS.find((u) => u.id === userId) ?? USERS[0];
  const allowed = VIEWS_BY_ROLE[user.role];
  // Switching to a role that cannot see the picked page falls back to its first.
  const view = allowed.includes(picked) ? picked : allowed[0];

  // A trainer acts as themselves; an admin may read any trainer's roster.
  const isAdmin = user.role === 'admin';
  const trainerId = isAdmin ? viewedTrainerId : user.id;

  return (
    <div className="min-h-screen flex bg-base-100">
      <aside className="w-64 shrink-0 bg-base-200 border-r border-base-300 flex flex-col p-4 gap-4">
        <span className="text-xl font-semibold px-2">Gym Class Booking</span>

        <ul className="menu w-full gap-1">
          {allowed.map((v) => (
            <li key={v}>
              <button
                className={view === v ? 'menu-active' : ''}
                aria-current={view === v ? 'page' : undefined}
                onClick={() => setPicked(v)}
              >
                {VIEW_LABELS[v]}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3">
          <label className="form-control w-full">
            <div className="label pb-1">
              <span className="label-text">Acting as</span>
            </div>
            <select
              aria-label="acting as"
              className="select select-bordered select-sm w-full"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <optgroup label="Members">
                {USERS.filter((u) => u.role === 'member').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Trainers">
                {TRAINERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Admins">
                {USERS.filter((u) => u.role === 'admin').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="label pt-1">
              <span className="label-text-alt opacity-60">
                Demo stand-in for sign-in — no real authentication. Pick who you are; the menu
                shows only that role&rsquo;s pages.
              </span>
            </div>
          </label>

          {isAdmin && view === 'trainer' && (
            <label className="form-control w-full">
              <div className="label pb-1">
                <span className="label-text">Viewing trainer</span>
              </div>
              <select
                aria-label="trainer id"
                className="select select-bordered select-sm w-full"
                value={viewedTrainerId}
                onChange={(e) => setViewedTrainerId(e.target.value)}
              >
                {TRAINERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="label pt-1">
                <span className="label-text-alt opacity-60">
                  Whose sessions and rosters to read.
                </span>
              </div>
            </label>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 bg-base-100">
        <div className="max-w-4xl mx-auto">
          {view === 'timetable' && <TimetablePage memberId={user.id} />}
          {view === 'admin' && <AdminPage />}
          {view === 'trainer' && <TrainerPage trainerId={trainerId} />}
        </div>
      </main>
    </div>
  );
}
