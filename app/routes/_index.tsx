import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

export async function loader({ context }: LoaderFunctionArgs) {
  const { MY_KV } = context.cloudflare.env;
  const value = await MY_KV.get("my-key");
  return json({ value });
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const { MY_KV } = context.cloudflare.env;
  const formData = await request.formData();
  const value = formData.get("value");
  if (typeof value !== "string") {
    throw new Error("Invalid value");
  }
  await MY_KV.put("my-key", value);
  return json({ value });
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export default function Index() {
  const { value } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix (with Vite and Cloudflare)</h1>
      <p>The value is {value ?? "not there :("}</p>

      <Form method="post">
        <input type="text" name="value" />
        <button type="submit">Update the value</button>
      </Form>
    </div>
  );
}
