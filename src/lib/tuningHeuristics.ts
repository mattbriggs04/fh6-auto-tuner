import type { Drivetrain, ModeId, PerformanceClass, SetupRecommendation, TireType, VehicleInputs } from "../types";

const KG_TO_LB = 2.20462;

const tireGrip: Record<TireType, number> = {
  street: 0.93,
  sport: 1,
  "semi-slick": 1.1,
  slick: 1.16,
  drift: 1.02,
  rally: 1.03,
  offroad: 1.06,
  snow: 0.98,
  drag: 1.08
};

const classPowerScalar: Record<PerformanceClass, number> = {
  D: 0.45,
  C: 0.6,
  B: 0.75,
  A: 0.92,
  S1: 1.1,
  S2: 1.35,
  R: 1.55
};

const classSpringScalar: Record<PerformanceClass, number> = {
  D: 0.78,
  C: 0.86,
  B: 0.93,
  A: 1,
  S1: 1.08,
  S2: 1.16,
  R: 1.24
};

const modeModel: Record<ModeId, {
  spring: number;
  frontSpringBias: number;
  rearSpringBias: number;
  rebound: number;
  compression: number;
  hpPer1000Lb: [number, number];
  rideHeight: string;
  rideHeightDetail: string;
  aeroRearBase: number;
}> = {
  street: {
    spring: 0.19,
    frontSpringBias: 1.02,
    rearSpringBias: 0.98,
    rebound: 0.74,
    compression: 0.62,
    hpPer1000Lb: [165, 285],
    rideHeight: "Low, with travel reserve",
    rideHeightDetail: "Lower until the car bottoms on heavy braking, then raise one step.",
    aeroRearBase: 56
  },
  drift: {
    spring: 0.17,
    frontSpringBias: 1.08,
    rearSpringBias: 0.9,
    rebound: 0.7,
    compression: 0.58,
    hpPer1000Lb: [205, 315],
    rideHeight: "Medium-low",
    rideHeightDetail: "Keep enough rake and travel that transitions do not spike the rear tires.",
    aeroRearBase: 48
  },
  offroad: {
    spring: 0.105,
    frontSpringBias: 0.96,
    rearSpringBias: 1.04,
    rebound: 0.62,
    compression: 0.52,
    hpPer1000Lb: [115, 205],
    rideHeight: "High",
    rideHeightDetail: "Prioritize travel and landing control before lowering center of gravity.",
    aeroRearBase: 52
  },
  rally: {
    spring: 0.13,
    frontSpringBias: 0.98,
    rearSpringBias: 1.02,
    rebound: 0.66,
    compression: 0.54,
    hpPer1000Lb: [125, 225],
    rideHeight: "Medium-high",
    rideHeightDetail: "Enough travel for crests and ruts, low enough to settle on mixed asphalt.",
    aeroRearBase: 54
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, places = 0) {
  return Number(value.toFixed(places));
}

function dampingFromSpring(springRate: number, multiplier: number) {
  return round(clamp((springRate / 75) * multiplier, 2.2, 15), 1);
}

function tirePressureBaseline(mode: ModeId, tireType: TireType, drivetrain: Drivetrain) {
  const baseByTire: Record<TireType, [number, number]> = {
    street: [31, 31],
    sport: [31.5, 31.5],
    "semi-slick": [32, 32],
    slick: [32.5, 32],
    drift: [24, 25],
    rally: [29.5, 29.5],
    offroad: [28.5, 28.5],
    snow: [28, 28],
    drag: drivetrain === "RWD" ? [32, 25] : [27, 27]
  };

  const [front, rear] = baseByTire[tireType];

  if (mode === "drift") {
    return {
      front: round(clamp(front - 1, 20, 38), 1),
      rear: round(clamp(rear + 1, 20, 40), 1)
    };
  }

  if (mode === "offroad") {
    return {
      front: round(clamp(front - 1, 22, 34), 1),
      rear: round(clamp(rear - 1, 22, 34), 1)
    };
  }

  return {
    front: round(front, 1),
    rear: round(rear, 1)
  };
}

function gearingRecommendations(mode: ModeId, performanceClass: PerformanceClass) {
  if (mode === "drift") {
    return {
      finalDrive: "Longer than grip tune",
      first: "Launch only",
      second: "Short transition gear",
      third: "Primary drift gear",
      fourth: performanceClass === "S2" || performanceClass === "R" ? "Fast drift gear" : "Long-route gear",
      fifth: "Recovery / extension",
      sixth: "Top speed"
    };
  }

  if (mode === "rally" || mode === "offroad") {
    return {
      finalDrive: "Shorter for recovery",
      first: "Loose launch",
      second: "Hairpins / climbs",
      third: "Main exit gear",
      fourth: "Mid-speed pulls",
      fifth: "Fast sections",
      sixth: "Open sections"
    };
  }

  if (performanceClass === "S2" || performanceClass === "R") {
    return {
      finalDrive: "Route-matched",
      first: "Traction limited",
      second: "Corner exits",
      third: "Main acceleration",
      fourth: "Mid-speed pull",
      fifth: "Fast straights",
      sixth: "Maximum route speed"
    };
  }

  return {
    finalDrive: "Slightly shorter",
    first: "Clean launch",
    second: "Slow exits",
    third: "Main corner exit",
    fourth: "Mid-speed",
    fifth: "Fast sections",
    sixth: "Top speed"
  };
}

function alignmentRecommendations(mode: ModeId) {
  if (mode === "drift") {
    return {
      camberFront: "-4.0 deg",
      camberRear: "-0.5 deg",
      toeFront: "Out 0.2 deg",
      toeRear: "0.0 deg",
      caster: "7.0 deg"
    };
  }

  if (mode === "rally") {
    return {
      camberFront: "-1.3 deg",
      camberRear: "-0.8 deg",
      toeFront: "0.0 deg",
      toeRear: "In 0.1 deg",
      caster: "6.0 deg"
    };
  }

  if (mode === "offroad") {
    return {
      camberFront: "-0.8 deg",
      camberRear: "-0.5 deg",
      toeFront: "0.0 deg",
      toeRear: "In 0.1 deg",
      caster: "5.6 deg"
    };
  }

  return {
    camberFront: "-1.6 deg",
    camberRear: "-1.1 deg",
    toeFront: "0.0 deg",
    toeRear: "0.0 deg",
    caster: "6.2 deg"
  };
}

function arbRecommendations(mode: ModeId, performanceClass: PerformanceClass) {
  const classAdd = performanceClass === "S2" || performanceClass === "R" ? 4 : performanceClass === "S1" ? 2 : 0;

  if (mode === "drift") {
    return { front: 24 + classAdd, rear: 30 + classAdd };
  }

  if (mode === "rally") {
    return { front: 17 + classAdd, rear: 19 + classAdd };
  }

  if (mode === "offroad") {
    return { front: 11 + classAdd, rear: 14 + classAdd };
  }

  return { front: 26 + classAdd, rear: 23 + classAdd };
}

function rideHeightSplit(mode: ModeId) {
  if (mode === "offroad") {
    return { front: "High", rear: "High + 1 step" };
  }

  if (mode === "rally") {
    return { front: "Medium-high", rear: "Medium-high" };
  }

  if (mode === "drift") {
    return { front: "Medium-low", rear: "Medium-low + 1 step" };
  }

  return { front: "Low", rear: "Low + 1 step" };
}

function brakeRecommendations(mode: ModeId, drivetrain: Drivetrain) {
  if (mode === "drift") {
    return { balance: "55% front", pressure: "105%" };
  }

  if (mode === "offroad") {
    return { balance: "62% front", pressure: "90%" };
  }

  if (mode === "rally") {
    return { balance: "60% front", pressure: "95%" };
  }

  if (drivetrain === "FWD") {
    return { balance: "58% front", pressure: "100%" };
  }

  return { balance: "56% front", pressure: "105%" };
}

function differentialTuneValues(mode: ModeId, drivetrain: Drivetrain) {
  if (drivetrain === "FWD") {
    return {
      frontAccel: mode === "street" ? "35%" : "30%",
      frontDecel: "10%",
      rearAccel: "N/A",
      rearDecel: "N/A",
      center: "N/A"
    };
  }

  if (drivetrain === "RWD") {
    return {
      frontAccel: "N/A",
      frontDecel: "N/A",
      rearAccel: mode === "drift" ? "95%" : "55%",
      rearDecel: mode === "drift" ? "75%" : "30%",
      center: "N/A"
    };
  }

  if (mode === "drift") {
    return {
      frontAccel: "12%",
      frontDecel: "0%",
      rearAccel: "95%",
      rearDecel: "75%",
      center: "90% rear"
    };
  }

  if (mode === "offroad") {
    return {
      frontAccel: "38%",
      frontDecel: "10%",
      rearAccel: "68%",
      rearDecel: "22%",
      center: "62% rear"
    };
  }

  if (mode === "rally") {
    return {
      frontAccel: "30%",
      frontDecel: "8%",
      rearAccel: "58%",
      rearDecel: "22%",
      center: "70% rear"
    };
  }

  return {
    frontAccel: "24%",
    frontDecel: "0%",
    rearAccel: "60%",
    rearDecel: "35%",
    center: "72% rear"
  };
}

function buildTuneCards({
  aeroFront,
  aeroRear,
  compressionFront,
  compressionRear,
  drivetrain,
  inputs,
  mode,
  reboundFront,
  reboundRear,
  springFront,
  springRear
}: {
  aeroFront: number;
  aeroRear: number;
  compressionFront: number;
  compressionRear: number;
  drivetrain: Drivetrain;
  inputs: VehicleInputs;
  mode: ModeId;
  reboundFront: number;
  reboundRear: number;
  springFront: number;
  springRear: number;
}) {
  const pressures = tirePressureBaseline(mode, inputs.tireType, drivetrain);
  const gearing = gearingRecommendations(mode, inputs.performanceClass);
  const alignment = alignmentRecommendations(mode);
  const arbs = arbRecommendations(mode, inputs.performanceClass);
  const rideHeight = rideHeightSplit(mode);
  const brakes = brakeRecommendations(mode, drivetrain);
  const diff = differentialTuneValues(mode, drivetrain);

  return [
    {
      title: "Tires",
      detail: "Start here, then adjust pressure after a clean warm run based on grip, response, and heat.",
      items: [
        { label: "PSI front", value: `${pressures.front}` },
        { label: "PSI rear", value: `${pressures.rear}` }
      ]
    },
    {
      title: "Gearing",
      detail: "Set final drive around the route, then tune individual gears only when a gear falls out of the powerband.",
      items: [
        { label: "Final drive", value: gearing.finalDrive },
        { label: "1st gear", value: gearing.first },
        { label: "2nd gear", value: gearing.second },
        { label: "3rd gear", value: gearing.third },
        { label: "4th gear", value: gearing.fourth },
        { label: "5th gear", value: gearing.fifth },
        { label: "6th gear", value: gearing.sixth }
      ]
    },
    {
      title: "Alignment",
      detail: "Use camber for loaded tire contact, toe for response, and caster for self-centering.",
      items: [
        { label: "Camber front", value: alignment.camberFront },
        { label: "Camber rear", value: alignment.camberRear },
        { label: "Toe front", value: alignment.toeFront },
        { label: "Toe rear", value: alignment.toeRear },
        { label: "Front caster", value: alignment.caster }
      ]
    },
    {
      title: "Antiroll bars",
      detail: "Softer front adds front grip; stiffer rear adds rotation. Rough surfaces need softer bars.",
      items: [
        { label: "ARB front", value: `${arbs.front}` },
        { label: "ARB rear", value: `${arbs.rear}` }
      ]
    },
    {
      title: "Springs",
      detail: "Spring rates are generated from weight, front distribution, class, mode, tire grip, and drivetrain.",
      items: [
        { label: "Spring front", value: `${springFront} lb/in` },
        { label: "Spring rear", value: `${springRear} lb/in` },
        { label: "Ride height front", value: rideHeight.front },
        { label: "Ride height rear", value: rideHeight.rear }
      ]
    },
    {
      title: "Damping",
      detail: "Rebound controls body return; bump controls impact absorption and how sharply weight transfers.",
      items: [
        { label: "Rebound front", value: `${reboundFront}` },
        { label: "Rebound rear", value: `${reboundRear}` },
        { label: "Bump front", value: `${compressionFront}` },
        { label: "Bump rear", value: `${compressionRear}` }
      ]
    },
    {
      title: "Aero",
      detail: "Treat these as percentages of available downforce. Add rear for stability and front for high-speed rotation.",
      items: [
        { label: "Downforce front", value: `${aeroFront}%` },
        { label: "Downforce rear", value: `${aeroRear}%` }
      ]
    },
    {
      title: "Brake",
      detail: "Balance controls which axle does more braking work. Move forward for stability, rearward for rotation.",
      items: [
        { label: "Braking balance", value: brakes.balance }
      ]
    },
    {
      title: "Braking force",
      detail: "Pressure controls total braking force. Lower it if lockups are abrupt; raise it if the pedal feels weak.",
      items: [
        { label: "Pressure", value: brakes.pressure }
      ]
    },
    {
      title: "Differential",
      detail: "Accel affects throttle behavior, decel affects entry and braking, center balance applies only to AWD.",
      items: [
        { label: "Front accel", value: diff.frontAccel },
        { label: "Front decel", value: diff.frontDecel },
        { label: "Rear accel", value: diff.rearAccel },
        { label: "Rear decel", value: diff.rearDecel },
        { label: "Center balance", value: diff.center }
      ]
    }
  ];
}

function differentialBaseline(mode: ModeId, drivetrain: Drivetrain) {
  if (drivetrain === "FWD") {
    return mode === "street"
      ? ["Front accel 28-38%", "Front decel 8-18%", "Use rear ARB for rotation instead of high diff lock."]
      : ["Front accel 22-34%", "Front decel 6-14%", "Open the diff if the car drags wide under throttle."];
  }

  if (drivetrain === "RWD") {
    if (mode === "drift") {
      return ["Rear accel 90-100%", "Rear decel 65-90%", "Lower decel if the car refuses to rotate on entry."];
    }

    return ["Rear accel 42-62%", "Rear decel 18-38%", "Lower accel for tight exits; raise it if inside wheelspin dominates."];
  }

  if (mode === "drift") {
    return ["Front accel 8-18%", "Rear accel 85-100%", "Center balance 82-95% rear."];
  }

  if (mode === "offroad") {
    return ["Front accel 28-45%", "Rear accel 58-78%", "Center balance 55-70% rear."];
  }

  if (mode === "rally") {
    return ["Front accel 22-36%", "Rear accel 48-68%", "Center balance 60-75% rear."];
  }

  return ["Front accel 18-30%", "Rear accel 45-65%", "Center balance 65-75% rear."];
}

export function getClassOptimization(mode: ModeId, performanceClass: PerformanceClass) {
  if (mode === "street") {
    const streetByClass: Record<PerformanceClass, ReturnType<typeof classOptimizationResult>> = {
      D: classOptimizationResult(
        performanceClass,
        ["street"],
        "Street tires keep PI available for weight reduction, brakes, and usable power. Sport tires are only worth it if the car is already grip-limited.",
        ["Weight reduction before power", "Street or stock-width tires", "Brakes and ARBs if available"],
        "Keep the stock drivetrain unless traction is the only thing holding the car back.",
        "Stock or Sport transmission is usually enough; spend PI on tire/chassis first.",
        "Do not overbuild the car out of class chasing compound upgrades."
      ),
      C: classOptimizationResult(
        performanceClass,
        ["street", "sport"],
        "Street or Sport tires are the efficient window. Use Sport when the route is technical or the car is under-tired.",
        ["Moderate tire compound", "Weight and brakes", "Small power gains after grip"],
        "Stock drivetrain is usually best. AWD swaps are often too expensive here.",
        "Sport transmission only if final drive tuning solves a route problem.",
        "Tire width can cost more than it gives back on light C-class cars."
      ),
      B: classOptimizationResult(
        performanceClass,
        ["sport"],
        "Sport tires are the street baseline for B class: enough grip to brake and rotate without spending semi-slick PI.",
        ["Sport tires", "Adjustable ARBs", "Weight reduction", "Power only after grip"],
        "RWD/FWD can stay stock. AWD is route-specific and often too PI-expensive unless the car already has it.",
        "Sport transmission is a good PI-efficient choice because final drive tuning is usually enough.",
        "Avoid jumping to semi-slicks unless the car is extremely light or the route is all corners."
      ),
      A: classOptimizationResult(
        performanceClass,
        ["semi-slick"],
        "Semi-slicks are the clean A-class street target when PI allows. Sport tires still work when you need more budget for power.",
        ["Semi-slicks or strong Sport tires", "Brake and suspension adjustability", "Balanced power-to-weight"],
        "RWD keeps the car lighter; AWD becomes useful for high-power or tight exit-heavy routes.",
        "Sport transmission can still be enough, but Race transmission helps cars with awkward stock ratios.",
        "If semi-slicks force a weak engine, drop to Sport and spend PI on weight/power."
      ),
      S1: classOptimizationResult(
        performanceClass,
        ["semi-slick", "slick"],
        "Semi-slicks are efficient for many S1 street builds; slicks suit dry grip builds with enough PI and power.",
        ["Semi-slick or slick compound", "Full aero where useful", "Tire width before huge power"],
        "AWD is strong for launch and exits; RWD works on balanced cars with enough rear tire.",
        "Race transmission is worth it when the engine powerband or route needs tighter gears.",
        "S1 is where aero, gearing, and diff tuning start beating raw horsepower."
      ),
      S2: classOptimizationResult(
        performanceClass,
        ["slick", "semi-slick"],
        "Slicks are the dry asphalt baseline; semi-slicks can be faster when PI is tight or the route is mixed/wet.",
        ["Slicks or high-end semi-slicks", "Aero balance", "Wide tires", "Stable braking"],
        "AWD is usually the practical meta unless the chassis has exceptional RWD traction.",
        "Race transmission and differential are expected; tune for route speed instead of max speed.",
        "Do not add power until braking and corner-exit stability are solved."
      ),
      R: classOptimizationResult(
        performanceClass,
        ["slick"],
        "Slicks are the expected R-class street/track compound. Semi-slicks are a compromise only for mixed conditions or unusual PI constraints.",
        ["Slicks", "Full aero", "Wide tires", "Race brakes", "Precision diff and gearing"],
        "AWD favors deployable power; RWD needs careful aero and rear tire support.",
        "Race transmission is mandatory for serious R-class work.",
        "R class rewards stability and repeatability more than peak horsepower."
      )
    };

    return streetByClass[performanceClass];
  }

  if (mode === "rally") {
    return classOptimizationResult(
      performanceClass,
      performanceClass === "D" || performanceClass === "C" ? ["rally", "street"] : ["rally"],
      performanceClass === "D" || performanceClass === "C"
        ? "Rally tires are ideal if available; street tires can survive low-class mixed routes when PI is extremely tight."
        : "Rally tires are the default for dirt and mixed-surface racing across competitive classes.",
      ["Rally tires", "AWD or factory AWD", "Short final drive", "Suspension travel before power"],
      "AWD is the baseline because loose exits need drive from both axles.",
      performanceClass === "B" || performanceClass === "A"
        ? "Sport transmission can work if final drive is enough; Race transmission helps awkward gear spacing."
        : "Use Race transmission when the car needs close gears for boost, crests, or high speed sections.",
      "Avoid slicks on dirt. The raw grip does not overcome the surface and PI penalty."
    );
  }

  if (mode === "offroad") {
    return classOptimizationResult(
      performanceClass,
      ["offroad"],
      "Offroad tires are the primary cross-country compound. Rally tires are only a mixed-route compromise.",
      ["Offroad tires", "High ride height", "Suspension travel", "AWD", "Torque before top-end power"],
      "AWD is the practical baseline for jumps, water, climbs, and rough exits.",
      "Shorter gearing matters more than top speed unless the route has long open sections.",
      "Spend PI on keeping the tires connected to the surface before chasing power."
    );
  }

  const driftTires: TireType[] = performanceClass === "D" || performanceClass === "C"
    ? ["street", "sport"]
    : performanceClass === "B"
      ? ["sport", "drift"]
      : ["drift", "sport"];

  return classOptimizationResult(
    performanceClass,
    driftTires,
    performanceClass === "D" || performanceClass === "C"
      ? "Lower classes usually drift better on street or sport tires because they do not have enough power for high-grip compounds."
      : "Drift tires are the predictable default when power is high enough; Sport remains useful if drift tires feel too grippy.",
    ["RWD", "Steering angle", "Usable torque", "Tire compound matched to wheel speed"],
    "RWD is the clean default. AWD should be rear-biased if used for scoring or speed zones.",
    "Sport transmission can be enough for lower power. Race transmission helps tune the exact drift gear and shift recovery.",
    "If the car keeps straightening, reduce rear grip or lengthen/retune the active drift gear before adding more power."
  );
}

function classOptimizationResult(
  classKey: PerformanceClass,
  recommendedTires: TireType[],
  tireSummary: string,
  upgradeFocus: string[],
  drivetrainAdvice: string,
  transmissionAdvice: string,
  piAdvice: string
) {
  return {
    classKey,
    recommendedTires,
    tireSummary,
    upgradeFocus,
    drivetrainAdvice,
    transmissionAdvice,
    piAdvice
  };
}

function whyThisWorks(mode: ModeId, inputs: VehicleInputs, targetMin: number, targetMax: number) {
  const powerNote = `${targetMin}-${targetMax} hp is the efficient window for this weight before tire width and drivetrain losses start asking for more setup compromise.`;

  if (mode === "drift") {
    return [
      powerNote,
      "The front axle is kept sharper than the rear so the car accepts angle instead of pushing wide.",
      "Rear spring and damping are deliberately softer than a street car so throttle changes do not snap the chassis during transitions."
    ];
  }

  if (mode === "offroad") {
    return [
      powerNote,
      "Softer rates and higher ride height keep the tire in contact after jumps, rocks, water, and compression zones.",
      "The diff is locked enough to climb and recover, but front lock is limited so the car can still steer under throttle."
    ];
  }

  if (mode === "rally") {
    return [
      powerNote,
      "Rally setups trade ultimate pavement response for compliance, because loose-surface grip comes from keeping vertical load consistent.",
      "Rear-biased AWD gives the car rotation without giving away the traction needed to exit gravel corners."
    ];
  }

  return [
    powerNote,
    `The ${inputs.drivetrain} baseline balances entry stability with exit drive, then uses aero and diff settings to tune rotation at speed.`,
    "Spring and damping values are high enough to support braking and aero load, but not so stiff that tight routes lose mechanical grip."
  ];
}

function tuningGuidance(mode: ModeId, inputs: VehicleInputs) {
  const tirePressure = {
    title: "Tire pressure",
    summary: "Set pressure by testing heat, feel, and the problem you are trying to solve rather than chasing a universal number.",
    points: [
      "Lower pressure on the axle that needs more grip or feels nervous; raise pressure on the axle that feels sluggish, vague, or too planted.",
      "Make small changes, run the same route again, and watch whether the car improves on entry, mid-corner, or exit.",
      mode === "offroad" || mode === "rally"
        ? "Rougher surfaces usually prefer a softer tire feel; go firmer only when the car feels delayed or rolls over the tire."
        : "For pavement, use telemetry and warm-lap feel: the tire should respond cleanly without overheating or feeling glassy."
    ]
  };

  const gearing = {
    title: "Gearing ratios",
    summary: "Tune the final drive around the route first, then adjust individual gears only when a specific gear is wrong.",
    points: [
      "If the car hits limiter before the useful part of a straight or drift zone ends, lengthen the final drive or that gear.",
      "If the car bogs after a shift, lands below boost, or cannot recover after a slide, shorten the final drive or tighten the gap.",
      mode === "offroad" || mode === "rally"
        ? "Favor recovery and acceleration out of slow loose corners over top speed unless the route has long open sections."
        : "Top gear should be useful on the fastest part of the route; unused top speed is usually wasted acceleration."
    ]
  };

  if (mode !== "drift") {
    return [tirePressure, gearing];
  }

  return [
    {
      title: "Drift tire compound",
      summary: "Drift tires are a strong default, but they are not mandatory for every drift car.",
      points: [
        "Use drift tires when the car has enough power to keep wheel speed alive and you want predictable angle control.",
        "Try sport or street tires when drift compound feels too grippy, the car keeps straightening, or a lower-power build cannot stay sideways.",
        "Avoid jumping straight to very high-grip race-style tires unless the car has the power, steering angle, and gearing to overcome them."
      ]
    },
    tirePressure,
    {
      title: "Drift gearing",
      summary: "Build the transmission around the gear or two you actually drift in, not the highest speed shown in the graph.",
      points: [
        "Pick the main drift gear, then adjust final drive so that gear holds wheel speed without bouncing limiter through the zone.",
        "Lengthen the active gear if the car runs out of RPM while angle is still building; shorten it if throttle input does not spin the tires back up.",
        "Keep the next gear close enough that upshifts do not drop the engine out of its useful torque or boost range."
      ]
    },
    {
      title: "Drift diff vs race diff",
      summary: "Use the differential part that matches how much control you want over lock behavior.",
      points: [
        "Use a drift differential when you want a simple, consistent locked feel for angle, lower-power cars, learning, or point drifting.",
        "Use a race differential when you want finer accel/decel tuning, smoother transitions, or a car that still needs to behave outside drift zones.",
        `With ${inputs.drivetrain}, reduce lock if the car only spins tires or pushes straight; add lock if one tire lights up or the car will not hold angle.`
      ]
    }
  ];
}

function issueFixes(mode: ModeId) {
  const common = [
    {
      issue: "Corner-entry understeer",
      fix: "Soften front ARB, add a touch of front camber, or reduce front rebound one step."
    },
    {
      issue: "Power-on oversteer",
      fix: "Reduce rear diff accel, soften rear rebound, or add rear aero on high-speed builds."
    },
    {
      issue: "Exit wheelspin",
      fix: "Lengthen low gears, lower accel lock, and reduce tire pressure on the driven axle in small steps."
    }
  ];

  if (mode === "drift") {
    return [
      {
        issue: "Car straightens mid-drift",
        fix: "Raise rear pressure slightly, add rear diff lock, or shorten the active drift gear."
      },
      {
        issue: "Transitions snap too hard",
        fix: "Lower rear pressure, soften rear rebound, and reduce rear ARB stiffness."
      },
      ...common
    ];
  }

  if (mode === "offroad") {
    return [
      {
        issue: "Bottoming after jumps",
        fix: "Raise ride height first, then add spring rate only if the chassis still strikes repeatedly."
      },
      {
        issue: "Bouncing over rough ground",
        fix: "Soften bump damping and reduce rebound if the suspension packs down over repeated hits."
      },
      ...common
    ];
  }

  if (mode === "rally") {
    return [
      {
        issue: "Car darts over ruts",
        fix: "Reduce toe, soften bump damping, and keep camber conservative."
      },
      {
        issue: "AWD push on throttle",
        fix: "Lower front diff accel or move the center diff farther rearward."
      },
      ...common
    ];
  }

  return common;
}

export function generateSetup(mode: ModeId, inputs: VehicleInputs): SetupRecommendation {
  const model = modeModel[mode];
  const classOptimization = getClassOptimization(mode, inputs.performanceClass);
  const springClassScalar = classSpringScalar[inputs.performanceClass];
  const powerClassScalar = classPowerScalar[inputs.performanceClass];
  const weightLb = inputs.weightKg * KG_TO_LB;
  const frontShare = inputs.frontWeightPercent / 100;
  const rearShare = 1 - frontShare;
  const frontAxleLoad = weightLb * frontShare;
  const rearAxleLoad = weightLb * rearShare;
  const widthAverage = (inputs.tireWidthFront + inputs.tireWidthRear) / 2;
  const widthFactor = clamp(widthAverage / 265, 0.86, 1.18);
  const gripFactor = tireGrip[inputs.tireType] * widthFactor;
  const drivetrainFrontBias = inputs.drivetrain === "FWD" ? 1.05 : inputs.drivetrain === "AWD" ? 1.02 : 1;
  const drivetrainRearBias = inputs.drivetrain === "RWD" ? 1.03 : inputs.drivetrain === "AWD" ? 1.01 : 0.97;

  const springFront = round(frontAxleLoad * model.spring * model.frontSpringBias * drivetrainFrontBias * springClassScalar * clamp(gripFactor, 0.9, 1.12));
  const springRear = round(rearAxleLoad * model.spring * model.rearSpringBias * drivetrainRearBias * springClassScalar * clamp(gripFactor, 0.9, 1.12));
  const reboundFront = dampingFromSpring(springFront, model.rebound);
  const reboundRear = dampingFromSpring(springRear, model.rebound);
  const compressionFront = dampingFromSpring(springFront, model.compression);
  const compressionRear = dampingFromSpring(springRear, model.compression);
  const hpPer1000 = inputs.horsepower / (weightLb / 1000);
  const speedStabilityNeed = clamp((hpPer1000 - 160) / 240, 0, 1);
  const rearAero = round(clamp(model.aeroRearBase + speedStabilityNeed * 8 + (inputs.drivetrain === "RWD" ? 2 : 0), 46, 66));
  const frontAero = 100 - rearAero;
  const weightPenalty = clamp((inputs.weightKg - 1450) / 1400, 0, 0.18);
  const [hpMinPer1000, hpMaxPer1000] = model.hpPer1000Lb;
  const targetMin = round((hpMinPer1000 * (1 - weightPenalty) * powerClassScalar * weightLb) / 1000 / 10) * 10;
  const targetMax = round((hpMaxPer1000 * (1 - weightPenalty * 0.8) * powerClassScalar * weightLb) / 1000 / 10) * 10;
  const gripIndex = round(clamp(gripFactor * 82 + widthFactor * 18, 70, 118));
  const rotationIndex = round(clamp(100 - inputs.frontWeightPercent + (inputs.drivetrain === "RWD" ? 12 : 3) + (mode === "drift" ? 18 : 0), 35, 92));
  const stabilityIndex = round(clamp(inputs.frontWeightPercent + rearAero * 0.45 + (inputs.drivetrain === "AWD" ? 12 : 4), 48, 96));

  return {
    tuneCards: buildTuneCards({
      aeroFront: frontAero,
      aeroRear: rearAero,
      compressionFront,
      compressionRear,
      drivetrain: inputs.drivetrain,
      inputs,
      mode,
      reboundFront,
      reboundRear,
      springFront,
      springRear
    }),
    springFront,
    springRear,
    compressionFront,
    compressionRear,
    reboundFront,
    reboundRear,
    rideHeight: model.rideHeight,
    rideHeightDetail: model.rideHeightDetail,
    aeroBalance: `${frontAero}% front / ${rearAero}% rear`,
    aeroDetail: "Bias moves rearward as horsepower-per-weight increases because high-speed exits need more rear stability.",
    differential: differentialBaseline(mode, inputs.drivetrain),
    classOptimization,
    guidance: tuningGuidance(mode, inputs),
    powerTarget: {
      min: targetMin,
      max: targetMax,
      note: "Heavier cars get a slightly lower efficiency target because traction and braking become the limiting factors sooner."
    },
    why: whyThisWorks(mode, inputs, targetMin, targetMax),
    issueFixes: issueFixes(mode),
    advanced: {
      frontAxleLoad: round(frontAxleLoad),
      rearAxleLoad: round(rearAxleLoad),
      gripIndex,
      rotationIndex,
      stabilityIndex
    }
  };
}

export function kgToLb(value: number) {
  return round(value * KG_TO_LB);
}

export function lbToKg(value: number) {
  return round(value / KG_TO_LB);
}
