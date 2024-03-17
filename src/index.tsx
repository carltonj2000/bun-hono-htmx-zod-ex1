import { Hono } from "hono";
import { ZodIssue, z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const Layout = (props: any) => {
  return (
    <html>
      <head>
        <script src="https://unpkg.com/htmx.org@1.9.11"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <h1 class="bg-gray-300 py-2 text-center mb-3">Bun Hono HTMX Zod</h1>
        {props.children}
      </body>
    </html>
  );
};

app.get("/", (c) => {
  return c.html(
    <Layout>
      <div class={`max-w-xl mx-auto flex flex-col items-center`}>
        <a href="/form" class={`text-blue-400`}>
          Create Item
        </a>
      </div>
    </Layout>
  );
});

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name required!" }),
  email: z.string().email({ message: "Email required!" }),
});
type FormSchemaT = z.infer<typeof FormSchema>;

app.post(
  "/form",
  zValidator("form", FormSchema, (result, c) => {
    if (!result.success) {
      return c.html(<Form data={result.data} errors={result.error.errors} />);
    }
  }),
  async (c) => {
    const form = await c.req.formData();
    return c.html(<div>{JSON.stringify(form)}</div>);
  }
);

const getErrorMessage = (errors: ZodIssue[], label: string) => {
  const error = errors.find((e) => e.path[0] === label);
  return error?.message;
};

const Form = ({
  data,
  errors,
}: {
  data: FormSchemaT | null;
  errors: ZodIssue[];
}) => {
  return (
    <div class={`max-w-xl mx-auto flex flex-col items-center`}>
      <form class={`flex flex-col gap-1`} hx-post={`/form`}>
        <div>
          <div class={`text-red-500`}>{getErrorMessage(errors, "name")}</div>
          <label>Name:</label>
          <input name="name" class={`border`} value={data?.name} />
        </div>

        <div>
          <div class={`text-red-500`}>{getErrorMessage(errors, "email")}</div>
          <label>Email:</label>
          <input name="email" class={`border`} value={data?.email} />
        </div>
        <button type="submit" class={`border w-full rounded bg-gray-100`}>
          Save
        </button>
      </form>
    </div>
  );
};

app.get("/form", (c) => {
  return c.html(
    <Layout>
      <Form data={null} errors={[]} />
    </Layout>
  );
});
export default app;
