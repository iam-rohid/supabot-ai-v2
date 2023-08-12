import { type NextApiRequest, type NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";
import { linksTable } from "@/lib/schema/links";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { embeddingsTable } from "@/lib/schema/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { HtmlToTextTransformer } from "langchain/document_transformers/html_to_text";
import { type Document, addDocuments } from "@/server/vector-store";

/*
This function will get called from qstash when a user adds a new link to a project;
*/

async function getDocumentsFromWeb(url: string): Promise<Document[]> {
  const loader = new CheerioWebBaseLoader(url);
  const htmlDocs = await loader.load();

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
  const transformer = new HtmlToTextTransformer();

  const sequence = splitter.pipe(transformer);

  const docs = await sequence.invoke(htmlDocs);
  return docs.map((doc) => ({
    content: doc.pageContent,
    metadata: doc.metadata,
  }));
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { linkId, type } = req.body;

  if (!linkId) {
    return res.status(400).send("Link id not found");
  }

  // Get the link object and see if it available;
  const [link] = await db
    .select({
      trainingStatus: linksTable.trainingStatus,
      url: linksTable.url,
      projectId: linksTable.projectId,
    })
    .from(linksTable)
    .where(eq(linksTable.id, linkId));
  if (!link) {
    return res.status(400).send("Link not found!");
  }

  // if it's training do nothing;
  if (link.trainingStatus === "training") {
    return res.status(400).send("Link is already in training!");
  }

  try {
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
      await db
        .delete(embeddingsTable)
        .where(eq(embeddingsTable.linkId, linkId));
    }
    // fetch the website
    const docs = await getDocumentsFromWeb(link.url);
    await addDocuments(docs, link.projectId, linkId);

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
