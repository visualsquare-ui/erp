import { NextResponse } from "next/server";

export const runtime = "nodejs";

const messages = {
  success: {
    title: "Payment received",
    body: "Thank you. Your invoice payment has been submitted successfully.",
  },
  cancelled: {
    title: "Payment cancelled",
    body: "No payment was processed. You can close this page or use the invoice link again.",
  },
  already_paid: {
    title: "Invoice already paid",
    body: "This invoice is already marked as paid.",
  },
};

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const message =
    status === "cancelled" || status === "already_paid"
      ? messages[status]
      : messages.success;

  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${message.title} | Visual Square</title>
    <style>
      body {
        margin: 0;
        background: #fbf6f3;
        color: #141414;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 24px;
      }
      section {
        max-width: 520px;
        border: 1px solid #e7e2dd;
        background: #fff;
        padding: 32px;
      }
      .brand {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 32px;
        line-height: 0.9;
      }
      .brand span {
        color: #f57d4b;
      }
      h1 {
        margin: 28px 0 10px;
        font-size: 28px;
        line-height: 1.2;
      }
      p {
        margin: 0;
        color: #6f6660;
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <div class="brand">visual<br /><span>square</span></div>
        <h1>${message.title}</h1>
        <p>${message.body}</p>
      </section>
    </main>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}
