import { describe, expect, it } from "vitest";
import {
  compareDeals,
  dealReturn,
  dscr,
  flipMaxOffer,
  houseHack,
  inventory,
  keepMaxOffer,
  loanFromPayment,
  monthlyPayment,
  rehabTotals,
  type Financing,
} from "./calculators";

describe("loans", () => {
  it("matches the guide's principal and interest on Lena's duplex", () => {
    // Live In, Rent Smart, page 14: $332,500 at 6.50% for 30 years is $2,102.
    expect(Math.round(monthlyPayment(332_500, 6.5, 30))).toBe(2102);
  });

  it("turns a payment back into the same loan", () => {
    const payment = monthlyPayment(160_000, 7.25, 30);
    expect(loanFromPayment(payment, 7.25, 30)).toBeCloseTo(160_000, 6);
  });

  it("handles a zero rate and empty fields", () => {
    expect(monthlyPayment(120_000, 0, 30)).toBeCloseTo(333.33, 2);
    expect(monthlyPayment(null, 6, 30)).toBe(0);
    expect(monthlyPayment(100_000, 6, 0)).toBe(0);
  });
});

describe("house hack", () => {
  // Lena's duplex, the guide's fictional teaching example (pages 14 and 15).
  const lena = houseHack({
    price: 350_000,
    downPaymentPct: 5,
    closingCosts: null,
    setupRepairs: null,
    cashOnHand: null,
    ratePct: 6.5,
    termYears: 30,
    taxes: 350,
    insurance: 150,
    mortgageInsurance: 140,
    hoa: 0,
    ownerUtilities: 180,
    maintenance: 292,
    capitalReserve: 150,
    vacancy: 100,
    other: 0,
    rent: 1650,
    firstYearRepair: 5000,
    currentHousing: null,
  });

  it("reproduces every number in the guide", () => {
    expect(lena.downPayment).toBe(17_500);
    expect(lena.loanAmount).toBe(332_500);
    expect(lena.totalOutflow).toBe(3464);
    expect(lena.housingCost).toBe(1814);
    expect(Math.round(lena.softCase)).toBe(2117);
    expect(Math.round(lena.repairYearCase)).toBe(2533);
  });

  it("hides cash remaining and the rent comparison until they are entered", () => {
    expect(lena.cashRemaining).toBeNull();
    expect(lena.vsCurrentHousing).toBeNull();
  });

  it("counts reserves and the lender's share of rent", () => {
    expect(lena.reserveLow).toBe(3464 * 3);
    expect(lena.reserveHigh).toBe(3464 * 6);
    expect(lena.lenderCountedRent).toBeCloseTo(1237.5, 6);
  });
});

const borrowing: Financing = {
  use: true,
  pctOfPrice: 90,
  pctOfRepairs: 100,
  ratePct: 11,
  pointsPct: 2,
};

describe("max offer, flip", () => {
  const base = {
    arv: 250_000,
    repairs: 40_000,
    months: 6,
    holdingMonthly: 600,
    buyClosingPct: 2,
    sellCostPct: 8,
    profit: 15,
    profitMode: "percent" as const,
  };

  it("solves the price so the profit comes out exactly", () => {
    const r = flipMaxOffer({ ...base, financing: borrowing });
    expect(r.ok).toBe(true);
    expect(r.maxOffer).toBeCloseTo(145_900 / 1.0875, 6);
    expect(250_000 - r.allIn).toBeCloseTo(37_500, 6);
  });

  it("works with cash and a dollar profit", () => {
    const r = flipMaxOffer({
      ...base,
      profit: 30_000,
      profitMode: "dollars",
      financing: { ...borrowing, use: false },
    });
    // 250,000 - 20,000 selling - 30,000 profit - 40,000 repairs - 3,600 holding = 156,400, / 1.02 closing
    expect(r.maxOffer).toBeCloseTo(156_400 / 1.02, 6);
    expect(r.loanAmount).toBe(0);
    expect(r.cashIn).toBeCloseTo(r.allIn - r.sellingCosts, 6);
  });

  it("says no when nothing is left for a purchase", () => {
    const r = flipMaxOffer({ ...base, repairs: 300_000, financing: borrowing });
    expect(r.ok).toBe(false);
  });
});

describe("max offer, keep and refinance", () => {
  it("leaves exactly the cash you said in the deal", () => {
    const r = keepMaxOffer({
      arv: 250_000,
      repairs: 40_000,
      months: 6,
      holdingMonthly: 600,
      buyClosingPct: 2,
      refiLtvPct: 75,
      refiClosingPct: 3,
      leaveIn: 0,
      financing: borrowing,
    });
    expect(r.maxOffer).toBeCloseTo(135_275 / 1.0875, 6);
    expect(r.leftIn).toBeCloseTo(0, 6);
    expect(r.newLoan).toBe(187_500);
    expect(r.equityAfter).toBe(62_500);
  });

  it("raises the price by the cash you will leave in", () => {
    const common = {
      arv: 250_000,
      repairs: 40_000,
      months: 6,
      holdingMonthly: 600,
      buyClosingPct: 2,
      refiLtvPct: 75,
      refiClosingPct: 3,
      financing: { ...borrowing, use: false },
    };
    const none = keepMaxOffer({ ...common, leaveIn: 0 });
    const some = keepMaxOffer({ ...common, leaveIn: 10_200 });
    expect(some.maxOffer - none.maxOffer).toBeCloseTo(10_000, 6);
    expect(some.leftIn).toBeCloseTo(10_200, 6);
  });
});

