import type { MetaFunction,LoaderFunctionArgs } from "@remix-run/node";
import { requireUserId } from '~/modules/session/session.server';

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Starter repo" },
    { name: "description", content: "Welcome to Remix Starter Repo!" },
  ];
};

export async function loader(args:LoaderFunctionArgs) {
 return {} 
}

export default function Index() {
  return (
    <div className="container mx-auto max-w-lg px-4 ">
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="text-blue-500 text-3xl">Welcome to Remix</h1>
     
    <p>
      <br/>
      <div className="text-xl font-semibold">This repo contains the following javascript libraries:</div>
      <ul className="p-4">
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
