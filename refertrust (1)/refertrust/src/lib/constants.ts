// Free-tier ceilings we watch on /admin/status
export const LIMITS = {
  supabaseDbMB: 500, // Supabase free DB storage
  supabaseUsers: 50000, // Supabase free MAU
  vercelBandwidthGB: 100, // Vercel free bandwidth / month
  warnAtPercent: 90, // show warning banner at 90% of any limit
};

// Company-email-only auth: block common personal providers.
export const BLOCKED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "rediffmail.com",
  "aol.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
]);

// Known applicant-tracking / careers hosts. A JD link on one of these is
// treated as "real careers page" even if it doesn't match the company domain.
export const KNOWN_ATS_HOSTS = [
  "greenhouse.io",
  "lever.co",
  "workday.com",
  "myworkdayjobs.com",
  "smartrecruiters.com",
  "ashbyhq.com",
  "icims.com",
  "successfactors.com",
  "taleo.net",
  "naukri.com",
  "linkedin.com",
  "foundit.in",
  "instahyre.com",
  "hirist.tech",
  "wellfound.com",
];

export const BRAND = "#2563EB";
