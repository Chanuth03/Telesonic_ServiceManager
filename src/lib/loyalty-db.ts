import { getDbPool } from "./db";
import {
  INITIAL_ADJUSTMENTS,
  INITIAL_DEALERS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_LOYALTY_SETTINGS,
  INITIAL_PRICE_LIST,
  INITIAL_REDEMPTIONS,
  type DealerLoyaltyMaster,
  type LoyaltyLedgerEntry,
  type LoyaltyManualAdjustment,
  type LoyaltyPriceListItem,
  type LoyaltySettingsConfig,
  type RedemptionRecord,
  type StoredLoyaltyState,
} from "./loyalty-data";

type Queryable = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function periodOf(date: string): string {
  return date.slice(0, 7);
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

let tablesReady: Promise<void> | null = null;

export async function ensureLoyaltyTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = createLoyaltyTables().catch((error) => {
      tablesReady = null;
      throw error;
    });
  }
  await tablesReady;
}

async function createLoyaltyTables(): Promise<void> {
  const pool = getDbPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loyalty_dealers (
      customer_code VARCHAR(32) PRIMARY KEY,
      customer_name VARCHAR(160) NOT NULL,
      customer_group VARCHAR(40) NOT NULL,
      division VARCHAR(16) NOT NULL,
      account_balance_lkr NUMERIC(14, 2) NOT NULL DEFAULT 0,
      loyalty_balance INTEGER NOT NULL DEFAULT 0,
      loyalty_value_lkr NUMERIC(14, 2) NOT NULL DEFAULT 0,
      loyalty_eligible BOOLEAN NOT NULL DEFAULT FALSE,
      eligible_from VARCHAR(32) NOT NULL DEFAULT '—',
      minimum_points_for_redemption INTEGER NOT NULL DEFAULT 5000,
      loyalty_status VARCHAR(24) NOT NULL DEFAULT 'Active',
      last_earned_date VARCHAR(32) NOT NULL DEFAULT '—',
      last_redeemed_date VARCHAR(32) NOT NULL DEFAULT '—'
    );

    CREATE TABLE IF NOT EXISTS loyalty_ledger (
      entry_no VARCHAR(40) PRIMARY KEY,
      customer_code VARCHAR(32) NOT NULL,
      customer_name VARCHAR(160) NOT NULL,
      entry_date VARCHAR(32) NOT NULL,
      period VARCHAR(16) NOT NULL,
      entry_type VARCHAR(24) NOT NULL,
      doc_type VARCHAR(40) NOT NULL,
      doc_no VARCHAR(64) NOT NULL,
      base_doc VARCHAR(64),
      item_code VARCHAR(80),
      description TEXT,
      quantity NUMERIC(12, 2),
      points_per_unit NUMERIC(12, 2),
      points INTEGER NOT NULL,
      running_balance INTEGER NOT NULL,
      conversion_rate NUMERIC(10, 4),
      value_lkr NUMERIC(14, 2),
      reason TEXT,
      created_by VARCHAR(160) NOT NULL,
      approved_by VARCHAR(160),
      reversed_by_entry VARCHAR(40),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loyalty_redemptions (
      redemption_no VARCHAR(40) PRIMARY KEY,
      customer_code VARCHAR(32) NOT NULL,
      customer_name VARCHAR(160) NOT NULL,
      request_date VARCHAR(32) NOT NULL,
      points_to_redeem INTEGER NOT NULL,
      conversion_rate NUMERIC(10, 4) NOT NULL,
      redemption_value_lkr NUMERIC(14, 2) NOT NULL,
      balance_available_before INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      status VARCHAR(24) NOT NULL,
      credit_memo_doc_no VARCHAR(64),
      invoices_to_settle JSONB NOT NULL DEFAULT '[]',
      approvals JSONB NOT NULL DEFAULT '[]',
      loyalty_ledger_ref VARCHAR(40),
      exclude_from_incentive BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS loyalty_adjustments (
      adjustment_no VARCHAR(40) PRIMARY KEY,
      customer_code VARCHAR(32) NOT NULL,
      customer_name VARCHAR(160) NOT NULL,
      adjustment_date VARCHAR(32) NOT NULL,
      adjustment_type VARCHAR(24) NOT NULL,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_doc VARCHAR(80) NOT NULL,
      remarks TEXT NOT NULL DEFAULT '',
      attachment_name VARCHAR(180),
      status VARCHAR(24) NOT NULL,
      approvers JSONB NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS loyalty_price_list (
      item_code VARCHAR(40) PRIMARY KEY,
      description TEXT NOT NULL,
      division VARCHAR(16) NOT NULL,
      capacity_attribute VARCHAR(80) NOT NULL,
      rate_formula VARCHAR(80) NOT NULL,
      points_per_unit INTEGER NOT NULL,
      effective_from VARCHAR(32) NOT NULL,
      status VARCHAR(24) NOT NULL,
      version VARCHAR(16) NOT NULL,
      approver VARCHAR(160) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loyalty_settings (
      id VARCHAR(16) PRIMARY KEY,
      conversion_rate_lkr NUMERIC(10, 4) NOT NULL,
      effective_from VARCHAR(32) NOT NULL,
      rounding VARCHAR(64) NOT NULL,
      default_eligible_groups JSONB NOT NULL,
      redemption_document_type VARCHAR(120) NOT NULL,
      redemption_gl_account VARCHAR(160) NOT NULL,
      points_expiry_policy VARCHAR(64) NOT NULL,
      liability_accounting_method VARCHAR(80) NOT NULL
    );
  `);

  const count = await pool.query(`SELECT COUNT(*)::int AS count FROM loyalty_dealers`);
  if (asNumber(count.rows[0]?.count) > 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const dealer of INITIAL_DEALERS) {
      await client.query(
        `INSERT INTO loyalty_dealers (
          customer_code, customer_name, customer_group, division, account_balance_lkr,
          loyalty_balance, loyalty_value_lkr, loyalty_eligible, eligible_from,
          minimum_points_for_redemption, loyalty_status, last_earned_date, last_redeemed_date
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          dealer.customerCode,
          dealer.customerName,
          dealer.customerGroup,
          dealer.division,
          dealer.accountBalanceLKR,
          dealer.loyaltyBalance,
          dealer.loyaltyValueLKR,
          dealer.loyaltyEligible,
          dealer.eligibleFrom,
          dealer.minimumPointsForRedemption,
          dealer.loyaltyStatus,
          dealer.lastEarnedDate,
          dealer.lastRedeemedDate,
        ],
      );
    }
    for (const entry of INITIAL_LEDGER_ENTRIES) {
      await insertLedger(client, entry);
    }
    for (const redemption of INITIAL_REDEMPTIONS) {
      await insertRedemption(client, redemption);
    }
    for (const adjustment of INITIAL_ADJUSTMENTS) {
      await insertAdjustment(client, adjustment);
    }
    for (const item of INITIAL_PRICE_LIST) {
      await client.query(
        `INSERT INTO loyalty_price_list (
          item_code, description, division, capacity_attribute, rate_formula,
          points_per_unit, effective_from, status, version, approver
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          item.itemCode,
          item.description,
          item.division,
          item.capacityAttribute,
          item.rateFormula,
          item.pointsPerUnit,
          item.effectiveFrom,
          item.status,
          item.version,
          item.approver,
        ],
      );
    }
    await upsertSettings(client, INITIAL_LOYALTY_SETTINGS);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function mapDealer(row: Record<string, unknown>): DealerLoyaltyMaster {
  return {
    customerCode: String(row.customer_code),
    customerName: String(row.customer_name),
    customerGroup: row.customer_group as DealerLoyaltyMaster["customerGroup"],
    division: row.division as DealerLoyaltyMaster["division"],
    accountBalanceLKR: asNumber(row.account_balance_lkr),
    loyaltyBalance: asNumber(row.loyalty_balance),
    loyaltyValueLKR: asNumber(row.loyalty_value_lkr),
    loyaltyEligible: Boolean(row.loyalty_eligible),
    eligibleFrom: String(row.eligible_from),
    minimumPointsForRedemption: asNumber(row.minimum_points_for_redemption),
    loyaltyStatus: row.loyalty_status as DealerLoyaltyMaster["loyaltyStatus"],
    lastEarnedDate: String(row.last_earned_date),
    lastRedeemedDate: String(row.last_redeemed_date),
  };
}

function mapLedger(row: Record<string, unknown>): LoyaltyLedgerEntry {
  const entry: LoyaltyLedgerEntry = {
    entryNo: String(row.entry_no),
    customerCode: String(row.customer_code),
    customerName: String(row.customer_name),
    date: String(row.entry_date),
    period: String(row.period),
    entryType: row.entry_type as LoyaltyLedgerEntry["entryType"],
    docType: row.doc_type as LoyaltyLedgerEntry["docType"],
    docNo: String(row.doc_no),
    points: asNumber(row.points),
    runningBalance: asNumber(row.running_balance),
    createdBy: String(row.created_by),
  };
  if (row.base_doc) entry.baseDoc = String(row.base_doc);
  if (row.item_code) entry.itemCode = String(row.item_code);
  if (row.description) entry.description = String(row.description);
  if (row.quantity != null) entry.quantity = asNumber(row.quantity);
  if (row.points_per_unit != null) entry.pointsPerUnit = asNumber(row.points_per_unit);
  if (row.conversion_rate != null) entry.conversionRate = asNumber(row.conversion_rate);
  if (row.value_lkr != null) entry.valueLKR = asNumber(row.value_lkr);
  if (row.reason) entry.reason = String(row.reason);
  if (row.approved_by) entry.approvedBy = String(row.approved_by);
  if (row.reversed_by_entry) entry.reversedByEntry = String(row.reversed_by_entry);
  return entry;
}

function mapRedemption(row: Record<string, unknown>): RedemptionRecord {
  const record: RedemptionRecord = {
    redemptionNo: String(row.redemption_no),
    customerCode: String(row.customer_code),
    customerName: String(row.customer_name),
    requestDate: String(row.request_date),
    pointsToRedeem: asNumber(row.points_to_redeem),
    conversionRate: asNumber(row.conversion_rate),
    redemptionValueLKR: asNumber(row.redemption_value_lkr),
    balanceAvailableBefore: asNumber(row.balance_available_before),
    balanceAfter: asNumber(row.balance_after),
    status: row.status as RedemptionRecord["status"],
    invoicesToSettle: asJson(row.invoices_to_settle, []),
    approvals: asJson(row.approvals, []),
    excludeFromIncentive: true,
  };
  if (row.credit_memo_doc_no) record.creditMemoDocNo = String(row.credit_memo_doc_no);
  if (row.loyalty_ledger_ref) record.loyaltyLedgerRef = String(row.loyalty_ledger_ref);
  return record;
}

function mapAdjustment(row: Record<string, unknown>): LoyaltyManualAdjustment {
  const record: LoyaltyManualAdjustment = {
    adjustmentNo: String(row.adjustment_no),
    customerCode: String(row.customer_code),
    customerName: String(row.customer_name),
    date: String(row.adjustment_date),
    type: row.adjustment_type as LoyaltyManualAdjustment["type"],
    points: asNumber(row.points),
    reason: String(row.reason),
    referenceDoc: String(row.reference_doc),
    remarks: String(row.remarks ?? ""),
    status: row.status as LoyaltyManualAdjustment["status"],
    approvers: asJson(row.approvers, []),
  };
  if (row.attachment_name) record.attachmentName = String(row.attachment_name);
  return record;
}

function mapPrice(row: Record<string, unknown>): LoyaltyPriceListItem {
  return {
    itemCode: String(row.item_code),
    description: String(row.description),
    division: row.division as LoyaltyPriceListItem["division"],
    capacityAttribute: String(row.capacity_attribute),
    rateFormula: String(row.rate_formula),
    pointsPerUnit: asNumber(row.points_per_unit),
    effectiveFrom: String(row.effective_from),
    status: row.status as LoyaltyPriceListItem["status"],
    version: String(row.version),
    approver: String(row.approver),
  };
}

function mapSettings(row: Record<string, unknown>): LoyaltySettingsConfig {
  return {
    conversionRateLKR: asNumber(row.conversion_rate_lkr),
    effectiveFrom: String(row.effective_from),
    rounding: row.rounding as LoyaltySettingsConfig["rounding"],
    defaultEligibleGroups: asJson(row.default_eligible_groups, ["Dealer"]),
    redemptionDocumentType: String(row.redemption_document_type),
    redemptionGLAccount: String(row.redemption_gl_account),
    pointsExpiryPolicy: row.points_expiry_policy as LoyaltySettingsConfig["pointsExpiryPolicy"],
    liabilityAccountingMethod:
      row.liability_accounting_method as LoyaltySettingsConfig["liabilityAccountingMethod"],
  };
}

async function insertLedger(db: Queryable, entry: LoyaltyLedgerEntry): Promise<void> {
  await db.query(
    `INSERT INTO loyalty_ledger (
      entry_no, customer_code, customer_name, entry_date, period, entry_type, doc_type, doc_no,
      base_doc, item_code, description, quantity, points_per_unit, points, running_balance,
      conversion_rate, value_lkr, reason, created_by, approved_by, reversed_by_entry
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
    [
      entry.entryNo,
      entry.customerCode,
      entry.customerName,
      entry.date,
      entry.period,
      entry.entryType,
      entry.docType,
      entry.docNo,
      entry.baseDoc ?? null,
      entry.itemCode ?? null,
      entry.description ?? null,
      entry.quantity ?? null,
      entry.pointsPerUnit ?? null,
      entry.points,
      entry.runningBalance,
      entry.conversionRate ?? null,
      entry.valueLKR ?? null,
      entry.reason ?? null,
      entry.createdBy,
      entry.approvedBy ?? null,
      entry.reversedByEntry ?? null,
    ],
  );
}

async function insertRedemption(db: Queryable, record: RedemptionRecord): Promise<void> {
  await db.query(
    `INSERT INTO loyalty_redemptions (
      redemption_no, customer_code, customer_name, request_date, points_to_redeem, conversion_rate,
      redemption_value_lkr, balance_available_before, balance_after, status, credit_memo_doc_no,
      invoices_to_settle, approvals, loyalty_ledger_ref, exclude_from_incentive
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14,$15)`,
    [
      record.redemptionNo,
      record.customerCode,
      record.customerName,
      record.requestDate,
      record.pointsToRedeem,
      record.conversionRate,
      record.redemptionValueLKR,
      record.balanceAvailableBefore,
      record.balanceAfter,
      record.status,
      record.creditMemoDocNo ?? null,
      JSON.stringify(record.invoicesToSettle),
      JSON.stringify(record.approvals),
      record.loyaltyLedgerRef ?? null,
      true,
    ],
  );
}

async function insertAdjustment(db: Queryable, record: LoyaltyManualAdjustment): Promise<void> {
  await db.query(
    `INSERT INTO loyalty_adjustments (
      adjustment_no, customer_code, customer_name, adjustment_date, adjustment_type, points,
      reason, reference_doc, remarks, attachment_name, status, approvers
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)`,
    [
      record.adjustmentNo,
      record.customerCode,
      record.customerName,
      record.date,
      record.type,
      record.points,
      record.reason,
      record.referenceDoc,
      record.remarks,
      record.attachmentName ?? null,
      record.status,
      JSON.stringify(record.approvers),
    ],
  );
}

async function upsertSettings(db: Queryable, settings: LoyaltySettingsConfig): Promise<void> {
  await db.query(
    `INSERT INTO loyalty_settings (
      id, conversion_rate_lkr, effective_from, rounding, default_eligible_groups,
      redemption_document_type, redemption_gl_account, points_expiry_policy, liability_accounting_method
    ) VALUES ('default',$1,$2,$3,$4::jsonb,$5,$6,$7,$8)
    ON CONFLICT (id) DO UPDATE SET
      conversion_rate_lkr = EXCLUDED.conversion_rate_lkr,
      effective_from = EXCLUDED.effective_from,
      rounding = EXCLUDED.rounding,
      default_eligible_groups = EXCLUDED.default_eligible_groups,
      redemption_document_type = EXCLUDED.redemption_document_type,
      redemption_gl_account = EXCLUDED.redemption_gl_account,
      points_expiry_policy = EXCLUDED.points_expiry_policy,
      liability_accounting_method = EXCLUDED.liability_accounting_method`,
    [
      settings.conversionRateLKR,
      settings.effectiveFrom,
      settings.rounding,
      JSON.stringify(settings.defaultEligibleGroups),
      settings.redemptionDocumentType,
      settings.redemptionGLAccount,
      settings.pointsExpiryPolicy,
      settings.liabilityAccountingMethod,
    ],
  );
}

async function readState(db: Queryable): Promise<StoredLoyaltyState> {
  const dealers = await db.query(`SELECT * FROM loyalty_dealers ORDER BY customer_name`);
  const ledger = await db.query(`SELECT * FROM loyalty_ledger ORDER BY created_at DESC, entry_no DESC`);
  const redemptions = await db.query(
    `SELECT * FROM loyalty_redemptions ORDER BY request_date DESC, redemption_no DESC`,
  );
  const adjustments = await db.query(
    `SELECT * FROM loyalty_adjustments ORDER BY adjustment_date DESC, adjustment_no DESC`,
  );
  const priceList = await db.query(`SELECT * FROM loyalty_price_list ORDER BY item_code`);
  const settings = await db.query(`SELECT * FROM loyalty_settings WHERE id = 'default'`);
  return {
    dealers: dealers.rows.map(mapDealer),
    ledger: ledger.rows.map(mapLedger),
    redemptions: redemptions.rows.map(mapRedemption),
    adjustments: adjustments.rows.map(mapAdjustment),
    priceList: priceList.rows.map(mapPrice),
    settings: settings.rows[0] ? mapSettings(settings.rows[0]) : INITIAL_LOYALTY_SETTINGS,
  };
}

export async function getLoyaltyState(): Promise<StoredLoyaltyState> {
  await ensureLoyaltyTables();
  return readState(getDbPool());
}

async function withTransaction<T>(work: (db: Queryable) => Promise<T>): Promise<T> {
  await ensureLoyaltyTables();
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function nextDoc(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

export async function createLoyaltyRedemption(
  input: RedemptionRecord,
): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    const dealerRows = await db.query(
      `SELECT * FROM loyalty_dealers WHERE customer_code = $1 FOR UPDATE`,
      [input.customerCode],
    );
    const dealer = dealerRows.rows[0] ? mapDealer(dealerRows.rows[0]) : null;
    if (!dealer) throw new Error("Dealer was not found.");
    if (!dealer.loyaltyEligible || dealer.loyaltyStatus !== "Active") {
      throw new Error("This dealer is not eligible to redeem loyalty points.");
    }
    const points = Math.floor(asNumber(input.pointsToRedeem));
    if (points <= 0) throw new Error("Points to redeem must be a whole number greater than zero.");
    if (points < dealer.minimumPointsForRedemption) {
      throw new Error(`Minimum redemption is ${dealer.minimumPointsForRedemption} points.`);
    }
    if (points > dealer.loyaltyBalance) {
      throw new Error("Points to redeem cannot exceed the available balance.");
    }
    const settings = await readState(db);
    const rate = settings.settings.conversionRateLKR || 1;
    const record: RedemptionRecord = {
      ...input,
      redemptionNo: input.redemptionNo || nextDoc("LR-2026"),
      customerName: dealer.customerName,
      requestDate: input.requestDate || today(),
      pointsToRedeem: points,
      conversionRate: rate,
      redemptionValueLKR: Math.floor(points * rate),
      balanceAvailableBefore: dealer.loyaltyBalance,
      balanceAfter: dealer.loyaltyBalance - points,
      status: "Submitted",
      excludeFromIncentive: true,
      approvals: input.approvals?.length
        ? input.approvals
        : [{ role: "Finance Officer", approver: "Pending Assignment", decision: "Pending" }],
    };
    await insertRedemption(db, record);
    return readState(db);
  });
}

export async function approveLoyaltyRedemption(redemptionNo: string): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    const rows = await db.query(
      `SELECT * FROM loyalty_redemptions WHERE redemption_no = $1 FOR UPDATE`,
      [redemptionNo],
    );
    const current = rows.rows[0] ? mapRedemption(rows.rows[0]) : null;
    if (!current) throw new Error("Redemption was not found.");
    if (current.status !== "Submitted") {
      throw new Error("Only a submitted redemption can be approved.");
    }
    const approvals = [
      ...current.approvals,
      {
        role: "Finance Officer",
        approver: "Finance Manager",
        decision: "Approved" as const,
        date: today(),
      },
    ];
    await db.query(
      `UPDATE loyalty_redemptions SET status = 'Approved', approvals = $2::jsonb WHERE redemption_no = $1`,
      [redemptionNo, JSON.stringify(approvals)],
    );
    return readState(db);
  });
}

