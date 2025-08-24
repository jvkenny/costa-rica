import AnimatedBackground from "./AnimatedBackground";

export default function RulesPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />
      <div className="landing">
        <h1 className="site-title">🌴 Expectations &amp; House Rules 🐒</h1>
        <ul className="rules-list">
          <li>Have fun</li>
          <li>Bring a buddy</li>
          <li>Don’t get in trouble</li>
        </ul>
        <button className="btn btn--rules" onClick={onBack}>Back</button>
      </div>
    </>
  );
}
