import AnimatedBackground from "./AnimatedBackground";

export default function LandingPage({ onEnter, onShowTips, onShowRules }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">Costa Rica Trip 2025</h1>

        {/* New intro wrapper limits line length and organizes content */}
        <div className="landing__intro">
          <p className="lead">
            Welcome! This mini-site has everything we need for a smooth trip.
          </p>
          <div className="intro-list">
            <p>🗓️ <strong>Activities</strong> — the day-by-day plan sent to the concierge.</p>
            <p>🌴 <strong>Tips & Coordination</strong> — flights, money, rides, packing, and local basics.</p>
            <p>🛡️ <strong>Rules & Expectations</strong> — safety guidelines and group norms so everyone has fun.</p>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn--tips" onClick={onShowTips}>🌴 Tips & Coordination</button>
          <button className="btn btn--rules" onClick={onShowRules}>🛡️ Rules & Expectations</button>
          <button className="btn btn--schedule" onClick={onEnter}>🗓️ Activity Schedule</button>
        </div>
      </div>
    </>
  );
}
