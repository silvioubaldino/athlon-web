// ─── Vocabulary types ─────────────────────────────────────────────────────────

export interface FundingSource {
  id:         string
  name:       string
  type:       'municipal' | 'state' | 'federal' | 'sponsorship'
  created_at: string
  updated_at: string
}

export interface Project {
  id:                string
  name:              string
  description?:      string
  funding_source_id: string
  active:            boolean
  created_at:        string
  updated_at:        string
}

export interface Sport {
  id:         string
  name:       string
  created_at: string
}

export interface Athlete {
  id:               string
  name:             string
  primary_sport_id?: string
  active:           boolean
  created_at:       string
  updated_at:       string
}

export interface Event {
  id:          string
  name:        string
  description?: string
  start_date?:  string
  end_date?:    string
  created_at:  string
  updated_at:  string
}

// ─── Media types ──────────────────────────────────────────────────────────────

export interface MediaListItem {
  id:          string
  drive_url:   string
  title?:      string
  caption?:    string
  media_date?: string
  author?:     string
  classified:  boolean
  projects:    Project[]
  sports:      Sport[]
  created_at:  string
  updated_at:  string
}

export interface Media extends MediaListItem {
  athletes:        Athlete[]
  events:          Event[]
  funding_sources: FundingSource[]
  created_by:      string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items:     T[]
  total:     number
  page:      number
  page_size: number
  pages:     number
}

// ─── Request types ────────────────────────────────────────────────────────────

export interface CreateMediaRequest {
  drive_url:   string
  title?:      string
  caption?:    string
  media_date?: string
  author?:     string
}

export interface UpdateMediaRequest {
  title?:       string
  caption?:     string
  media_date?:  string
  author?:      string
  project_ids?: string[]
  sport_ids?:   string[]
  athlete_ids?: string[]
  event_ids?:   string[]
}

export interface CreateProjectRequest {
  name:              string
  description?:      string
  funding_source_id: string
  sport_ids?:        string[]
}

export interface UpdateProjectRequest {
  name?:             string
  description?:      string
  funding_source_id?: string
  active?:           boolean
  sport_ids?:        string[]
}

export interface CreateFundingSourceRequest {
  name: string
  type: FundingSource['type']
}

export interface UpdateFundingSourceRequest {
  name?: string
  type?: FundingSource['type']
}

export interface CreateSportRequest   { name: string }
export interface UpdateSportRequest   { name?: string }

export interface CreateAthleteRequest {
  name:              string
  primary_sport_id?: string
}
export interface UpdateAthleteRequest {
  name?:             string
  primary_sport_id?: string
  active?:           boolean
}

export interface CreateEventRequest {
  name:         string
  description?: string
  start_date?:  string
  end_date?:    string
}
export interface UpdateEventRequest {
  name?:         string
  description?:  string
  start_date?:   string
  end_date?:     string
}

// ─── API error detail ─────────────────────────────────────────────────────────

export interface ApiErrorDetail {
  existing_id?: string
}

// ─── Media list filter params ─────────────────────────────────────────────────

export interface MediaListParams {
  q?:                  string
  funding_source_ids?: string[]
  project_ids?:        string[]
  sport_ids?:          string[]
  athlete_ids?:        string[]
  event_ids?:          string[]
  date_from?:          string
  date_to?:            string
  page?:               number
  page_size?:          number
  order_by?:           'media_date_desc' | 'media_date_asc' | 'created_at_desc'
  classified?:         boolean
}
