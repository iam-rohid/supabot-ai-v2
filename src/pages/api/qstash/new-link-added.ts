import { type NextApiRequest, type NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";
import { linksTable } from "@/lib/schema/links";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { embeddingsTable } from "@/lib/schema/embeddings";
import {
  generateEmbeddingFromSections,
  htmlToMarkdown,
  splitMarkdownBySections,
} from "@/server/training-utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("If this is printed, the signature has already been verified");
  console.log(JSON.stringify(req.body));
  const linkId = req.body.id;
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
  // if it's not idle do nothing;
  if (link.trainingStatus !== "idle") {
    return res.status(400).send("Link training status is not idle!");
  }

  // if it's idle then train
  // change status to training
  await db
    .update(linksTable)
    .set({
      trainingStatus: "training",
      updatedAt: new Date(),
    })
    .where(eq(linksTable.id, linkId));

  // Delete all embeding for this link if any available
  await db.delete(embeddingsTable).where(eq(embeddingsTable.linkId, linkId));

  // fetch the website
  let html: string;
  try {
    const res = await fetch(link.url);
    html = await res.text();
  } catch (error) {
    return res.status(400).send("Failed to fetch link");
  }

  // convert it to markdown
  const { markdown, metadata } = htmlToMarkdown(html);
  // make chunks from markdown
  const sections = splitMarkdownBySections(markdown);
  // generate embeddings with open ai
  try {
    const sectionsWithEmbedding = await generateEmbeddingFromSections(sections);

    // add the generated embeddings to db
    await Promise.allSettled(
      sectionsWithEmbedding.map((section) =>
        db.insert(embeddingsTable).values({
          linkId,
          content: section.content,
          embedding: section.embedding,
          tokenCount: section.tokenCount,
          metadata: {
            ...section.metadata,
          },
        })
      )
    );

    // update the link status to success.
    await db
      .update(linksTable)
      .set({
        metadata,
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
