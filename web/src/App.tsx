import { useState } from 'react';
import { TimetablePage } from './pages/TimetablePage.js';
import { AdminPage } from './pages/AdminPage.js';

type View = 'timetable' | 'admin';

/** App shell: a left sidebar (title, nav menu, member field) beside the content area. */
export function App() {
  const [view, setView] = useState<View>('timetable');
  const [memberId, setMemberId] = useState('m1');

  return (
    <div className="min-h-screen flex bg-base-100">
      <aside className="w-64 shrink-0 bg-base-200 border-r border-base-300 flex flex-col p-4 gap-4">
        <span className="text-xl font-semibold px-2">Gym Class Booking</span>

        <ul className="menu w-full gap-1">
          <li>
            <button
              className={view === 'timetable' ? 'menu-active' : ''}
              aria-current={view === 'timetable' ? 'page' : undefined}
              onClick={() => setView('timetable')}
            >
              Timetable
            </button>
          </li>
          <li>
            <button
              className={view === 'admin' ? 'menu-active' : ''}
              aria-current={view === 'admin' ? 'page' : undefined}
              onClick={() => setView('admin')}
            >
              Admin
            </button>
          </li>
        </ul>

        <div className="mt-auto">
          <label className="form-control w-full">
            <div className="label pb-1">
              <span className="label-text">Acting as</span>
            </div>
            <input
              aria-label="member id"
              className="input input-bordered input-sm w-full"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
            <div className="label pt-1">
              <span className="label-text-alt opacity-60">
                Demo stand-in for sign-in — no real authentication. Change it to act as a
                different member.
              </span>
            </div>
          </label>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 bg-base-100">
        <div className="max-w-4xl mx-auto">
          {view === 'timetable' ? <TimetablePage memberId={memberId} /> : <AdminPage />}
        </div>
      </main>
    </div>
  );
}
