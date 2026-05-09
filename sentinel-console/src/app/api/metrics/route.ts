import { NextResponse } from "next/server";

const CLICKHOUSE_URL =
  process.env.CLICKHOUSE_URL ||
  "http://localhost:8123";

export async function GET() {
  try {
    const query = `
        SELECT
            count() as total,
            countIf(level = 'SECURITY') as blocked,
            countIf(level != 'SECURITY') as allowed
        FROM lumen_db.logs
    `;

    const res = await fetch(CLICKHOUSE_URL, {
        method: "POST",
        headers: {
            "X-ClickHouse-User":
            process.env.CLICKHOUSE_USER || "default",

            "X-ClickHouse-Key":
            process.env.CLICKHOUSE_PASSWORD || "",
        },
        body: query,
    });

    if (!res.ok) {
      throw new Error(`ClickHouse returned ${res.status}`);
    }

    const text = await res.text();

    console.log("CLICKHOUSE RESPONSE:", text);

    const [total, blocked, allowed] = text.trim().split("\t");

    return NextResponse.json({
      total: Number(total) || 0,
      blocked: Number(blocked) || 0,
      allowed: Number(allowed) || 0,
    });

  } catch (err) {
    console.error("Metrics API failed:", err);

    return NextResponse.json(
      {
        total: 0,
        blocked: 0,
        allowed: 0,
      },
      { status: 500 }
    );
  }
}