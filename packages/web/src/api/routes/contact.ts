import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import nodemailer, { type Transporter } from "nodemailer";
import { clientIp, type AppVariables } from "../middleware/auth";
import { rateLimit } from "../lib/rate-limit";

/**
 * Contact-form relay.
 *
 * The landing page used to fall back to a `mailto:` link, which depends on the
 * visitor having a mail client and exposes the inbox address to scrapers. This
 * route accepts the message and relays it over SMTP, so the public page only
 * needs an API call.
 *
 * Configuration (all server-side, none of it reaches the browser):
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE, SMTP_USER, SMTP_PASS,
 *   CONTACT_TO (default support@hydraforge.tech), CONTACT_FROM (default SMTP_USER)
 *
 * With no SMTP credentials the route answers 503 + `fallback: "mailto"` so the
 * page can still offer the mail-client link instead of failing silently.
 */

const DEFAULT_CONTACT_TO = "support@hydraforge.tech";
const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
  from: string;
}

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  // `pass` is checked for truthiness rather than trimmed: some providers issue
  // app passwords with meaningful whitespace in odd places, and trimming here
  // would silently break authentication.
  if (!host || !user || !pass) return null;

  const rawPort = process.env.SMTP_PORT?.trim();
  const port = rawPort ? Number(rawPort) : 587;
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return null;

  const secureFlag = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureFlag ? secureFlag === "true" || secureFlag === "1" : port === 465;

  return {
    host,
    port,
    secure,
    user,
    pass,
    to: (process.env.CONTACT_TO?.trim() || DEFAULT_CONTACT_TO).toLowerCase(),
    from: process.env.CONTACT_FROM?.trim() || user,
  };
}

let transporter: Transporter | null = null;
let transporterKey = "";

function getTransporter(config: SmtpConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}`;
  if (transporter && transporterKey === key) return transporter;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // A stalled SMTP server must not hold the request open indefinitely.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  transporterKey = key;
  return transporter;
}

/** Header values must not contain CR/LF, or they inject extra headers. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

interface ContactInput {
  name: string;
  email: string;
  topic: string;
  message: string;
}

function validate(body: Record<string, unknown>):
  | { ok: true; value: ContactInput }
  | { ok: false; error: string } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "Please enter your name (2–100 characters)." };
  }
  if (email.length > 200 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (topic.length > 100) {
    return { ok: false, error: "Please choose a shorter topic." };
  }
  if (message.length < 10) {
    return { ok: false, error: "Please write at least 10 characters so we can help." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Please keep your message under 5000 characters." };
  }

  return { ok: true, value: { name, email, topic, message } };
}

function mailtoFallback() {
  return {
    ok: false as const,
    error: "The contact form is not configured yet. Please email us directly.",
    fallback: "mailto" as const,
  };
}

const app = new Hono<{ Variables: AppVariables }>()
  .post(
    "/",
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) => c.json({ ok: false, error: "Message is too large." }, 413),
    }),
    async (c) => {
      const ip = clientIp(c);
      if (!rateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
        return c.json(
          { ok: false, error: "Too many messages from this address. Please try again later." },
          429,
        );
      }

      let body: Record<string, unknown>;
      try {
        body = (await c.req.json()) as Record<string, unknown>;
      } catch {
        return c.json({ ok: false, error: "Invalid request body." }, 400);
      }

      // Honeypot: real visitors never see this field, so a value means a bot.
      // Answer 200 so the bot does not learn it was filtered.
      if (typeof body.website === "string" && body.website.trim() !== "") {
        return c.json({ ok: true }, 200);
      }

      const parsed = validate(body);
      if (!parsed.ok) {
        return c.json({ ok: false, error: parsed.error }, 400);
      }

      const config = readSmtpConfig();
      if (!config) {
        console.warn("[contact] SMTP is not configured; returning mailto fallback");
        return c.json(mailtoFallback(), 503);
      }

      const { name, email, topic, message } = parsed.value;
      const subject = oneLine(
        `[KIDSbSAFE] ${topic ? `${topic} — ` : ""}message from ${name}`,
      );

      const text = [
        `New contact-form message from the KIDSbSAFE website`,
        ``,
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Topic:   ${topic || "(not specified)"}`,
        `IP:      ${ip}`,
        `Time:    ${new Date().toISOString()}`,
        ``,
        `Message:`,
        message,
      ].join("\n");

      try {
        await getTransporter(config).sendMail({
          from: config.from,
          to: config.to,
          replyTo: `${oneLine(name)} <${oneLine(email)}>`,
          subject,
          text,
        });
      } catch (err) {
        console.error("[contact] send failed:", err);
        return c.json(
          {
            ok: false,
            error: "We could not send your message right now. Please email us directly.",
            fallback: "mailto" as const,
          },
          502,
        );
      }

      return c.json({ ok: true }, 200);
    },
  );

export default app;