describe("did you really win", () => {
  // The Real Estate Pros Show, 07:15: 20 or 30k on a flip that took five or six hundred thousand.
  const a = dealReturn({ profit: 25_000, allIn: 550_000, cashIn: null, months: 6 });
  const b = dealReturn({ profit: 25_000, allIn: 150_000, cashIn: null, months: 6 });

  it("measures profit against the money it took", () => {
    expect(a.cashUsed).toBe(550_000);
    expect(a.cashOnCash).toBeCloseTo(25 / 550, 10);
    expect(a.perYear).toBeCloseTo((25 / 550) * 2, 10);
    expect(b.cashOnCash).toBeCloseTo(25 / 150, 10);
  });

  it("uses your own cash when it is less than the whole deal", () => {
    const leveraged = dealReturn({ profit: 25_000, allIn: 550_000, cashIn: 100_000, months: 12 });
    expect(leveraged.cashOnCash).toBeCloseTo(0.25, 10);
    expect(leveraged.returnOnAllIn).toBeCloseTo(25 / 550, 10);
    expect(leveraged.perYear).toBeCloseTo(0.25, 10);
  });

  it("counts how many smaller deals the same money funds", () => {
    const c = compareDeals(a, b);
    expect(c.dealsFunded).toBe(3);
    expect(c.profitIfFunded).toBe(75_000);
    expect(c.multiple).toBeCloseTo(550 / 150, 10);
  });
});

describe("dscr", () => {
  const input = {
    rent: 1900,
    value: 200_000,
    ltvPct: 80,
    ratePct: 7.25,
    termYears: 30,
    interestOnly: false,
    taxesYearly: 3600,
    insuranceYearly: 1500,
    hoaMonthly: 0,
  };

  it("divides rent by the full payment", () => {
    const r = dscr(input);
    expect(r.loanAmount).toBe(160_000);
    expect(r.taxes + r.insurance).toBeCloseTo(425, 10);
    expect(r.dscr).toBeCloseTo(1900 / (monthlyPayment(160_000, 7.25, 30) + 425), 10);
    expect(r.dscr).toBeCloseTo(1.253, 3);
  });

  it("finds the loan that lands exactly on 1.25", () => {
    const r = dscr(input);
    const atMax = dscr({ ...input, value: r.maxLoanAt125, ltvPct: 100 });
    expect(atMax.dscr).toBeCloseTo(1.25, 8);
  });

  it("handles interest only", () => {
    const r = dscr({ ...input, interestOnly: true });
    expect(r.payment).toBeCloseTo((160_000 * 0.0725) / 12, 8);
    const atMax = dscr({ ...input, interestOnly: true, value: r.maxLoanAt125, ltvPct: 100 });
    expect(atMax.dscr).toBeCloseTo(1.25, 8);
  });
});

describe("rehab budget", () => {
  it("adds checked lines and the contingency", () => {
    const r = rehabTotals(
      [
        { enabled: true, qty: 1400, unitCost: 1 },
        { enabled: true, qty: 1400, unitCost: 5 },
        { enabled: false, qty: 10, unitCost: 500 },
      ],
      10,
      1400,
    );
    expect(r.subtotal).toBe(8400);
    expect(r.contingency).toBe(840);
    expect(r.total).toBe(9240);
    expect(r.perSquareFoot).toBeCloseTo(6.6, 10);
  });
});

describe("what you are sitting on", () => {
  it("separates what you can reach from what you counted", () => {
    const r = inventory({
      homeValue: 300_000,
      owedOnHome: 180_000,
      borrowPct: 80,
      savings: 30_000,
      monthlyBills: 4000,
      safetyMonths: 6,
      retirementWork: 50_000,
      retirementIra: 10_000,
      retirementOther: null,
      brokerage: 5000,
      lifeInsuranceCash: null,
      ownedOutright: 15_000,
      otherPropertyEquity: null,
    });
    expect(r.equity).toBe(120_000);
    expect(r.borrowable).toBe(60_000);
    expect(r.cashAboveSafetyNet).toBe(6000);
    expect(r.reachable).toBe(66_000);
    expect(r.retirement).toBe(60_000);
    expect(r.total).toBe(120_000 + 30_000 + 60_000 + 20_000);
  });

  it("never shows negative equity or borrowing room", () => {
    const r = inventory({
      homeValue: 200_000,
      owedOnHome: 250_000,
      borrowPct: 80,
      savings: 0,
      monthlyBills: 0,
      safetyMonths: 0,
      retirementWork: null,
      retirementIra: null,
      retirementOther: null,
      brokerage: null,
      lifeInsuranceCash: null,
      ownedOutright: null,
      otherPropertyEquity: null,
    });
    expect(r.equity).toBe(0);
    expect(r.borrowable).toBe(0);
  });
});
