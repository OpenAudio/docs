/**
 * Generates llms.txt, llms-full.txt, and individual .md files
 * for AI/LLM consumption of the docs site.
 *
 * Run: node scripts/generate-llms-txt.cjs
 */

const fs = require("fs");
const path = require("path");

const PAGES_DIR = path.join(__dirname, "..", "docs", "pages");
const PUBLIC_DIR = path.join(__dirname, "..", "docs", "public");
const SITE_URL = "https://docs.audius.co";

// Ordered page manifest derived from vocs.config.ts sidebar
const PAGES = [
  { path: "/", file: "index.mdx", title: "Open Audio Protocol" },
  // Concepts
  { path: "/concepts/audio", file: "concepts/audio.mdx", title: "$AUDIO" },
  {
    path: "/concepts/staking",
    file: "concepts/staking.mdx",
    title: "Staking",
  },
  {
    path: "/concepts/governance",
    file: "concepts/governance.mdx",
    title: "Governance",
  },
  {
    path: "/concepts/validators",
    file: "concepts/validators.mdx",
    title: "Validators",
  },
  {
    path: "/concepts/wire-protocol",
    file: "concepts/wire-protocol.mdx",
    title: "Wire Protocol",
  },
  {
    path: "/concepts/media-storage",
    file: "concepts/media-storage.mdx",
    title: "Media Storage",
  },
  {
    path: "/concepts/moderation",
    file: "concepts/moderation.mdx",
    title: "Moderation",
  },
  {
    path: "/concepts/indexers-views",
    file: "concepts/indexers-views.mdx",
    title: "Indexers & Views",
  },
  {
    path: "/concepts/artist-coins",
    file: "concepts/artist-coins.mdx",
    title: "Artist Coins",
  },
  // Tutorials
  {
    path: "/tutorials/run-a-node",
    file: "tutorials/run-a-node.mdx",
    title: "Run a Node",
  },
  {
    path: "/tutorials/upload-to-the-protocol",
    file: "tutorials/upload-to-the-protocol.mdx",
    title: "Upload to the Protocol",
  },
  {
    path: "/tutorials/gate-release-access",
    file: "tutorials/gate-release-access.mdx",
    title: "Gate Release Access",
  },
  {
    path: "/tutorials/launch-artist-coins",
    file: "tutorials/launch-artist-coins.mdx",
    title: "Launch Artist Coins",
  },
  {
    path: "/tutorials/create-reward-pools",
    file: "tutorials/create-reward-pools.mdx",
    title: "Create Reward Pools",
  },
  // Reference
  {
    path: "/reference/ethereum-contracts",
    file: "reference/ethereum-contracts.mdx",
    title: "Ethereum Contracts",
  },
  {
    path: "/reference/solana-programs",
    file: "reference/solana-programs.mdx",
    title: "Solana Programs",
  },
  { path: "/reference/audits", file: "reference/audits.mdx", title: "Audits" },
  {
    path: "/reference/open-music-license",
    file: "reference/open-music-license.mdx",
    title: "Open Music License",
  },
];

