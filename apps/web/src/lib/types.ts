export type AuthStatus = {
  connected: boolean;
  account_status: string;
  expires_at: string | null;
  has_refresh_token: boolean;
  last_connected_at: string | null;
};

export type SearchProfile = {
  id: string;
  name: string;
  is_active: boolean;
  filters: Record<string, unknown>;
  stoplist: Record<string, unknown>;
  updated_at: string;
};

export type VacancyMatchReason = {
  type: "positive" | "negative" | "info" | string;
  code: string;
  text: string;
};

export type VacancyListItem = {
  id: string;
  source: string;
  external_vacancy_id: string;
  title: string;
  employer_name: string | null;
  area_name: string | null;
  salary_from: number | null;
  salary_to: number | null;
  published_at: string | null;
  apply_via_hh: boolean;
  external_apply_url: string | null;
  score: number | null;
  is_blocked: boolean;
  blocked_reason: string | null;
  reasons: VacancyMatchReason[];
};

export type VacancyListOut = {
  items: VacancyListItem[];
  next_cursor: string | null;
};

export type CoverLetterGenerateOut = {
  cover_letter_id: string;
  letter_text: string;
  status: string;
  facts_used: string[];
  numbers_used: string[];
  risk_flags: string[];
  validation: Record<string, unknown>;
};

export type CoverLetterOut = {
  id: string;
  status: string;
  text: string;
  version: number;
  vacancy_id: string;
  resume_id: string;
  generated_at: string;
  facts_used: string[] | null;
  numbers_used: string[] | null;
  risk_flags: string[] | null;
  validation: Record<string, unknown> | null;
};

export type Application = {
  id: string;
  status: string;
  vacancy_id: string;
  resume_id: string;
  cover_letter_id: string | null;
  approved_at: string | null;
  queued_at: string | null;
  sent_at: string | null;
  failed_at: string | null;
  hh_negotiation_id: string | null;
  error_code: string | null;
  error_message: string | null;
  response_status: string | null;
  response_updated_at: string | null;
  last_synced_at: string | null;
  sync_error_code: string | null;
  last_attempt_at: string | null;
  attempt_count: number;
  created_at: string;
};

export type ApplicationListOut = {
  items: Application[];
  next_cursor: string | null;
};

export type ApplicationSendOut = {
  id: string;
  status: string;
  queued_at: string;
};

export type CandidateProfileLink = {
  type: string;
  url: string;
};

export type CandidateProfile = {
  id: string;
  full_name: string | null;
  desired_role: string | null;
  summary: string | null;
  skills_json: string[] | null;
  achievements_json: string[] | null;
  links_json: CandidateProfileLink[] | null;
  facts_numbers_json: string[] | null;
  updated_at: string;
};

export type SyncNegotiationsOut = {
  updated_count: number;
  errors_count: number;
  rate_limited: boolean;
  unauthorized: boolean;
  duration_ms: number;
};

export type HhResumeListItem = {
  id: string;
  title: string | null;
  updated_at: string | null;
};

export type HhResumeListOut = {
  items: HhResumeListItem[];
};

export type HhResumeCacheOut = {
  resume_id: string;
  title: string | null;
  cached_at: string;
};

export type HhResumeCachedOut = {
  resume_id: string;
  title: string | null;
  updated_at_from_hh: string | null;
  normalized_text: string | null;
  numbers_allowlist: string[];
  raw_json?: Record<string, unknown> | null;
};

export type DefaultResumeOut = {
  resume_id: string | null;
};

export type ResumeExperienceItem = {
  company: string | null;
  role: string | null;
  from: string | null;
  to: string | null;
  description: string | null;
};

export type ResumeParsed = {
  profession: string | null;
  skills: string[];
  experience: ResumeExperienceItem[];
  keywords: string[];
};

export type ResumeSourceOut = {
  id: string;
  source_type: "url" | "file" | string;
  source_url: string | null;
  file_name: string | null;
  file_mime: string | null;
  status: string;
  error_code: string | null;
  error_text: string | null;
  created_at: string;
  updated_at: string;
};

export type ResumeGetOut = {
  exists: boolean;
  updated_at: string | null;
  source: ResumeSourceOut | null;
  parsed: ResumeParsed | null;
  keywords: string[];
  numbers_allowlist: string[];
  raw_text?: string | null;
};

export type ResumeImportOut = {
  parsed: ResumeParsed;
  stats: { chars: number; words: number };
  warnings: string[];
  keywords: string[];
  numbers_allowlist: string[];
  raw_text_preview: string | null;
};

