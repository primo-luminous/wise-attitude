import { NextRequest, NextResponse } from "next/server";
import { getAssets } from "@/app/actions/assets";

export async function GET(_req: NextRequest) {
  try {
    const assets = await getAssets();
    
    // กรองเฉพาะ assets ที่มี stock มากกว่า 0
    const availableAssets = assets.filter(asset => asset.totalQty > 0);
    
    return NextResponse.json(availableAssets);
  } catch (error) {
    console.error("Get assets API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลทรัพย์สิน" },
      { status: 500 }
    );
  }
}
