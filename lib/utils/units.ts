const KWH_PER_MWH = 1000;

/** Energi Data Service reports prices per MWh; the app works in kWh. */
export function dkkPerMwhToDkkPerKwh(priceDkkPerMwh: number): number {
  return priceDkkPerMwh / KWH_PER_MWH;
}
