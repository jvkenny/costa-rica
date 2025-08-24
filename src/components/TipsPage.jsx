import AnimatedBackground from "./AnimatedBackground";
import RouteMap from "./RouteMap";

export default function TipsPage({ onBack }) {
  return (
    <>
      <AnimatedBackground />

      <div className="container">
        {/* Page header to match your schedule page feel */}
        <header className="site-header" style={{ position: "static", margin: "0 0 18px" }}>
          <div className="site-header__titles">
            <h1 className="site-title">General Tips & Coordination</h1>
            <p className="site-subtitle">
              Quick reference for getting around, meals, and the villa location.
            </p>
          </div>
          <p className="site-explainer">
            Save offline maps, skim transport & meals, and open the driving route from SJO to Casa de las Brisas.
          </p>
          <div className="site-header__actions">
            <div className="actions__group">
              <button className="btn btn--rules" onClick={onBack}>Back</button>
              <a
                className="btn btn--primary"
                href="https://www.google.com/maps/dir/?api=1&origin=9.998,-84.204&destination=9.414,-84.158&travelmode=driving"
                target="_blank"
                rel="noreferrer"
              >
                Open Directions
              </a>
            </div>
          </div>
        </header>

        {/* Content grid */}
        <div className="info-grid">
          {/* Map card */}
          <section className="info-card info-card--map">
            <div className="kicker">Getting There</div>
            <h2 className="info-title">SJO → Casa de las Brisas</h2>
            <RouteMap height={360} />
            <div className="chip-row">
              <span className="chip">Drive ~2.5–3.5 hrs (typical)</span>
              <a
                className="chip chip--link"
                href="https://www.google.com/maps/dir/?api=1&origin=9.998,-84.204&destination=9.414,-84.158&travelmode=driving"
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps ↗
              </a>
              <a
                className="chip chip--link"
                href="https://maps.app.goo.gl/7hv1DHTUxeMLCNot8?g_st=a"
                target="_blank"
                rel="noreferrer"
              >
                Villa Pin ↗
              </a>
            </div>
            <p className="muted">
              Tip: Download offline maps for San José, Quepos, and Manuel Antonio before traveling.
            </p>
          </section>

          {/* Transportation */}
          <section className="info-card">
            <div className="kicker">Logistics</div>
            <h2 className="info-title">Transportation</h2>
            <p>
              <strong>Arrival Shuttle (8/30):</strong> One shuttle will pick up the full group from SJO and depart
              <em> after the last flight lands</em>. Cost is <strong>$27 per person</strong> (have small bills).
            </p>
            <p>
              <strong>Early Arrivals:</strong> If you’re in San José before 8/30, we’ll post the meetup spot/time in the chat once scheduled.
            </p>
            <p>
              <strong>Share Flight Details:</strong> Post airline + flight # + ETA in the group chat to help the shuttle coordinator track arrivals.
            </p>
            <p>
              <strong>Backup Plan:</strong> If delayed or separated, share your live location in the chat and head to the posted meeting point.
            </p>
            <p>
              <strong>Local Rides:</strong> In town, use official taxis, rideshare, or pre-arranged shuttles. Avoid walking alone on unlit roads at night.
            </p>
            <p>
              <strong>Navigation:</strong> Save the villa pin and download offline maps for Manuel Antonio / Quepos.
            </p>
          </section>

          {/* Meals */}
          <section className="info-card">
            <div className="kicker">At the Villa</div>
            <h2 className="info-title">Meals</h2>
            <p>
              <strong>Breakfast &amp; Lunch:</strong> On your own or with your activity group. Many tours include a meal—check your confirmation.
            </p>
            <p>
              <strong>Dinner Plan:</strong> We’ll set up a daily <em>cook signup</em> at the house. The volunteer cook posts the planned meal; others opt in. Costs split among participants.
            </p>
            <p>
              <strong>Chef Nights:</strong> Chef service is included (food cost extra). We’ll use the chef on <strong>8/30</strong> and one additional night (TBD).
            </p>
            <p>
              <strong>Grocery Run:</strong> We’ll coordinate an initial stock-up (water, snacks, breakfast/lunch basics) and track shared expenses.
            </p>
            <p>
              <strong>Dietary Notes:</strong> Please share allergies/preferences in the chat so cooks can plan.
            </p>
          </section>

          {/* Location notes */}
          <section className="info-card info-card--span2">
            <div className="kicker">Neighborhood</div>
            <h2 className="info-title">Casa de las Brisas — Notes</h2>
            <p>
              <strong>Villa Layout:</strong> Large, multi-level home with multiple pools, expansive decks, and jungle/ocean views. Be mindful on stairs and wet surfaces.
            </p>
            <p>
              <strong>Proximity:</strong> Short drive to beaches, town, and Manuel Antonio National Park—plan rides for early entries and dinners.
            </p>
            <p>
              <strong>Wildlife:</strong> Expect monkeys, iguanas, and birds—don’t leave food unattended on balconies; keep doors closed when not in use.
            </p>
            <p>
              <strong>Quiet Hours:</strong> Sound carries—please be considerate on decks and near bedrooms late at night/early morning.
            </p>
            <p>
              <strong>Concierge:</strong> Available for tours, transport, and on-the-spot help; ping the organizers to coordinate requests.
            </p>
          </section>
        </div>

        <div className="btn-row" style={{ marginTop: 24 }}>
          <button className="btn btn--rules" onClick={onBack}>Back</button>
        </div>
      </div>
    </>
  );
}
