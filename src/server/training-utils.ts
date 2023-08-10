import { openai } from "./openai";
import * as cheerio from "cheerio";
import type { Root, RootContent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString } from "mdast-util-to-string";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { type ResponseTypes } from "openai-edge";
import { u } from "unist-builder";

export const htmlToMarkdown = (html: string) => {
  const $ = cheerio.load(html);
  const title = $("title").text();
  let content = $("main").html();
  if (!content || !content.length) {
    content = $("body").html();
  }
  if (!content) {
    throw "No body or main tag found!";
  }
  const markdown = NodeHtmlMarkdown.translate(content);
  return { markdown, metadata: { title } };
};

export function splitTreeBy(
  tree: Root,
  predicate: (node: RootContent) => boolean
) {
  return tree.children.reduce<Root[]>((trees, node) => {
    const [lastTree] = trees.slice(-1);

    if (!lastTree || predicate(node)) {
      const tree: Root = u("root", [node]);
      return trees.concat(tree);
    }

    lastTree.children.push(node);
    return trees;
  }, []);
}

export function splitMarkdownBySections(markdown: string) {
  const mdTree = fromMarkdown(markdown, {
    mdastExtensions: [mdxFromMarkdown()],
  });

  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === "heading");

  const sections = sectionTrees.map((tree) => {
    const [firstNode] = tree.children;

    const heading =
      firstNode?.type === "heading" ? toString(firstNode) : undefined;

    return {
      content: toMarkdown(tree),
      heading,
    };
  });
  return sections;
}

export const generateEmbedding = async (input: string) => {
  const res = await openai.createEmbedding({
    input,
    model: "text-embedding-ada-002",
  });
  if (!res.ok) {
    throw res.statusText;
  }
  return (await res.json()) as ResponseTypes["createEmbedding"];
};

export async function generateEmbeddingFromSections(
  sections: { content: string; heading?: string }[]
) {
  return Promise.all(
    sections.map(async ({ content, heading }) => {
      const data = await generateEmbedding(content);
      const embedding = data.data[0]!.embedding;
      const tokenCount = data.usage.total_tokens;
      return {
        content,
        embedding,
        tokenCount,
        metadata: {
          heading,
          model: data.model,
        },
      };
    })
  );
}
