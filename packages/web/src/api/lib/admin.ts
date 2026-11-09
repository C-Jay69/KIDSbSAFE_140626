/**
 * Accounts that always resolve to the Premium plan.
 *
 * This app has no local entitlement enforcement — plans live in Autumn and are
 * read by the client. The allowlist is therefore the single server-side source
 * of truth for "this account is staff/owner", so screens ask the API instead of
 * hard-coding an email into the client bundle.
 *
 * Override with a comma-separated ADMIN_EMAILS environment variable.
 */
const DEFAULT_ADMIN_EMAILS = ["admin@kidsbsafe.online"];

export function getAdminEmails(): string[] {
  // Annotated explicitly: this module is also type-checked from the mobile app's
  // program (it imports the API's `AppType`), where `process.env` resolves
  // without Node's typings and would otherwise be `any`.
  const configured: string | undefined = process.env.ADMIN_EMAILS;
  const list: string[] = configured ? configured.split(",") : DEFAULT_ADMIN_EMAILS;
  return list.map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
