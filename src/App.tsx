import { useMemo, useState } from "react";
import {
  Gauge,
  Mountain,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Wrench
} from "lucide-react";

type BuildType = "street" | "drift" | "rally" | "offroad";
type ClassKey = "D" | "C" | "B" | "A" | "S1" | "S2" | "R" | "X";
type Drivetrain = "AWD" | "RWD" | "FWD";
type IssueKey = "entryPush" | "exitPush" | "snapOversteer" | "brakeUnstable" | "wheelspin" | "bottoming";

type BuildProfile = {
  id: BuildType;
  name: string;
  icon: typeof Gauge;
  summary: string;
  tireRule: string;
  powerRule: string;
  engineRule: string;
  tuneGuidelines: string[];
  springBias: number;
  frontBias: number;
  rearBias: number;
  issuePriority: IssueKey[];
};

const classGuide: Record<ClassKey, { pi: string; tire: string; powerWeight: string; note: string; springPercent: number }> = {
  D: { pi: "D 600", tire: "Stock, street, or vintage race only when grip is the bottleneck.", powerWeight: "55-95 hp / 1000 lb", note: "Momentum class. Avoid power swaps that force bad tires.", springPercent: 0.28 },
  C: { pi: "C 700", tire: "Street tires for road, rally tires for dirt.", powerWeight: "80-125 hp / 1000 lb", note: "Weight reduction usually beats big power here.", springPercent: 0.34 },
  B: { pi: "B 800", tire: "Street or sport tires; rally compound for mixed surfaces.", powerWeight: "110-165 hp / 1000 lb", note: "Good all-round class for learning balance changes.", springPercent: 0.42 },
  A: { pi: "A 900", tire: "Sport tires are the baseline; race tires for technical builds.", powerWeight: "150-220 hp / 1000 lb", note: "FH6 offset puts familiar FH5 A-class behavior closer to B/S1 thinking.", springPercent: 0.5 },
  S1: { pi: "S1 1000", tire: "Race tires for street, rally tires for dirt, slicks only if PI allows.", powerWeight: "210-310 hp / 1000 lb", note: "Aero, gearing, and diff setup start mattering more than raw power.", springPercent: 0.62 },
  S2: { pi: "S2 1100", tire: "Race or slick tires; prioritize tire width and aero.", powerWeight: "290-430 hp / 1000 lb", note: "Stability wins races. Do not chase peak horsepower first.", springPercent: 0.74 },
  R: { pi: "R 1200", tire: "Slicks or race compound with full aero.", powerWeight: "400-620 hp / 1000 lb", note: "R class is the new extreme race tier. Use precision, not loose street habits.", springPercent: 0.86 },
  X: { pi: "X open", tire: "Best available compound for the event surface.", powerWeight: "Anything that can still put power down.", note: "Treat this as testing territory; tune around telemetry and event route.", springPercent: 0.92 }
};

