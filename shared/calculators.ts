/**
 * The math behind the free calculators on itsjoshmoore.com.
 *
 * Pure functions with no React, so every number a tool page shows can be
 * tested (see calculators.test.ts). A field left empty arrives as null and
 * counts as 0 unless a function says otherwise.
 */

type Num = number | null | undefined;

/** A finite number, or 0. */
export const n = (x: Num): number => (typeof x === "number" && Number.isFinite(x) ? x : 0);

/* ------------------------------------------------------------------ */
/* Loans                                                               */
/* ------------------------------------------------------------------ */

/** Monthly principal and interest on a fully amortizing loan. */
export function monthlyPayment(principal: Num, annualRatePct: Num, years: Num): number {
  const p = n(principal);
  const months = Math.round(n(years) * 12);
  if (p <= 0 || months <= 0) return 0;
  const r = n(annualRatePct) / 100 / 12;
  if (r === 0) return p / months;
  const f = Math.pow(1 + r, months);
  return (p * r * f) / (f - 1);
}

/** Monthly payment on an interest-only loan. */
export function interestOnlyPayment(principal: Num, annualRatePct: Num): number {
  const p = n(principal);
  if (p <= 0) return 0;
  return (p * n(annualRatePct)) / 100 / 12;
}

/** The loan a monthly principal and interest payment supports. */
export function loanFromPayment(payment: Num, annualRatePct: Num, years: Num): number {
  const pay = n(payment);
  const months = Math.round(n(years) * 12);
  if (pay <= 0 || months <= 0) return 0;
  const r = n(annualRatePct) / 100 / 12;
  if (r === 0) return pay * months;
  const f = Math.pow(1 + r, months);
  return (pay * (f - 1)) / (r * f);
}

/* ------------------------------------------------------------------ */
/* House hack                                                          */
/* Follows "Make the numbers tell the truth" in Live In, Rent Smart:   */
/* total property cash outflow, minus collected rent, equals your      */
/* housing cost. Stress cases are the guide's: "Soft" is rent down 10% */
/* plus one vacant month; "Repair year" is the soft case plus the      */
/* largest likely first-year repair, spread over twelve months.        */
/* ------------------------------------------------------------------ */

export interface HouseHackInput {
  price: Num;
  downPaymentPct: Num;
  closingCosts: Num;
  setupRepairs: Num;
  /** Cash you have for this purchase. Null hides "cash remaining". */
  cashOnHand: Num;
  ratePct: Num;
  termYears: Num;
  /** Monthly figures. */
  taxes: Num;
  insurance: Num;
  mortgageInsurance: Num;
  hoa: Num;
  ownerUtilities: Num;
  maintenance: Num;
  capitalReserve: Num;
  vacancy: Num;
  other: Num;
  /** Monthly rent from the parts of the property you rent out. */
  rent: Num;
  firstYearRepair: Num;
  /** What you pay to live now, per month. Null hides the comparison. */
  currentHousing: Num;
}

export interface HouseHackResult {
  downPayment: number;
  loanAmount: number;
  /** Rounded to the dollar, the way the guide shows it. */
  principalAndInterest: number;
  totalOutflow: number;
  rent: number;
  housingCost: number;
  softCase: number;
  repairYearCase: number;
  cashToClose: number;
  cashRemaining: number | null;
  /** Three and six months of full property expenses (the guide's reserve target). */
  reserveLow: number;
  reserveHigh: number;
  /** The guide's example: Fannie Mae generally applies a 75% factor to qualifying rent. */
  lenderCountedRent: number;
  /** Current housing minus the new housing cost. Positive means you would pay less. */
  vsCurrentHousing: number | null;
}

export function houseHack(i: HouseHackInput): HouseHackResult {
  const price = Math.max(0, n(i.price));
  const downPayment = (price * n(i.downPaymentPct)) / 100;
  const loanAmount = Math.max(0, price - downPayment);
  const principalAndInterest = Math.round(monthlyPayment(loanAmount, i.ratePct, i.termYears));
  const totalOutflow =
    principalAndInterest +
    n(i.taxes) +
    n(i.insurance) +
    n(i.mortgageInsurance) +
    n(i.hoa) +
    n(i.ownerUtilities) +
    n(i.maintenance) +
    n(i.capitalReserve) +
    n(i.vacancy) +
    n(i.other);
  const rent = n(i.rent);
  const housingCost = totalOutflow - rent;
  const softCase = housingCost + rent * 0.1 + rent / 12;
  const repairYearCase = softCase + n(i.firstYearRepair) / 12;
  const cashToClose = downPayment + n(i.closingCosts) + n(i.setupRepairs);
  const hasCash = typeof i.cashOnHand === "number" && Number.isFinite(i.cashOnHand);
  const hasCurrent = typeof i.currentHousing === "number" && Number.isFinite(i.currentHousing);
  return {
    downPayment,
    loanAmount,
    principalAndInterest,
    totalOutflow,
    rent,
    housingCost,
    softCase,
    repairYearCase,
    cashToClose,
    cashRemaining: hasCash ? n(i.cashOnHand) - cashToClose : null,
    reserveLow: totalOutflow * 3,
    reserveHigh: totalOutflow * 6,
    lenderCountedRent: rent * 0.75,
    vsCurrentHousing: hasCurrent ? n(i.currentHousing) - housingCost : null,
  };
}

