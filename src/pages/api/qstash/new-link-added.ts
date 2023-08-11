import { type NextApiRequest, type NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";
import { linksTable } from "@/lib/schema/links";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { embeddingsTable } from "@/lib/schema/embeddings";
import * as cheerio from "cheerio";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { openai } from "@/server/openai";
import { type ResponseTypes } from "openai-edge";
import { splitMarkdownBySections } from "@/server/training-utils";

const fetchSectionsFromWebpage = async (url: string) => {
  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);
  $(
    "style, script, link, meta, img, svg, picture, video, iframe, input, textarea, nav, footer"
  ).remove();
  const content = $("body").html();
  const markdown = NodeHtmlMarkdown.translate(content!);
  const sections = splitMarkdownBySections(markdown);
  return sections;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { linkId, type } = req.body;

  if (!linkId) {
    return res.status(400).send("Link id not found");
  }

  // Get the link object and see if it available;
  const [link] = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.id, linkId))
    .limit(1);
  if (!link) {
    return res.status(400).send("Link not found!");
  }

  // if it's training do nothing;
  if (link.trainingStatus === "training") {
    return res.status(400).send("Link is already in training!");
  }

  // change status to training
  await db
    .update(linksTable)
    .set({
      trainingStatus: "training",
      updatedAt: new Date(),
    })
    .where(eq(linksTable.id, linkId));

  // Delete all embeding for this link if type === retrain
  if (type === "retrain") {
    await db.delete(embeddingsTable).where(eq(embeddingsTable.linkId, linkId));
  }

  // fetch the website
  const sections = await fetchSectionsFromWebpage(link.url);
  // generate embeddings with open ai
  try {
    // add the generated embeddings to db
    await Promise.allSettled(
      sections.map(async ({ content, heading }) => {
        const embeddingResponse = await openai.createEmbedding({
          model: "text-embedding-ada-002",
          input: content.replaceAll("\n", " "),
        });
        const embeddingData =
          (await embeddingResponse.json()) as ResponseTypes["createEmbedding"];
        const embedding = embeddingData.data[0]?.embedding;
        await db.insert(embeddingsTable).values({
          linkId,
          content,
          embedding,
          tokenCount: embeddingData.usage.total_tokens,
          metadata: {
            heading,
          },
        });
      })
    );

    // update the link status to success.
    await db
      .update(linksTable)
      .set({
        trainingStatus: "trained",
        lastTrainedAt: new Date(Date.now()),
        updatedAt: new Date(),
      })
      .where(eq(linksTable.id, linkId));
    return res.status(200).end();
  } catch (error) {
    await db
      .update(linksTable)
      .set({
        trainingStatus: "failed",
        lastTrainedAt: new Date(Date.now()),
        updatedAt: new Date(),
      })
      .where(eq(linksTable.id, linkId));
    throw error;
  }
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
