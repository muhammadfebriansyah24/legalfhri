import { NextResponse } from "next/server";
import { runAutoClose } from "@/lib/autoClose";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const secret = process.env.CRON_SECRET;

    if (secret && key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const closed = await runAutoClose();
    return NextResponse.json({ success: true, closed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