export async function postLoyaltyRedemption(redemptionNo: string): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    const rows = await db.query(
      `SELECT * FROM loyalty_redemptions WHERE redemption_no = $1 FOR UPDATE`,
      [redemptionNo],
    );
    const current = rows.rows[0] ? mapRedemption(rows.rows[0]) : null;
    if (!current) throw new Error("Redemption was not found.");
    if (current.status !== "Approved") {
      throw new Error("Approve the redemption before posting the credit memo.");
    }
    const dealerRows = await db.query(
      `SELECT * FROM loyalty_dealers WHERE customer_code = $1 FOR UPDATE`,
      [current.customerCode],
    );
    const dealer = dealerRows.rows[0] ? mapDealer(dealerRows.rows[0]) : null;
    if (!dealer) throw new Error("Dealer was not found.");
    if (current.pointsToRedeem > dealer.loyaltyBalance) {
      throw new Error("Available points changed. This redemption can no longer be posted.");
    }
    const newBalance = dealer.loyaltyBalance - current.pointsToRedeem;
    const date = today();
    const creditMemoDocNo = nextDoc("CM-26");
    const entryNo = nextDoc("LL-2026");
    await db.query(
      `UPDATE loyalty_dealers
       SET loyalty_balance = $2, loyalty_value_lkr = $3, last_redeemed_date = $4
       WHERE customer_code = $1`,
      [dealer.customerCode, newBalance, newBalance * current.conversionRate, date],
    );
    await insertLedger(db, {
      entryNo,
      customerCode: dealer.customerCode,
      customerName: dealer.customerName,
      date,
      period: periodOf(date),
      entryType: "Redeem",
      docType: "Redemption",
      docNo: current.redemptionNo,
      baseDoc: creditMemoDocNo,
      points: -current.pointsToRedeem,
      runningBalance: newBalance,
      conversionRate: current.conversionRate,
      valueLKR: current.redemptionValueLKR,
      reason: `Settled open invoice ${current.invoicesToSettle[0]?.invoiceNo || "N/A"}`,
      createdBy: "Finance (System Add-on)",
      approvedBy: "Head of Finance",
    });
    await db.query(
      `UPDATE loyalty_redemptions
       SET status = 'Posted', credit_memo_doc_no = $2, loyalty_ledger_ref = $3, balance_after = $4
       WHERE redemption_no = $1`,
      [redemptionNo, creditMemoDocNo, entryNo, newBalance],
    );
    return readState(db);
  });
}

