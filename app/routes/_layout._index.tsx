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
     
    <p>
      This repo contains the following javascript libraries:
      <ul>
        <li>1. Styling using TailwindCSS and Daisy UI</li>
        <li>2. zod and zodic for schemas, types and validations</li>
        <li>3. Qdrant for vector databases</li>
      </ul>

    </p>
    </div>
    <ul>
        
        <li>
          <a
            target="_blank"
            href="/sample_route"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            sample_route
          </a>
        </li>
        
      </ul>
    </div>
  );
}
