const RADIUS = 90;
const CIRC = 2 * Math.PI * RADIUS;
const PROGRESS = 0.42;

export default function LandingTimerDemo() {
  const offset = CIRC * (1 - PROGRESS);

  return (
    <div className="demo-wrap" aria-hidden="true">
      <div className="demo-card card">
        <div className="demo-head">
          <span className="demo-dot demo-dot-on" />
          <span className="demo-dot" />
          <span className="demo-dot" />
        </div>
        <div className="demo-body">
          <div className="demo-ring-wrap">
            <svg width="220" height="220" viewBox="0 0 220 220" className="timer-svg">
              <circle cx="110" cy="110" r={RADIUS} fill="none" strokeWidth="5" className="timer-track" />
              <circle
                cx="110"
                cy="110"
                r={RADIUS}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
                className="timer-ring timer-ring-focus"
              />
            </svg>
            <div className="timer-readout">
              <span className="demo-time">14:30</span>
              <span className="timer-tag timer-tag-focus">Focus</span>
            </div>
          </div>
          <div className="demo-stats">
            <div className="demo-stat">
              <span className="demo-stat-val">3</span>
              <span className="demo-stat-label">Today</span>
            </div>
            <div className="demo-stat">
              <span className="demo-stat-val">12</span>
              <span className="demo-stat-label">Week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