const profiles: Record<BuildType, BuildProfile> = {
  street: {
    id: "street",
    name: "Street Builds",
    icon: Gauge,
    summary: "Road racing, city circuits, touge routes, and mixed-speed pavement.",
    tireRule: "Use the lowest tire compound that still lets the car rotate and brake cleanly. Sport tires fit most A/S1 builds; race tires become safer in S2/R.",
    powerRule: "Build to the class power-to-weight band before adding power. FH6's tighter roads make launch and corner exit more valuable than dyno numbers.",
    engineRule: "Keep stock engines when torque delivery is smooth. Swap only when the stock motor cannot reach class pace without wasting PI on heavy upgrades.",
    tuneGuidelines: [
      "Start with neutral pressure and tune hot pressure after two clean laps.",
      "Add front aero or softer front bar for corner entry push.",
      "Reduce accel diff before adding more power if the car washes wide on exit.",
      "Keep final drive short enough for the route, not for theoretical top speed."
    ],
    springBias: 1,
    frontBias: 1.04,
    rearBias: 0.96,
    issuePriority: ["entryPush", "exitPush", "snapOversteer", "brakeUnstable", "wheelspin", "bottoming"]
  },
  drift: {
    id: "drift",
    name: "Drift Builds",
    icon: RotateCcw,
    summary: "Angle control, transitions, tandem routes, and point runs.",
    tireRule: "Sport or street tires for lower-power cars; race tires only when power is high enough to keep wheel speed alive.",
    powerRule: "Aim for controllable torque. Too much grip with too little power makes the car straighten mid-corner.",
    engineRule: "Torque-rich swaps help, but avoid peaky engines unless gearing can keep them in boost.",
    tuneGuidelines: [
      "Run high steering angle, more front camber, and near-locked accel diff.",
      "Raise rear pressure to free the car; lower it only if transitions are too snappy.",
      "Use longer gearing when the car bounces limiter mid-drift.",
      "Soften rear rebound if the car snaps during transitions."
    ],
    springBias: 0.92,
    frontBias: 1.08,
    rearBias: 0.88,
    issuePriority: ["snapOversteer", "wheelspin", "entryPush", "bottoming", "brakeUnstable", "exitPush"]
  },
  rally: {
    id: "rally",
    name: "Rally Builds",
    icon: Mountain,
    summary: "Dirt routes, mixed grip, jumps, and rough but raceable surfaces.",
    tireRule: "Rally tires are usually mandatory. Avoid slick/race pavement tires unless the event is mostly asphalt.",
    powerRule: "Use enough power to recover after slides, then spend PI on weight, tire width, and driveline.",
    engineRule: "Prefer broad torque and fast response. Heavy high-power swaps can make the car skate over bumps.",
    tuneGuidelines: [
      "Lower tire pressures and soften springs compared with road builds.",
      "Use more ride height and softer bump damping to absorb crests.",
      "AWD center diff should stay rear-biased but not extreme.",
      "Toe should stay conservative so the car tracks straight over loose surfaces."
    ],
    springBias: 0.72,
    frontBias: 0.98,
    rearBias: 1.02,
    issuePriority: ["bottoming", "wheelspin", "brakeUnstable", "snapOversteer", "entryPush", "exitPush"]
  },
  offroad: {
    id: "offroad",
    name: "Offroad Builds",
    icon: Wrench,
    summary: "Cross country, open terrain, water, large bumps, and landing stability.",
    tireRule: "Offroad or rally tires first. Add tire width and suspension travel before power.",
    powerRule: "Power helps only after the car can land and keep contact. Keep builds broad and forgiving.",
    engineRule: "Choose engines with usable torque and manageable weight. Avoid swaps that make the front too heavy.",
    tuneGuidelines: [
      "Use high ride height, soft springs, and softer bump damping.",
      "Stiffen only enough to stop repeated bottoming after jumps.",
      "Use more diff lock than rally for drive, then reduce if the car plows.",
      "Keep aero low unless the route has long high-speed road sections."
    ],
    springBias: 0.62,
    frontBias: 0.96,
    rearBias: 1.04,
    issuePriority: ["bottoming", "wheelspin", "entryPush", "brakeUnstable", "snapOversteer", "exitPush"]
  }
};

const issueAdvice: Record<IssueKey, { label: string; fix: string }> = {
  entryPush: { label: "Corner entry understeer", fix: "Lower front ARB, add front camber, move brake balance slightly rearward, or add front aero." },
  exitPush: { label: "Corner exit understeer", fix: "Reduce accel diff, reduce front tire pressure slightly, or increase rear rotation with a small rear ARB change." },
  snapOversteer: { label: "Snap oversteer", fix: "Lower rear tire pressure, soften rear rebound, add rear aero, and reduce accel diff lock." },
  brakeUnstable: { label: "Braking instability", fix: "Move brake balance forward, add rear toe-in, soften rear bump, and reduce decel diff." },
  wheelspin: { label: "Wheelspin on exit", fix: "Lengthen low gears, lower accel diff, soften rear springs, and reduce rear pressure in small steps." },
  bottoming: { label: "Bottoming or landing bounce", fix: "Raise ride height, increase spring target within range, and soften bump only if impacts spike the chassis." }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, places = 1) {
  return Number(value.toFixed(places));
}

function springTarget(
  minSpring: number,
  maxSpring: number,
  frontWeight: number,
  selectedClass: ClassKey,
  profile: BuildProfile,
  drivetrain: Drivetrain
) {
  const usableRange = Math.max(0, maxSpring - minSpring);
  const classPoint = classGuide[selectedClass].springPercent;
  const drivetrainBias = drivetrain === "FWD" ? 0.04 : drivetrain === "RWD" ? -0.02 : 0;
  const base = minSpring + usableRange * clamp(classPoint * profile.springBias + drivetrainBias, 0.08, 0.96);
  const frontShare = clamp(frontWeight / 50, 0.72, 1.35);
  const rearShare = clamp((100 - frontWeight) / 50, 0.72, 1.35);

  return {
    front: Math.round(clamp(base * frontShare * profile.frontBias, minSpring, maxSpring)),
    rear: Math.round(clamp(base * rearShare * profile.rearBias, minSpring, maxSpring)),
    base: Math.round(base)
  };
}

