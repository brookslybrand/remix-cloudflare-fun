import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import * as schema from "~/.server/schema";

export async function loader({ context }: LoaderFunctionArgs) {
  const { MY_KV } = context.cloudflare.env;
  const { db } = context;

  const users = await db.query.users.findMany();

  const value = await MY_KV.get("my-key");
  return json({ value, users });
}

export async function action({ request, context }: LoaderFunctionArgs) {
  const { MY_KV } = context.cloudflare.env;
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (typeof intent !== "string") {
    throw new Error("Invalid intent");
  }
  if (intent === "kv") {
    const value = formData.get("value");
    if (typeof value !== "string") {
      throw new Error("Invalid value");
    }
    await MY_KV.put("my-key", value);
    return json({ value });
  } else if (intent === "add_user") {
    const { db } = context;
    const name = formData.get("name");
    const email = formData.get("email");
    if (typeof name !== "string" || typeof email !== "string") {
      throw new Error("Invalid name or email");
    }
    const user = await db.insert(schema.users).values({ email, name });
    return json({ user });
  }
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
  const { value, users } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix (with Vite and Cloudflare)</h1>
      <p>The value is {value ?? "not there :("}</p>

      <Form method="post">
        <input type="hidden" name="intent" value="kv" />
        <input type="text" name="value" />
        <button type="submit">Update the value</button>
      </Form>

      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
      <Form method="post">
        <input type="hidden" name="intent" value="add_user" />
        <input type="text" name="name" placeholder="Name" />
        <input type="email" name="email" placeholder="Email" />
        <button type="submit">Add User</button>
      </Form>
    </div>
  );
}
