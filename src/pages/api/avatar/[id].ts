import { generateSVG } from "@/utils/gradient";
import { type NextApiRequest, type NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(500);
  }
  const svg = generateSVG(id);
  res.setHeader("Content-Type", "image/svg+xml");
  return res.send(svg);
}
