import { KNOWN_ATS_HOSTS } from "./constants";

// "Is this JD link a real company careers page?" — done with free heuristics,
// NOT a paid AI call (zero-budget V1). Two ways to pass:
//   1. The link's host matches the poster's company domain (careers.swiggy.com
//      for a swiggy.com employee), OR
//   2. The host is a known ATS / job portal (greenhouse, lever, naukri, etc.).
//
// NOTE: To upgrade to a real AI check later, swap `verifyJdUrl` for an API route
// that fetches the page and asks a model to confirm the company + role. The
// return shape stays the same, so no caller changes.

export type JdCheck = {
  ok: boolean; // well-formed https URL
  verified: boolean; // matches company domain or known ATS
  reason: string;
  host: string | null;
};

export function verifyJdUrl(rawUrl: string, companyDomain?: string): JdCheck {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false, verified: false, reason: "That is not a valid link.", host: null };
  }

  if (url.protocol !== "https:") {
    return { ok: false, verified: false, reason: "Use an https link.", host: url.host };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  // Match against the employee's own company domain (incl. subdomains).
  if (companyDomain) {
    const domain = companyDomain.toLowerCase().replace(/^www\./, "");
    if (host === domain || host.endsWith("." + domain)) {
      return { ok: true, verified: true, reason: "Matches your company domain.", host };
    }
  }

  // Match against known ATS / job portals.
  const onAts = KNOWN_ATS_HOSTS.some(
    (ats) => host === ats || host.endsWith("." + ats)
  );
  if (onAts) {
    return { ok: true, verified: true, reason: "Recognised job portal.", host };
  }

  // Valid link but we can't confirm it's a careers page. Allow, but unverified.
  return {
    ok: true,
    verified: false,
    reason: "Link looks fine but we couldn't confirm it's an official careers page.",
    host,
  };
}