export async function cancelLoyaltyRedemption(redemptionNo: string): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    const rows = await db.query(
      `SELECT * FROM loyalty_redemptions WHERE redemption_no = $1 FOR UPDATE`,
      [redemptionNo],
    );
    const current = rows.rows[0] ? mapRedemption(rows.rows[0]) : null;
    if (!current) throw new Error("Redemption was not found.");
    if (current.status === "Cancelled") throw new Error("This redemption is already cancelled.");
    if (current.status === "Posted") {
      const dealerRows = await db.query(
        `SELECT * FROM loyalty_dealers WHERE customer_code = $1 FOR UPDATE`,
        [current.customerCode],
      );
      const dealer = dealerRows.rows[0] ? mapDealer(dealerRows.rows[0]) : null;
      if (!dealer) throw new Error("Dealer was not found.");
      const restored = dealer.loyaltyBalance + current.pointsToRedeem;
      const date = today();
      const entryNo = nextDoc("LL-2026");
      await db.query(
        `UPDATE loyalty_dealers SET loyalty_balance = $2, loyalty_value_lkr = $3 WHERE customer_code = $1`,
        [dealer.customerCode, restored, restored * current.conversionRate],
      );
      await insertLedger(db, {
        entryNo,
        customerCode: dealer.customerCode,
        customerName: dealer.customerName,
        date,
        period: periodOf(date),
        entryType: "Reverse",
        docType: "Reversal",
        docNo: `${current.creditMemoDocNo || current.redemptionNo}-REV`,
        baseDoc: current.redemptionNo,
        points: current.pointsToRedeem,
        runningBalance: restored,
        reason: `Redemption cancellation reversal; restored ${current.pointsToRedeem} points.`,
        createdBy: "Finance (Audit Reversal)",
        reversedByEntry: current.loyaltyLedgerRef,
      });
    }
    await db.query(`UPDATE loyalty_redemptions SET status = 'Cancelled' WHERE redemption_no = $1`, [
      redemptionNo,
    ]);
    return readState(db);
  });
}

