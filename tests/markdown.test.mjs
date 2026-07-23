import assert from "node:assert/strict";
import test from "node:test";
import {
  createMarkdownExport,
  createObsidianExport,
  createObsidianIndex,
  createObsidianTemplate,
  markdownToPlainText,
  parseInlineMarkdown,
  parseMarkdown,
  readMarkdownImport,
} from "../src/lib/markdown.js";

test("Obsidian kit uses only core Markdown and a built-in search block", () => {
  assert.match(createObsidianTemplate("en"), /date: \{\{date\}\}[\s\S]*## My return/);
  assert.match(createObsidianTemplate("fr"), /## Mon retour/);
  assert.match(createObsidianIndex("en"), /```query\ntag:#cura\n```/);
});

test("Obsidian export keeps Seneca, the reply, and private reading notes together", () => {
  const exported = createObsidianExport({
    annotations: {
      letter: { text: "Return to this tomorrow.", strokes: [] },
      "highlight:time": { text: "Guard the morning.", strokes: [] },
    },
    bookmarks: [{ excerpt: "Nothing is ours, except time.", paragraphIndex: 1 }],
    highlights: [{ id: "time", quote: "time is our own" }],
    label: "LETTER I",
    letter: 1,
    locale: "en",
    original: ["Greetings from Seneca to his friend Lucilius.", "Nothing is ours, except time."],
    reply: "# Today\n\nI will keep one hour.",
    savedAt: "2026-07-22T12:00:00.000Z",
    sourceUrl: "https://en.wikisource.org/wiki/Moral_letters_to_Lucilius/Letter_1",
    title: "On Saving Time",
  });

  assert.match(exported, /^---\ncura: letter-1\nletter: 1\nlanguage: en\ndate: 2026-07-22/m);
  assert.match(exported, /## Seneca\n\nGreetings from Seneca/);
  assert.match(exported, /## My return\n\n# Today/);
  assert.match(exported, /## Highlights\n\n> time is our own\n\nGuard the morning\./);
  assert.match(exported, /## Bookmarks\n\n- Paragraph 2: Nothing is ours, except time\./);
  assert.match(exported, /## Notes\n\nReturn to this tomorrow\./);
});

test("Cura Markdown exports reopen without adding a duplicate title", () => {
  const source = "## Today\n\n> Keep to the work.\n\n- Read\n- Reply";
  const exported = createMarkdownExport({
    label: "LETTER XXXII",
    letter: 32,
    title: "On progress",
    locale: "en",
    savedAt: "2026-07-22T12:00:00.000Z",
    text: source,
  });

  assert.match(exported, /^---\ncura: letter-32\nletter: 32/m);
  assert.equal(readMarkdownImport(exported), source);
});

test("ordinary Markdown keeps its own leading heading", () => {
  const source = "# A private title\n\nA first paragraph.";
  assert.equal(readMarkdownImport(source), source);
});

test("legacy Cura headings can be removed by exact title", () => {
  const source = "# LETTER XXXII: On progress\n\nMy reply.";
  assert.equal(readMarkdownImport(source, ["LETTER XXXII: On progress"]), "My reply.");
});

test("Markdown parsing covers calm letter formatting", () => {
  const blocks = parseMarkdown("# Heading\n\nA **clear** thought.\n\n> A quotation\n\n1. Read\n2. Reply");
  assert.deepEqual(blocks.map((block) => block.type), ["heading", "paragraph", "quote", "list"]);
  assert.equal(blocks.at(-1).ordered, true);
  assert.deepEqual(parseInlineMarkdown("A **clear** thought.").map((token) => token.type), [
    "text",
    "strong",
    "text",
  ]);
});

test("plain text export removes Markdown markers", () => {
  assert.equal(
    markdownToPlainText("## Today\n\nA **clear** thought with *care*.\n\n- Read\n- Reply"),
    "Today\n\nA clear thought with care.\n\n- Read\n- Reply",
  );
});

test("unsafe Markdown link schemes stay as plain text", () => {
  const tokens = parseInlineMarkdown("[open](javascript:alert(1))");
  assert.deepEqual(tokens, [{ type: "text", value: "[open](javascript:alert(1))" }]);
});
