import type { Drivetrain, ModeId, SetupRecommendation, TireType, VehicleInputs } from "../types";

const KG_TO_LB = 2.20462;

const tireGrip: Record<TireType, number> = {
  street: 0.93,
  sport: 1,
  "semi-slick": 1.1,
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
    powerTarget: {
      min: targetMin,
      max: targetMax,
      note: `Current build is ${round(hpPer1000)} hp per 1000 lb. Heavier cars get a slightly lower efficiency target because traction and braking become the limiting factors sooner.`
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