export async function createLoyaltyAdjustment(
  input: LoyaltyManualAdjustment,
): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    const dealerRows = await db.query(`SELECT * FROM loyalty_dealers WHERE customer_code = $1`, [
      input.customerCode,
    ]);
    if (!dealerRows.rows[0]) throw new Error("Dealer was not found.");
    const points = Math.floor(asNumber(input.points));
    if (points <= 0) throw new Error("Adjustment points must be a whole number greater than zero.");
    if (!input.reason?.trim()) throw new Error("An adjustment reason is required.");
    await insertAdjustment(db, {
      ...input,
      adjustmentNo: input.adjustmentNo || nextDoc("LA-2026"),
      customerName: String(dealerRows.rows[0].customer_name),
      date: input.date || today(),
      points,
      status: "Submitted",
    });
    return readState(db);
  });
}

export async function approveLoyaltyAdjustment(adjustmentNo: string): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    const rows = await db.query(
      `SELECT * FROM loyalty_adjustments WHERE adjustment_no = $1 FOR UPDATE`,
      [adjustmentNo],
    );
    const current = rows.rows[0] ? mapAdjustment(rows.rows[0]) : null;
    if (!current) throw new Error("Adjustment was not found.");
    if (current.status === "Posted") throw new Error("This adjustment is already posted.");
    if (current.status === "Rejected") throw new Error("A rejected adjustment cannot be posted.");
    const dealerRows = await db.query(
      `SELECT * FROM loyalty_dealers WHERE customer_code = $1 FOR UPDATE`,
      [current.customerCode],
    );
    const dealer = dealerRows.rows[0] ? mapDealer(dealerRows.rows[0]) : null;
    if (!dealer) throw new Error("Dealer was not found.");
    const delta = current.type === "Addition" ? current.points : -current.points;
    const newBalance = dealer.loyaltyBalance + delta;
    if (newBalance < 0) throw new Error("This deduction is larger than the available balance.");
    const date = today();
    const settings = (await readState(db)).settings;
    await db.query(
      `UPDATE loyalty_dealers SET loyalty_balance = $2, loyalty_value_lkr = $3 WHERE customer_code = $1`,
      [dealer.customerCode, newBalance, newBalance * settings.conversionRateLKR],
    );
    await insertLedger(db, {
      entryNo: nextDoc("LL-2026"),
      customerCode: dealer.customerCode,
      customerName: dealer.customerName,
      date,
      period: periodOf(date),
      entryType: "Adjust",
      docType: "Manual Adjustment",
      docNo: current.adjustmentNo,
      baseDoc: current.referenceDoc,
      points: delta,
      runningBalance: newBalance,
      reason: current.reason,
      createdBy: "Finance (Adjustment Workflow)",
      approvedBy: "HOD Sales & Finance",
    });
    await db.query(`UPDATE loyalty_adjustments SET status = 'Posted' WHERE adjustment_no = $1`, [
      adjustmentNo,
    ]);
    return readState(db);
  });
}

export async function saveLoyaltySettings(
  settings: LoyaltySettingsConfig,
): Promise<StoredLoyaltyState> {
  return withTransaction(async (db) => {
    if (!Number.isFinite(settings.conversionRateLKR) || settings.conversionRateLKR <= 0) {
      throw new Error("Conversion rate must be greater than zero.");
    }
    await upsertSettings(db, settings);
    return readState(db);
  });
}
