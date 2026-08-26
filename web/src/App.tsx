import { useState } from 'react';
import { TimetablePage } from './pages/TimetablePage.js';
import { AdminPage } from './pages/AdminPage.js';

type Tab = 'timetable' | 'admin';

/** App shell: a member id (no real auth) and two tabs — member timetable and admin. */
export function App() {
  const [tab, setTab] = useState<Tab>('timetable');
  const [memberId, setMemberId] = useState('m1');

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow px-4 gap-2">
        <div className="flex-1">
          <span className="text-xl font-semibold">Gym Class Booking</span>
        </div>
        <div role="tablist" className="tabs tabs-boxed">
          <button
            role="tab"
            className={`tab ${tab === 'timetable' ? 'tab-active' : ''}`}
            onClick={() => setTab('timetable')}
          >
            Timetable
          </button>
          <button
            role="tab"
            className={`tab ${tab === 'admin' ? 'tab-active' : ''}`}
            onClick={() => setTab('admin')}
          >
            Admin
          </button>
        </div>
        <label className="ml-2 flex items-center gap-2 text-sm">
          Member
          <input
            aria-label="member id"
            className="input input-bordered input-sm w-24"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        </label>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        {tab === 'timetable' ? <TimetablePage memberId={memberId} /> : <AdminPage />}
      </main>
    </div>
  );
}