/* ------------------------------------------------------------------ */
/* Max offer (MAO), from the buyer's side                              */
/* Works back from the after-repair value to the most you can pay and  */
/* still hit your number. Costs that depend on the price (closing,     */
/* points, interest) are solved for exactly, not guessed.              */
/* ------------------------------------------------------------------ */

export interface Financing {
  use: boolean;
  /** Share of the purchase price the loan covers. */
  pctOfPrice: Num;
  /** Share of the repairs the loan covers. */
  pctOfRepairs: Num;
  ratePct: Num;
  pointsPct: Num;
}

export interface OfferCommon {
  arv: Num;
  repairs: Num;
  months: Num;
  holdingMonthly: Num;
  buyClosingPct: Num;
  financing: Financing;
}

export interface FlipInput extends OfferCommon {
  sellCostPct: Num;
  profit: Num;
  profitMode: "dollars" | "percent";
}

export interface KeepInput extends OfferCommon {
  refiLtvPct: Num;
  refiClosingPct: Num;
  /** Cash you are willing to leave in the deal after the refinance. */
  leaveIn: Num;
}

interface PriceCosts {
  maxOffer: number;
  ok: boolean;
  buyClosingCosts: number;
  holdingCosts: number;
  loanAmount: number;
  points: number;
  interest: number;
  /** Your cash before any sale or refinance: everything paid minus the loan. */
  cashIn: number;
}

/** Price-dependent costs at a given offer. Interest runs on the full loan for every month held. */
function costsAt(i: OfferCommon, price: number): Omit<PriceCosts, "maxOffer" | "ok"> {
  const f = i.financing;
  const repairs = n(i.repairs);
  const months = n(i.months);
  const loanAmount = f.use ? (price * n(f.pctOfPrice)) / 100 + (repairs * n(f.pctOfRepairs)) / 100 : 0;
  const points = f.use ? (loanAmount * n(f.pointsPct)) / 100 : 0;
  const interest = f.use ? (((loanAmount * n(f.ratePct)) / 100) * months) / 12 : 0;
  const buyClosingCosts = (price * n(i.buyClosingPct)) / 100;
  const holdingCosts = months * n(i.holdingMonthly);
  const cashIn = price + buyClosingCosts + repairs + holdingCosts + points + interest - loanAmount;
  return { buyClosingCosts, holdingCosts, loanAmount, points, interest, cashIn };
}

/** k: loan cost per dollar borrowed (points plus interest for the hold). */
function loanCostRate(i: OfferCommon): number {
  const f = i.financing;
  if (!f.use) return 0;
  return n(f.pointsPct) / 100 + ((n(f.ratePct) / 100) * n(i.months)) / 12;
}

export interface FlipResult extends PriceCosts {
  profit: number;
  sellingCosts: number;
  /** Everything the deal took, start to sale. Equals ARV minus profit. */
  allIn: number;
  cashOnCash: number | null;
  perYear: number | null;
}