function App() {
  const [build, setBuild] = useState<BuildType>("street");
  const [selectedClass, setSelectedClass] = useState<ClassKey>("A");
  const [drivetrain, setDrivetrain] = useState<Drivetrain>("AWD");
  const [weight, setWeight] = useState(3000);
  const [frontWeight, setFrontWeight] = useState(52);
  const [minSpring, setMinSpring] = useState(250);
  const [maxSpring, setMaxSpring] = useState(950);
  const [issues, setIssues] = useState<IssueKey[]>(["entryPush"]);

  const profile = profiles[build];
  const guide = classGuide[selectedClass];
  const springs = useMemo(
    () => springTarget(minSpring, maxSpring, frontWeight, selectedClass, profile, drivetrain),
    [minSpring, maxSpring, frontWeight, selectedClass, profile, drivetrain]
  );
  const powerWeight = useMemo(() => Math.round((Number(weight) / 1000) * 1), [weight]);

  const toggleIssue = (issue: IssueKey) => {
    setIssues((current) => current.includes(issue) ? current.filter((item) => item !== issue) : [...current, issue]);
  };

  const Icon = profile.icon;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">FH6 tuning planner</p>
          <h1>Pick a build, choose a class, fix the handling.</h1>
        </div>
        <div className="hero-note">
          <Sparkles size={18} />
          <span>Uses FH5-style tuning math as a baseline, adjusted for FH6's class offset, R class, tighter routes, and rougher mixed-surface driving.</span>
        </div>
      </header>

      <section className="build-picker" aria-label="Build category">
        {(Object.values(profiles) as BuildProfile[]).map((item) => {
          const BuildIcon = item.icon;
          return (
            <button
              className={item.id === build ? "build-card active" : "build-card"}
              key={item.id}
              onClick={() => setBuild(item.id)}
              type="button"
            >
              <BuildIcon size={24} />
              <strong>{item.name}</strong>
              <span>{item.summary}</span>
            </button>
          );
        })}
      </section>

      <section className="layout">
        <aside className="panel setup-panel">
          <div className="panel-title">
            <Icon size={22} />
            <h2>{profile.name}</h2>
          </div>

          <label>
            Target class
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value as ClassKey)}>
              {Object.keys(classGuide).map((classKey) => (
                <option key={classKey} value={classKey}>{classGuide[classKey as ClassKey].pi}</option>
              ))}
            </select>
          </label>

          <label>
            Drivetrain
            <select value={drivetrain} onChange={(event) => setDrivetrain(event.target.value as Drivetrain)}>
              <option>AWD</option>
              <option>RWD</option>
              <option>FWD</option>
            </select>
          </label>

          <div className="split">
            <label>
              Weight <span>{weight} lb</span>
              <input type="range" min="1600" max="5600" step="25" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
            </label>
            <label>
              Front weight <span>{frontWeight}%</span>
              <input type="range" min="35" max="70" step="1" value={frontWeight} onChange={(event) => setFrontWeight(Number(event.target.value))} />
            </label>
          </div>

          <div className="split">
            <label>
              Min spring
              <input type="number" min="1" value={minSpring} onChange={(event) => setMinSpring(Number(event.target.value))} />
            </label>
            <label>
              Max spring
              <input type="number" min="1" value={maxSpring} onChange={(event) => setMaxSpring(Number(event.target.value))} />
            </label>
          </div>

          <div className="issue-box">
            <h3>Handling issues</h3>
            {profile.issuePriority.map((issue) => (
              <label className="check" key={issue}>
                <input type="checkbox" checked={issues.includes(issue)} onChange={() => toggleIssue(issue)} />
                {issueAdvice[issue].label}
              </label>
            ))}
          </div>
        </aside>

        <section className="main-grid">
          <article className="panel guide-card">
            <div className="panel-title">
              <SlidersHorizontal size={22} />
              <h2>{guide.pi} Build Guide</h2>
            </div>
            <div className="guide-grid">
              <InfoBlock title="Tires" text={`${guide.tire} ${profile.tireRule}`} />
              <InfoBlock title="Power to weight" text={`${guide.powerWeight}. ${profile.powerRule}`} />
              <InfoBlock title="Engine strategy" text={profile.engineRule} />
              <InfoBlock title="Class note" text={guide.note} />
            </div>
          </article>

          <article className="panel calculator">
            <div className="panel-title">
              <Gauge size={22} />
              <h2>Spring Calculator</h2>
            </div>
            <div className="spring-readout">
              <div>
                <span>Front spring</span>
                <strong>{springs.front} lb/in</strong>
              </div>
              <div>
                <span>Rear spring</span>
                <strong>{springs.rear} lb/in</strong>
              </div>
              <div>
                <span>Baseline</span>
                <strong>{springs.base} lb/in</strong>
              </div>
            </div>
            <p>
              Formula: choose a class point inside your adjustable spring range, then weight it by front/rear mass and build type.
              For this car, every 100 hp would equal about {powerWeight} hp per 1000 lb added to the build target.
            </p>
          </article>

          <article className="panel tuning-card">
            <h2>Category Tuning Guidelines</h2>
            <ul>
              {profile.tuneGuidelines.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </article>

          <article className="panel fixes-card">
            <h2>Issue Fixes</h2>
            {issues.length === 0 ? (
              <p className="muted">Select handling issues to get targeted changes.</p>
            ) : (
              <div className="fix-list">
                {issues.map((issue) => (
                  <div className="fix" key={issue}>
                    <strong>{issueAdvice[issue].label}</strong>
                    <span>{issueAdvice[issue].fix}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="info-block">
      <span>{title}</span>
      <p>{text}</p>
    </div>
  );
}

export default App;
