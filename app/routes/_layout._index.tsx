import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix Start Repo!" },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto max-w-md px-4 ">
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="text-blue-500 text-3xl">Welcome to Remix</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    <p>
      This repo contains the following javascript libraries:
      <ul>
        <li>1. Styling using TailwindCSS and Daisy UI</li>
        <li>2. zod and zodic for schemas, types and validations</li>
        <li>3. Qdrant for vector databases</li>
        <li>4. Prisma for persistent storage</li>
        <li>5. Future Plans:</li>
        <li>5.1 Llama-index Llama-parse or some similar tools</li>
        <li>5.2 Open API libraries, and/or Ollama libraries to access both local and cloud LLMs</li>
        <li>5.3 ....</li>

      </ul>

    </p>
    </div>
    </div>
  );
}