export function flipMaxOffer(i: FlipInput): FlipResult {
  const arv = Math.max(0, n(i.arv));
  const repairs = n(i.repairs);
  const months = n(i.months);
  const f = i.financing;
  const k = loanCostRate(i);
  const lp = f.use ? n(f.pctOfPrice) / 100 : 0;
  const lr = f.use ? n(f.pctOfRepairs) / 100 : 0;
  const profit = i.profitMode === "percent" ? (arv * n(i.profit)) / 100 : n(i.profit);
  const sellingCosts = (arv * n(i.sellCostPct)) / 100;
  const holding = months * n(i.holdingMonthly);
  const top = arv - sellingCosts - profit - repairs - holding - k * lr * repairs;
  const bottom = 1 + n(i.buyClosingPct) / 100 + k * lp;
  const maxOffer = bottom > 0 ? top / bottom : 0;
  const ok = arv > 0 && maxOffer > 0;
  const costs = costsAt(i, Math.max(0, maxOffer));
  const allIn =
    Math.max(0, maxOffer) +
    costs.buyClosingCosts +
    repairs +
    costs.holdingCosts +
    costs.points +
    costs.interest +
    sellingCosts;
  const cashOnCash = ok && costs.cashIn > 0 ? profit / costs.cashIn : null;
  const perYear = cashOnCash !== null && months > 0 ? (cashOnCash * 12) / months : null;
  return { maxOffer, ok, profit, sellingCosts, allIn, cashOnCash, perYear, ...costs };
}

export interface KeepResult extends PriceCosts {
  newLoan: number;
  refiCosts: number;
  /** Cash that comes back at the refinance after paying off the first loan. */
  cashBack: number;
  /** Cash still in the deal after the refinance. Equals the target you set. */
  leftIn: number;
  equityAfter: number;
}

export function keepMaxOffer(i: KeepInput): KeepResult {
  const arv = Math.max(0, n(i.arv));
  const repairs = n(i.repairs);
  const months = n(i.months);
  const f = i.financing;
  const k = loanCostRate(i);
  const lp = f.use ? n(f.pctOfPrice) / 100 : 0;
  const lr = f.use ? n(f.pctOfRepairs) / 100 : 0;
  const newLoan = (arv * n(i.refiLtvPct)) / 100;
  const refiCosts = (newLoan * n(i.refiClosingPct)) / 100;
  const holding = months * n(i.holdingMonthly);
  const top = newLoan - refiCosts + n(i.leaveIn) - repairs - holding - k * lr * repairs;
  const bottom = 1 + n(i.buyClosingPct) / 100 + k * lp;
  const maxOffer = bottom > 0 ? top / bottom : 0;
  const ok = arv > 0 && maxOffer > 0;
  const costs = costsAt(i, Math.max(0, maxOffer));
  const cashBack = newLoan - refiCosts - costs.loanAmount;
  return {
    maxOffer,
    ok,
    newLoan,
    refiCosts,
    cashBack,
    leftIn: costs.cashIn - cashBack,
    equityAfter: arv - newLoan,
    ...costs,
  };
}

/* ------------------------------------------------------------------ */
/* Did you really win?                                                 */
/* Profit next to the money it took and how long it took it.           */
/* ------------------------------------------------------------------ */

export interface DealInput {
  profit: Num;
  /** Everything the deal cost, start to finish. */
  allIn: Num;
  /** Your own cash in the deal. Empty means you paid all of it. */
  cashIn: Num;
  months: Num;
}

export interface DealResult {
  profit: number;
  cashUsed: number;
  returnOnAllIn: number | null;
  cashOnCash: number | null;
  /** Simple yearly rate: the return scaled to twelve months. */
  perYear: number | null;
  profitPerMonth: number | null;
}

export function dealReturn(i: DealInput): DealResult {
  const profit = n(i.profit);
  const allIn = n(i.allIn);
  const cashUsed = n(i.cashIn) > 0 ? n(i.cashIn) : allIn;
  const months = n(i.months);
  const cashOnCash = cashUsed > 0 ? profit / cashUsed : null;
  return {
    profit,
    cashUsed,
    returnOnAllIn: allIn > 0 ? profit / allIn : null,
    cashOnCash,
    perYear: cashOnCash !== null && months > 0 ? (cashOnCash * 12) / months : null,
    profitPerMonth: months > 0 ? profit / months : null,
  };
}

export interface DealComparison {
  /** How many deals like B the cash in deal A could fund. */
  dealsFunded: number;
  /** Profit from that many deals like B. */
  profitIfFunded: number;
  /** B's return on cash divided by A's. Null when A's return is zero or missing. */
  multiple: number | null;
}

export function compareDeals(a: DealResult, b: DealResult): DealComparison {
  const dealsFunded = b.cashUsed > 0 ? Math.floor(a.cashUsed / b.cashUsed) : 0;
  const multiple =
    a.cashOnCash !== null && b.cashOnCash !== null && a.cashOnCash > 0
      ? b.cashOnCash / a.cashOnCash
      : null;
  return { dealsFunded, profitIfFunded: dealsFunded * b.profit, multiple };
}

