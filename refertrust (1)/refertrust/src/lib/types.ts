export type Company = {
  id: string;
  name: string;
  domain: string; // e.g. "swiggy.com"
  logo_url: string | null;
  created_at: string;
};

export type Profile = {
  id: string; // = auth user id
  full_name: string | null;
  role: "employee" | "seeker";
  company_id: string | null; // employees belong to a company
  skills: string[]; // seeker skills
  years_experience: number | null;
  location: string | null;
  expected_salary_lpa: number | null; // Indian LPA format
  trust_score: number; // starts at 100
  created_at: string;
};

export type Referral = {
  id: string;
  poster_id: string;
  company_id: string;
  job_title: string;
  jd_url: string;
  slots: number;
  slots_filled: number;
  jd_verified: boolean; // heuristic check passed
  is_active: boolean;
  created_at: string;
};

// Referral joined with company (for the feed)
export type ReferralWithCompany = Referral & {
  companies: Pick<Company, "id" | "name" | "domain" | "logo_url"> | null;
  poster_trust?: number;
};

export type Application = {
  id: string;
  referral_id: string;
  seeker_id: string;
  status: "requested" | "matched" | "closed";
  created_at: string;
};

export type Message = {
  id: string;
  application_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

// ---- V2 tables (backend only in V1, no UI) ----
export type InterviewFeedback = {
  id: string;
  application_id: string;
  round: number;
  feedback: string;
  rating: number; // 1-5
  tips: string;
  created_at: string;
};

export type ReferralTracking = {
  id: string;
  referral_id: string;
  status: "pending" | "joined" | "bonus_due" | "paid";
  bonus_amount: number | null;
  paid_date: string | null;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_key: string;
  earned_at: string;
};
