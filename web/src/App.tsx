import { useState } from 'react';
import { TimetablePage } from './pages/TimetablePage.js';
import { AdminPage } from './pages/AdminPage.js';

type Tab = 'timetable' | 'admin';

/** App shell: a member id (no real auth) and two tabs — member timetable and admin. */
export function App() {
  const [tab, setTab] = useState<Tab>('timetable');
  const [memberId, setMemberId] = useState('m1');

  return (
    <div className="app">
      <header>
        <h1>Gym Class Booking</h1>
        <nav>
          <button
            className={tab === 'timetable' ? 'active' : ''}
            onClick={() => setTab('timetable')}
          >
            Timetable
          </button>
          <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}>
            Admin
          </button>
        </nav>
        <label className="member">
          Member&nbsp;
          <input
            aria-label="member id"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        </label>
      </header>

      <main>{tab === 'timetable' ? <TimetablePage memberId={memberId} /> : <AdminPage />}</main>
    </div>
  );
}
