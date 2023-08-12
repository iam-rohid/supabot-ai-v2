import { db } from "./db";
import { embeddingsTable } from "@/lib/schema/embeddings";
import { embedTextArray } from "./openai";
import { linksTable } from "@/lib/schema/links";
import { maxInnerProduct } from "pgvector/drizzle-orm";
import { and, desc, eq, gt, sql } from "drizzle-orm";

export interface Document {
  metadata?: Record<string, any>;
  content: string;
}

export async function addVectors(
  vectors: number[][],
  docs: Document[],
  projectId: string,
  linkId?: string
) {
  const rows = vectors.map((embedding, idx) => ({
    embedding,
    content: docs[idx]!.content,
    metadata: docs[idx]!.metadata,
    projectId,
    ...(linkId ? { linkId } : {}),
  }));

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    try {
      await db.insert(embeddingsTable).values(chunk);
    } catch (error: any) {
      throw new Error(`Error inserting: ${error?.message}`);
    }
  }
}

export async function addDocuments(
  docs: Document[],
  projectId: string,
  linkId?: string
) {
  const texts = docs.map(({ content }) => content);
  const vectors = await embedTextArray(texts);
  return addVectors(vectors, docs, projectId, linkId);
}

export async function getDocuments(
  projectId: string,
  embedding: number[],
  threshold = 0.78,
  limit = 5
) {
  const sections = await db
    .select({
      id: embeddingsTable.id,
      content: embeddingsTable.content,
      link: {
        id: linksTable.id,
        url: linksTable.url,
      },
      dot_product: sql<number>`(${maxInnerProduct(
        embeddingsTable.embedding,
        embedding
      )}) * -1`,
    })
    .from(embeddingsTable)
    .leftJoin(linksTable, eq(linksTable.id, embeddingsTable.linkId))
    .where(({ dot_product }) =>
      and(eq(embeddingsTable.projectId, projectId), gt(dot_product, threshold))
    )
    .orderBy(({ dot_product }) => desc(dot_product))
    .limit(limit);

  return sections;
}
