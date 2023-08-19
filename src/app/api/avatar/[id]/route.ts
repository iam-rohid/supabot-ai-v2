import { generateSVG } from "@/utils/gradient";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) => {
  const svg = generateSVG(id);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
};
