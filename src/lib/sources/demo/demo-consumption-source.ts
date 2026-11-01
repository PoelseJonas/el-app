// DEMO DATA. Made-up electricity consumption, so the app works fully without an Eloverblik
// token (AGENTS.md: "Appen skal virke fuldt ud med demodata alene"). The numbers are invented
// to look like a typical home; they are not measured and must never be shown as real data.
//
// Values are computed from the hour, not random, so the same hour always gives the same number.
// That keeps tests and screenshots stable, and any period can be asked for.

import type { ConsumptionSource } from "@/lib/domain/sources";
import type { ConsumptionPoint, MeteringPoint } from "@/lib/domain/types";
import { hourStartsIn, localHour } from "@/lib/utils/time";

// #region Demo data

const DEMO_METERING_POINT: MeteringPoint = {
  id: "demo",
  consumptionType: "electricity",
  label: "Demo",
};

/**
 * Made-up kWh per Danish clock hour (index 0 = 00-01, 18 = 18-19): low at night, a morning
 * peak around 07 and an evening peak around 18 (cooking, washing, TV).
 * Six hours per line, so the table reads like a day; prettier-ignore keeps that layout.
 */
// prettier-ignore
const DEMO_KWH_BY_HOUR = [
  0.25, 0.2,  0.2,  0.2,  0.2,  0.25, // 00-05: night, fridge and standby
  0.5,  0.7,  0.5,  0.3,  0.3,  0.3,  // 06-11: morning peak, then out of the house
  0.35, 0.3,  0.3,  0.35, 0.5,  0.8,  // 12-17: home in the afternoon
  1.0,  0.9,  0.7,  0.6,  0.45, 0.3,  // 18-23: evening peak, then winding down
];

// #endregion

// #region Public API

/** A consumption source with one made-up electricity meter. */
export function createDemoConsumptionSource(): ConsumptionSource {
  return {
    id: "demo",
    label: "Demo",

    async getMeteringPoints() {
      return [DEMO_METERING_POINT];
    },

    async getConsumption(range, meteringPointId) {
      // The interface asks for an empty list, not an error, when there is no data.
      if (meteringPointId !== DEMO_METERING_POINT.id) return [];

      return hourStartsIn(range).map(demoConsumptionAt);
    },
  };
}

// #endregion

// #region Helpers

function demoConsumptionAt(start: Date): ConsumptionPoint {
  return {
    meteringPointId: DEMO_METERING_POINT.id,
    start,
    intervalLength: "hour",
    quantity: DEMO_KWH_BY_HOUR[localHour(start)],
    unit: "kWh",
  };
}

// #endregion