/* ------------------------------------------------------------------ */
/* DSCR                                                                */
/* Rent divided by the full payment: principal and interest (or        */
/* interest only), taxes, insurance and association dues (PITIA).      */
/* ------------------------------------------------------------------ */

export interface DscrInput {
  rent: Num;
  value: Num;
  ltvPct: Num;
  ratePct: Num;
  termYears: Num;
  interestOnly: boolean;
  taxesYearly: Num;
  insuranceYearly: Num;
  hoaMonthly: Num;
}

export interface DscrResult {
  loanAmount: number;
  payment: number;
  taxes: number;
  insurance: number;
  hoa: number;
  pitia: number;
  dscr: number | null;
  rentFor100: number;
  rentFor125: number;
  /** The largest loan this rent supports at a 1.25 DSCR. */
  maxLoanAt125: number;
}

export function dscr(i: DscrInput): DscrResult {
  const loanAmount = Math.max(0, (n(i.value) * n(i.ltvPct)) / 100);
  const payment = i.interestOnly
    ? interestOnlyPayment(loanAmount, i.ratePct)
    : monthlyPayment(loanAmount, i.ratePct, i.termYears);
  const taxes = n(i.taxesYearly) / 12;
  const insurance = n(i.insuranceYearly) / 12;
  const hoa = n(i.hoaMonthly);
  const pitia = payment + taxes + insurance + hoa;
  const rent = n(i.rent);
  const capacity = rent / 1.25 - taxes - insurance - hoa;
  let maxLoanAt125 = 0;
  if (capacity > 0) {
    const monthlyRate = n(i.ratePct) / 100 / 12;
    maxLoanAt125 = i.interestOnly
      ? monthlyRate > 0
        ? capacity / monthlyRate
        : 0
      : loanFromPayment(capacity, i.ratePct, i.termYears);
  }
  return {
    loanAmount,
    payment,
    taxes,
    insurance,
    hoa,
    pitia,
    dscr: pitia > 0 ? rent / pitia : null,
    rentFor100: pitia,
    rentFor125: pitia * 1.25,
    maxLoanAt125,
  };
}

/* ------------------------------------------------------------------ */
/* Rehab budget                                                        */
/* ------------------------------------------------------------------ */

export interface RehabLineInput {
  enabled: boolean;
  qty: Num;
  unitCost: Num;
}

export function rehabTotals(lines: RehabLineInput[], contingencyPct: Num, squareFeet: Num) {
  const subtotal = lines.reduce(
    (sum, line) => (line.enabled ? sum + Math.max(0, n(line.qty)) * Math.max(0, n(line.unitCost)) : sum),
    0,
  );
  const contingency = (subtotal * Math.max(0, n(contingencyPct))) / 100;
  const total = subtotal + contingency;
  const sqft = n(squareFeet);
  return { subtotal, contingency, total, perSquareFoot: sqft > 0 ? total / sqft : null };
}

/* ------------------------------------------------------------------ */
/* What you are sitting on                                             */
/* A count, not a recommendation.                                      */
/* ------------------------------------------------------------------ */

export interface InventoryInput {
  homeValue: Num;
  owedOnHome: Num;
  borrowPct: Num;
  savings: Num;
  monthlyBills: Num;
  safetyMonths: Num;
  retirementWork: Num;
  retirementIra: Num;
  retirementOther: Num;
  brokerage: Num;
  lifeInsuranceCash: Num;
  ownedOutright: Num;
  otherPropertyEquity: Num;
}

export function inventory(i: InventoryInput) {
  const homeValue = Math.max(0, n(i.homeValue));
  const owed = Math.max(0, n(i.owedOnHome));
  const equity = Math.max(0, homeValue - owed);
  const borrowable = Math.max(0, (homeValue * n(i.borrowPct)) / 100 - owed);
  const savings = Math.max(0, n(i.savings));
  const safetyNet = Math.max(0, n(i.monthlyBills)) * Math.max(0, n(i.safetyMonths));
  const cashAboveSafetyNet = Math.max(0, savings - safetyNet);
  const retirement = n(i.retirementWork) + n(i.retirementIra) + n(i.retirementOther);
  const otherAssets =
    n(i.brokerage) + n(i.lifeInsuranceCash) + n(i.ownedOutright) + n(i.otherPropertyEquity);
  return {
    equity,
    borrowable,
    savings,
    safetyNet,
    cashAboveSafetyNet,
    retirement,
    otherAssets,
    /** Cash above the safety net plus equity a lender might let you borrow. */
    reachable: cashAboveSafetyNet + borrowable,
    total: equity + savings + retirement + otherAssets,
  };
}
