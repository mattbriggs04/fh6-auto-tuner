import type { Drivetrain, ModeId, SetupRecommendation, TireType, VehicleInputs } from "../types";

const KG_TO_LB = 2.20462;

const tireGrip: Record<TireType, number> = {
  street: 0.93,
  sport: 1,
  "semi-slick": 1.1,
  drift: 1.02,
  rally: 1.03,
  offroad: 1.06
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

  const springFront = round(frontAxleLoad * model.spring * model.frontSpringBias * drivetrainFrontBias * clamp(gripFactor, 0.9, 1.12));
  const springRear = round(rearAxleLoad * model.spring * model.rearSpringBias * drivetrainRearBias * clamp(gripFactor, 0.9, 1.12));
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
  const targetMin = round((hpMinPer1000 * (1 - weightPenalty) * weightLb) / 1000 / 10) * 10;
  const targetMax = round((hpMaxPer1000 * (1 - weightPenalty * 0.8) * weightLb) / 1000 / 10) * 10;
  const gripIndex = round(clamp(gripFactor * 82 + widthFactor * 18, 70, 118));
  const rotationIndex = round(clamp(100 - inputs.frontWeightPercent + (inputs.drivetrain === "RWD" ? 12 : 3) + (mode === "drift" ? 18 : 0), 35, 92));
  const stabilityIndex = round(clamp(inputs.frontWeightPercent + rearAero * 0.45 + (inputs.drivetrain === "AWD" ? 12 : 4), 48, 96));

  return {
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