// Blog posts are discovered dynamically
function discoverBlogPosts() {
  const blogDir = path.join(PAGES_DIR, "blog");
  if (!fs.existsSync(blogDir)) return [];
  return fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx") && f !== "index.mdx")
    .map((f) => {
      const raw = fs.readFileSync(path.join(blogDir, f), "utf8");
      const slug = f.replace(/\.mdx$/, "");
      const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
      let date = "";
      let description = "";
      if (frontmatter) {
        const dateMatch = frontmatter[1].match(/^date:\s*(.+)$/m);
        if (dateMatch) date = dateMatch[1].trim();
        const descMatch = frontmatter[1].match(/^description:\s*(.+)$/m);
        if (descMatch) description = descMatch[1].trim();
      }
      // Derive title from first # heading
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : slug;
      return {
        path: `/blog/${slug}`,
        file: `blog/${f}`,
        title,
        date,
        description,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Strip MDX/JSX syntax to produce clean markdown.
 */
function mdxToMarkdown(content) {
  let md = content;

  // Remove frontmatter
  md = md.replace(/^---\n[\s\S]*?\n---\n*/, "");

  // Remove import statements
  md = md.replace(/^import\s+.*$/gm, "");

  // Remove <link> tags
  md = md.replace(/^<link\s+[^>]*\/>\s*$/gm, "");

  // Remove self-closing JSX components (e.g. <Orb .../>, <SubstackLink />)
  md = md.replace(/^<[A-Z][A-Za-z]*\s*[^>]*\/>\s*$/gm, "");

  // Remove JSX component blocks (opening + closing tags on their own lines)
  md = md.replace(/^<[A-Z][A-Za-z]*[^>]*>[\s\S]*?<\/[A-Z][A-Za-z]*>\s*$/gm, "");

  // Convert <img> tags to markdown images
  md = md.replace(
    /<img\s+[^>]*?(?:alt=['"]([^'"]*?)['"])?\s*[^>]*?src=['"]([^'"]*?)['"][^>]*?\/?>/g,
    (_, alt, src) => (alt ? `![${alt}](${src})` : `![](${src})`)
  );

  // Remove <br /> and <br> tags
  md = md.replace(/<br\s*\/?>/g, "");

  // Remove <div> wrappers
  md = md.replace(/<\/?div[^>]*>/g, "");

  // Remove ::authors directive
  md = md.replace(/^::authors\s*$/gm, "");

  // Convert :::info/:::note/:::tip/:::warning/:::danger admonitions to blockquotes
  md = md.replace(
    /^:::(info|note|tip|warning|danger)\s*\n([\s\S]*?)^:::\s*$/gm,
    (_, type, body) => {
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      const lines = body.trim().split("\n");
      return `> **${label}:** ${lines.join("\n> ")}`;
    }
  );

  // Collapse 3+ consecutive blank lines to 2
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim() + "\n";
}

function run() {
  const blogPosts = discoverBlogPosts();
  const allPages = [...PAGES, ...blogPosts];

  // --- Generate individual .md files ---
  const mdDir = path.join(PUBLIC_DIR, "docs-md");
  fs.rmSync(mdDir, { recursive: true, force: true });

  for (const page of allPages) {
    const srcPath = path.join(PAGES_DIR, page.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`  SKIP (missing): ${page.file}`);
      continue;
    }
    const raw = fs.readFileSync(srcPath, "utf8");
    const md = mdxToMarkdown(raw);

    const outFile = page.file.replace(/\.mdx$/, ".md");
    const outPath = path.join(mdDir, outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, md);
  }

  console.log(`Generated ${allPages.length} .md files in docs/public/docs-md/`);

  // --- Generate llms.txt (index) ---
  const indexLines = [
    "# Open Audio Protocol Documentation",
    "",
    `> Docs for the Open Audio Protocol. Source: ${SITE_URL}`,
    "",
    "## Docs",
    "",
  ];

  for (const page of PAGES) {
    const mdPath = `/docs-md/${page.file.replace(/\.mdx$/, ".md")}`;
    indexLines.push(`- [${page.title}](${SITE_URL}${page.path}): ${SITE_URL}${mdPath}`);
  }

  if (blogPosts.length) {
    indexLines.push("", "## Blog", "");
    for (const post of blogPosts) {
      const mdPath = `/docs-md/${post.file.replace(/\.mdx$/, ".md")}`;
      const desc = post.description ? ` — ${post.description}` : "";
      indexLines.push(
        `- ${post.date} [${post.title}](${SITE_URL}${post.path})${desc}: ${SITE_URL}${mdPath}`
      );
    }
  }

  indexLines.push("");
  fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), indexLines.join("\n"));
  console.log("Generated llms.txt");

  // --- Generate llms-full.txt (all content concatenated) ---
  const fullLines = [
    "# Open Audio Protocol — Complete Documentation",
    "",
    `> All documentation for the Open Audio Protocol in a single file.`,
    `> Source: ${SITE_URL}`,
    "",
  ];

  for (const page of allPages) {
    const srcPath = path.join(PAGES_DIR, page.file);
    if (!fs.existsSync(srcPath)) continue;
    const raw = fs.readFileSync(srcPath, "utf8");
    const md = mdxToMarkdown(raw);

    fullLines.push("---", "");
    fullLines.push(`> Source: ${SITE_URL}${page.path}`);
    fullLines.push("");
    fullLines.push(md);
    fullLines.push("");
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), fullLines.join("\n"));
  console.log("Generated llms-full.txt");
}

run();
