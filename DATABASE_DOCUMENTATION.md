# Unimakler CRM — Database Documentation

> A complete, beginner-friendly guide to the MySQL database that powers the Unimakler CRM (`unimakler_api.sql`).
> Database name in the dump: **`unimakler_api`** (also referred to as `u486671863_unimakler_api` in some deployment configs).
> Total tables documented: **102**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What is a Database?](#2-what-is-a-database)
3. [Database Architecture](#3-database-architecture)
4. [Table Documentation](#4-table-documentation)
5. [Primary Keys](#5-primary-keys)
6. [Foreign Keys](#6-foreign-keys)
7. [Table Relationships](#7-table-relationships)
8. [CRUD Operations](#8-crud-operations)
9. [Sample Data](#9-sample-data)
10. [Business Logic](#10-business-logic)
11. [Database Flow](#11-database-flow)
12. [Data Types](#12-data-types)
13. [SQL Concepts](#13-sql-concepts)
14. [Joins](#14-joins)
15. [Normalization](#15-normalization)
16. [Performance](#16-performance)
17. [Security](#17-security)
18. [Common Queries](#18-common-queries)
19. [API Mapping](#19-api-mapping)
20. [Best Practices](#20-best-practices)
21. [Interview Questions](#21-interview-questions)
22. [Summary](#22-summary)

---

## 1. Project Overview

**Unimakler** is a real-estate / real-estate-franchise CRM (Customer Relationship Management) system. It is built with **CodeIgniter 3** using an **HMVC** (Hierarchical Model-View-Controller) structure — the application code lives in `application/modules/`, with modules named `leads`, `deal`, `home`, `leadflow`, `franchaiseleads`, `login`, and `welcome`.

Judging from the table names and columns in the database, the system is used to:

- **Advertise and manage real-estate projects/listings** — tables like `project_listings`, `project_listing_units`, `project_listing_gallery`, `builders`, `master_project_name` store details about buildings, builders, floor plans, pricing, and amenities.
- **Capture and manage sales leads** — `project_leads`, `tbl_cp_leads` and their status-history tables (`tbl_lead_status_history`, `tbl_cp_leads_status_history`) track a customer's journey from "interested" to "converted" or "dropped out."
- **Run a franchise network** — `franchise`, `master_franchise_type`, `master_franchise_tier`, `master_franchise_class` suggest the business operates through franchisees (local partners who sell/market projects in their territory), each with their own leads (`franchaiseleads` module).
- **Manage internal staff / sales hierarchy** — `tbl_city_office`, `tbl_city_office_sales_executive`, `tbl_team_leaders`, `users`, `master_role` model a sales organization: city offices → team leaders → sales executives, each with role-based permissions (`master_permissions`, `role_permissions_mapping`).
- **Handle channel partners** — `tbl_channel_partner`, `tbl_cp_leads*` represent external partner agents who also bring in leads.
- **Serve a public-facing website** — `cms_pages`, `website_banners`, `careers`, `job_applications`, `master_blogs`, `form_responses`, `user_enquiries`, `user_feedback(s)` look like content and contact-form tables for a marketing website that funnels visitors into leads.
- **Support authentication/API access** — the `oauth_*` and `personal_access_tokens` tables are the standard Laravel Passport table set, meaning some part of this system (probably a separate API layer sitting beside the CodeIgniter app) issues OAuth2 tokens for API clients.

In short: **Unimakler is a lead-to-deal pipeline CRM for the real-estate industry**, wrapped around a public marketing website and a franchise/sales-office management layer.

---

## 2. What is a Database?

If you have never used a database before, think of this section as your foundation. Every concept below is explained with a plain, real-life analogy first, then tied back to this project's schema.

### Database
A **database** is an organized collection of information stored on a computer so it can be easily accessed, managed, and updated.
*Real-life analogy:* a filing cabinet in an office. The whole cabinet is the "database" — it holds many folders (tables) of related paperwork.

### MySQL
**MySQL** is a piece of software (a "Database Management System" or **DBMS**) that stores, organizes, and lets you query databases using a language called **SQL** (Structured Query Language).
*Why MySQL for this project?* It's free, open-source, extremely well supported by PHP/CodeIgniter (this app's framework), fast for read-heavy web apps, and it's the de-facto standard for LAMP-stack (Linux, Apache, MySQL, PHP) applications like this CRM.

### Database vs Table vs Row vs Column vs Record vs Field
*Real-life analogy:* Imagine a filing cabinet (**database**) with a folder labeled "Leads" (**table**). Inside that folder are index cards, one per lead (each card = a **row**, also called a **record**). Each card has labeled boxes like "Name," "Phone," "Email" (each box = a **column**, and one filled-in box on one card = a **field**).

| Term | Meaning | Example in this DB |
|---|---|---|
| Database | The whole collection | `unimakler_api` |
| Table | A named collection of similar records | `project_leads` |
| Row / Record | One entry in a table | one specific lead, e.g. id=101 |
| Column / Field | One property of every record | `customer_name`, `mobile_number` |

### Primary Key (PK)
A column (or set of columns) that **uniquely identifies each row** in a table — no two rows can share the same value, and it cannot be NULL.
*Real-life analogy:* your Aadhar/passport number — no two people share one, and everyone must have one.
*Example:* `project_leads.id` uniquely identifies every lead.

### Foreign Key (FK)
A column in one table that refers to the Primary Key of another table, creating a link between the two.
*Real-life analogy:* a delivery form that has a "Customer ID" field referencing a customer file kept in another cabinet, instead of re-writing the customer's whole address every time.
*Example:* `project_leads.project_id` refers to a project defined in `master_project_name`/`project_listings`.

### Index
A lookup structure (similar to a book's index page) that lets the database find rows fast without scanning the entire table.
*Real-life analogy:* the index at the back of a textbook — instead of reading every page to find "Photosynthesis," you jump straight to page 214.
*Example:* the `PRIMARY KEY` on `users.id` is automatically indexed, making `WHERE id = 5` instant even with millions of rows.

### Constraints
Rules the database enforces automatically to protect data quality, e.g. `NOT NULL`, `UNIQUE`, `DEFAULT`, `PRIMARY KEY`.
*Real-life analogy:* a form that refuses submission if you leave the "Phone Number" field blank.

### NULL vs NOT NULL
`NULL` means "no value / unknown," different from an empty string or zero. `NOT NULL` forces a column to always have a value.
*Real-life analogy:* on a form, an unanswered question ("NULL") is different from writing "N/A" or "0" — it means the question was simply never answered.
*Example:* `project_leads.email_id` is `DEFAULT NULL` (optional), while `project_leads.customer_name` is `NOT NULL` (mandatory — every lead must have a name).

### AUTO_INCREMENT
A property that makes MySQL automatically generate the next whole number for a column (usually the primary key) every time a new row is inserted, so you never have to pick IDs by hand.
*Real-life analogy:* a "take a number" ticket dispenser at a bank — every new customer automatically gets the next number.
*Example:* the dump shows every `id` column receiving `AUTO_INCREMENT` in the `ALTER TABLE ... MODIFY` statements (e.g. `users.id`, `project_leads.id`).

### UNIQUE
A constraint ensuring no two rows can have the same value in that column (unlike PK, a table can have several UNIQUE columns, and NULLs are allowed).
*Real-life analogy:* two students in a class can't have the same roll number, but two students *could* both have no email listed.
*Example:* `failed_jobs.uuid` has a `UNIQUE KEY failed_jobs_uuid_unique`.

### DEFAULT values
A fallback value MySQL inserts automatically if you don't supply one.
*Real-life analogy:* a form that pre-fills "India" in the Country field so most users don't have to type it.
*Example:* nearly every status-style column in this schema defaults to `'I'` (Inactive) or `'A'` (Active), e.g. `master_amenities.amenities_status ENUM('A','I') DEFAULT 'I'`.

---

## 3. Database Architecture

- **Database name:** `unimakler_api`
- **Total tables:** 102
- **Engine:** InnoDB (supports transactions & row-level locking) for almost every table; a handful of newer tables (`allocate_amenities`, `master_allocate_features`, `project_google_map_attributes`) are missing an explicit `ENGINE=` clause and fall back to the server default (typically InnoDB).
- **Character sets:** a mix of `latin1` (older/legacy tables — most of the `master_*`, `project_listing_*`, `tbl_*` tables) and `utf8mb4` (newer tables — OAuth/Passport tables, `master_blogs`, `our_offices`, `user_responses`, etc.). This split strongly suggests the schema evolved over time and different features were added in different eras.
- **No enforced foreign keys:** the dump contains **zero** `FOREIGN KEY` / `REFERENCES` constraints. All relationships between tables are *implied* purely by naming convention (`xxx_id` columns) and are enforced only in application code (CodeIgniter models), not by the database engine. This is flagged throughout this document.

### Logical grouping of tables

<pre style="background-color:#ffffff;color:#000000;padding:12px;border:1px solid #ccc;">
┌───────────────────────────────────────────────────────────────────────────┐
│                         MASTER / LOOKUP DATA                              │
│  master_country, master_states, master_cities, master_locality            │
│  master_project_type, master_project_sub_type, master_property_type,      │
│  master_property_sub_type, master_bhk_sizes, master_amenities(+header),   │
│  master_special_features(+header), master_specifications(+header),        │
│  master_banks, master_banner_types, master_farm_house_types,              │
│  master_villa_types, master_possession_status, master_community_types,    │
│  master_saleable_area_representation, master_property_facing,             │
│  master_property_sizes, master_property_uds_sizes, master_listing_type,   │
│  master_gallery_headers, master_registration_gst_prices,                  │
│  master_franchise_tier, master_franchise_type, master_franchise_class,    │
│  master_dropout_reasons, master_source, master_source_type,               │
│  master_status_code, master_statustype, master_sub_module,                │
│  master_modules, master_role, master_permissions, master_user_type,       │
│  master_approval_authority, master_approval_status,                      │
│  master_response_message                                                  │
└───────────────────────────────────────────────────────────────────────────┘
                │  referenced by (via *_id naming convention)
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    PROJECTS / LISTINGS (property catalogue)               │
│  builders, builder_locations, master_project_name, project_listings       │
│    ├─ project_listing_units (unit/floor pricing & size)                   │
│    ├─ project_listing_gallery / project_listing_video_links               │
│    ├─ project_listing_amenities_mapping                                   │
│    ├─ project_listing_special_features_mapping                            │
│    ├─ project_listing_specifications_mapping                              │
│    ├─ project_listing_banks_mapping                                       │
│    ├─ project_listing_approval_status_history                             │
│    ├─ project_listings_furnished_mapping                                  │
│    ├─ project_google_map_attributes (nearby POIs)                        │
│    └─ allocate_amenities / master_allocate_features                       │
└───────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          LEADS / SALES PIPELINE                           │
│  project_leads ── tbl_lead_status_history ── tbl_lead_status_history_     │
│                                               dropout_reasons              │
│  tbl_cp_leads (channel-partner leads) ── tbl_cp_leads_status_history ──   │
│                                           tbl_cp_lead_history_dropout_    │
│                                           reasons                         │
│  tbl_module_statustype_mapping (allowed status transitions per module)    │
│  project_leadseee (looks like a duplicate/experimental leads table)       │
│  user_responses (franchise lead responses/visit scheduling)               │
└───────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      FRANCHISE / SALES ORGANIZATION                       │
│  franchise ── master_franchise_type / _tier / _class                      │
│  tbl_city_office ── tbl_city_office_sales_executive ── tbl_team_leaders   │
│  tbl_channel_partner                                                      │
│  tbl_users_projects_mapping / tbl_user_location_mapping                   │
│  role_permissions_mapping (master_role ↔ master_permissions)              │
└───────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      USERS / AUTH / API ACCESS                            │
│  users, registration, user_otps, password_reset_tokens                    │
│  oauth_clients, oauth_access_tokens, oauth_auth_codes,                    │
│  oauth_refresh_tokens, oauth_personal_access_clients,                     │
│  personal_access_tokens (Laravel Passport / Sanctum style API auth)       │
└───────────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE / MARKETING / MISC                      │
│  cms_pages, website_banners, master_blogs, careers, job_applications,     │
│  form_responses, user_enquiries, user_feedback, user_feedbacks,           │
│  our_offices, package_listings, purchased_packages, deleted_logs,         │
│  failed_jobs, migrations                                                  │
└───────────────────────────────────────────────────────────────────────────┘
</pre>

### General data flow

1. A visitor browses the public website (backed by `project_listings`, `cms_pages`, `website_banners`, `master_blogs`).
2. They submit an enquiry/contact form → a row lands in `project_leads` (or `form_responses` / `user_enquiries` for generic contact forms), tagged with a `source_id` (which marketing channel) and `project_id`.
3. A sales executive (`tbl_city_office_sales_executive`) or franchise (`franchise`) is assigned the lead, and every status change (contacted, follow-up scheduled, dropped out, converted) is written to `tbl_lead_status_history`.
4. If the lead progresses, it becomes a **deal** (handled by the `deal` module — no dedicated "deals" table was found in the dump; deal-closing appears to be tracked via lead status changes, e.g. a "closed/won" status inside `master_statustype`).
5. Channel-partner-sourced leads follow the same pattern through `tbl_cp_leads` / `tbl_cp_leads_status_history`.
6. Master/lookup tables (`master_*`) supply dropdown values (cities, property types, amenities, statuses, reasons) used throughout the above flow.

---

## 4. Table Documentation

> Note: none of the tables in this dump have database-enforced foreign keys, so "Nullable" below reflects the `NOT NULL`/`DEFAULT NULL` clause in the `CREATE TABLE` statement, and validation rules are inferred purely from column type/length/`ENUM`. Audit columns (`created_by`, `created_date/at`, `updated_by`, `updated_date/at`, `created_ip`, `updated_ip`) repeat across most tables and are described once per table but not over-explained.

Many `master_*` tables share an identical "lookup" pattern: `id`, `name`, `description`, a `..._status ENUM('A','I')` flag, and audit columns. Where a table follows this pattern exactly, its write-up is kept short and simply names what the row represents.

### `allocate_amenities`
**Purpose:** Stores a saved set of amenities selected for a given property type / sub-project type combination (looks like a "template" a user builds once and applies later), created via the newer utf8mb4 admin flow.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| allocationType | varchar(255) | NULL | NULL | Type/category of the allocation | "Residential" |
| property_type_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `master_property_type.id` | 3 |
| sub_project_type_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `master_project_sub_type.id` | 5 |
| selected_amenities | longtext | NOT NULL | — | JSON/CSV list of chosen amenity IDs | `[1,2,7]` |
| created_by | bigint UNSIGNED | NULL | NULL | User who created the row | 12 |
| created_role | varchar(255) | NULL | NULL | Role of creator | "Admin" |
| created_at / updated_at | timestamp | NULL | NULL | Audit timestamps | 2024-05-01 10:00:00 |

### `builders`
**Purpose:** Master list of real-estate builders/developers whose projects are listed on the platform.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint | NOT NULL | — | Primary key | 1 |
| name | varchar(255) | NULL | NULL | Builder/company name | "ABC Developers" |
| headoffice_location | varchar(255) | NULL | NULL | HQ address | "Hyderabad" |
| company_email / company_contact | varchar(255) | NULL | NULL | Contact info | "info@abc.com" |
| cp_company_pan / cp_gst_number | varchar(255) | NULL | NULL | Tax IDs | "ABCPD1234E" |
| location_one/two/three (+ mobile/email) | varchar(255) | NULL | NULL | Up to 3 branch offices | "Bangalore" |
| md_name / md_phone_number / md_email | varchar | NULL | NULL | Managing Director contact | "John Doe" |
| cp_manager_*, sales_manager_* | varchar | NULL | NULL | Channel-partner & sales manager contacts | "Jane" |
| slug | text | NULL | NULL | URL-friendly identifier | "abc-developers" |
| order | int | NULL | NULL | Display sort order | 1 |
| logo_path | text | NULL | NULL | Path to logo image | "/uploads/logo.png" |
| builder_status | enum('A','I') | NULL | 'I' | Active/Inactive flag | "A" |
| register_status | varchar(255) | NULL | NULL | Registration state | "Approved" |
| created_by / updated_by | bigint | NULL | NULL | Audit user IDs | 5 |
| created_date / updated_date | datetime | NULL | NULL | Audit timestamps | 2024-01-01 |
| created_ip / updated_ip | varchar(20) | NULL | NULL | IP address of actor | "10.0.0.1" |

### `builder_locations`
**Purpose:** One-to-many child table of `builders` — additional office locations per builder beyond the 3 built into `builders`.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint | NOT NULL | — | Primary key | 1 |
| builder_id | bigint | NULL | NULL | FK-by-convention → `builders.id` | 1 |
| state / city / address | varchar/text | NULL | NULL | Location details | "Telangana" |
| contact_person_name / contact_person_phone_number | varchar | NULL | NULL | Local contact | "Ravi" |
| builder_location_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by / updated_by | bigint | NULL | NULL | Audit | 3 |
| created_date / updated_date | text | NULL | NULL | Audit (stored as text, not datetime — inconsistent typing) | "2024-01-01" |
| created_ip / updated_ip | varchar(20) | NULL | NULL | IP | "10.0.0.1" |

### `careers`
**Purpose:** Job openings posted on the public "Careers" page of the website.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int UNSIGNED | NOT NULL | — | Primary key | 1 |
| country_code / state_code / city_code | varchar(10) | NOT NULL | — | Location codes for the job | "IN" |
| work_type | varchar(255) | NOT NULL | — | e.g. Full-time/Remote | "Full-time" |
| job_title | varchar(255) | NOT NULL | — | Position title | "Sales Executive" |
| position | int | NOT NULL | — | Number of openings or sort order | 2 |
| experience | varchar(255) | NOT NULL | — | Required experience | "2-4 years" |
| skills / description / candidate_profile | text | NOT NULL | — | Job detail text | "Communication skills" |
| career_status | text | NOT NULL | — | Open/closed status | "Open" |
| created_at / updated_at | timestamp | NULL | NULL | Audit | 2024-01-01 |

### `cms_pages`
**Purpose:** Editable content pages for the marketing website (About Us, Terms, etc.) — a simple CMS.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| name | varchar(255) | NULL | NULL | Internal page name | "About Us" |
| description / content | longtext | NULL | NULL | Page body (HTML) | "<p>...</p>" |
| permalink | varchar(255) | NULL | NULL | URL slug | "about-us" |
| meta_title / meta_keywords / meta_description / meta_image | varchar/text | NULL | NULL | SEO metadata | "Learn about us" |
| page_status | enum('A','I') | NULL | 'I' | Published/unpublished | "A" |
| position | int | NULL | NULL | Menu sort order | 1 |
| created_by / updated_by | int | NULL | NULL | Audit | 2 |
| created_date / updated_date | datetime | NULL | NULL | Audit | 2024-01-01 |
| created_ip / updated_ip | varchar(20) | NULL | NULL | IP | "10.0.0.1" |

### `deleted_logs`
**Purpose:** A generic audit/soft-delete archive — when a row is deleted from *any* table, a JSON snapshot is kept here for recovery/auditing.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| table_name | varchar(255) | NOT NULL | — | Which table the row came from | "project_leads" |
| record_id | bigint UNSIGNED | NOT NULL | — | Original row's ID | 55 |
| data | json | NOT NULL | — | Full row snapshot as JSON | `{"id":55,...}` |
| deleted_by | bigint UNSIGNED | NULL | NULL | User who deleted it | 4 |
| deleted_at | timestamp | NOT NULL | CURRENT_TIMESTAMP | When it was deleted | 2024-06-01 09:00:00 |
| created_at / updated_at | timestamp | NULL | NULL | Row audit (of the log entry itself) | 2024-06-01 |

### `failed_jobs`
**Purpose:** Standard Laravel queue table — records background jobs that threw an exception. Confirms a Laravel-based API/queue component exists alongside the CodeIgniter app.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| uuid | varchar(255) | NOT NULL | — | Unique job identifier (`UNIQUE KEY`) | "9f8b..." |
| connection / queue | text | NOT NULL | — | Queue driver/name | "database" |
| payload | longtext | NOT NULL | — | Serialized job data | "{...}" |
| exception | longtext | NOT NULL | — | Stack trace of the failure | "Exception: ..." |
| failed_at | timestamp | NOT NULL | CURRENT_TIMESTAMP | When the job failed | 2024-06-01 |

### `form_responses`
**Purpose:** Generic capture table for miscellaneous website forms (not tied to a specific project) — e.g. "Contact Us" / general enquiry widgets.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| form_type | text | NOT NULL | — | Which form was submitted | "contact" |
| name / email / mobile | text/varchar | NULL | NULL | Submitter details | "Ravi Kumar" |
| country / city / preferred_location / state | varchar(100) | NULL | NULL | Location info | "India" |
| message / subject | text/varchar | NULL | NULL | Message content | "Interested in 2BHK" |
| created_at | datetime | NULL | NULL | Submission time | 2024-06-01 |
| created_ip | varchar(100) | NULL | NULL | Submitter IP | "10.0.0.1" |
| status | varchar(100) | NULL | NULL | Processing status | "New" |
| updated_at / updated_ip | varchar(100) | NULL | NULL | Audit (stored as text, inconsistent typing) | "2024-06-02" |
| currency / countryCode / budget | varchar(100) | NULL | NULL | Extra enquiry context | "INR" |

### `franchise`
**Purpose:** Master record for each franchise partner (a person/company licensed to sell projects in a territory). Large table covering identity, KYC, banking, and login credentials.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| franchise_id | int | NOT NULL | — | Primary key | 1 |
| master_franchise_id | int | NULL | NULL | Parent/master franchise (self-referencing hierarchy) | 0 |
| super_franchise_id | varchar(255) | NULL | NULL | Higher-level franchise reference | "1" |
| franchise_name / franchise_brand_name | varchar(255) | NULL | NULL | Legal / brand name | "Unimakler Hyderabad" |
| franchise_tier | varchar(255) | NOT NULL | '2' | FK-by-convention → `master_franchise_tier` | "2" |
| franchise_type | int | NULL | NULL | FK-by-convention → `master_franchise_type.id` | 1 |
| franchise_class | int | NULL | NULL | FK-by-convention → `master_franchise_class.id` | 1 |
| franchise_territory | varchar(255) | NULL | NULL | Operating area | "Hyderabad West" |
| franchise_description | longtext | NULL | NULL | Free text | "Leading local partner" |
| franchise_primary_email / secondary_email | varchar(100) | NULL | NULL | Contact emails | "x@y.com" |
| franchise_primary_phoneno / secondary_phoneno | varchar | NULL | NULL | Contact phones | "9876543210" |
| franchise_country/state/city/location/address | varchar/text | NULL | NULL | Location | "Telangana" |
| franchise_pan_card / franchise_gst_number | varchar(100) | NULL | NULL | Tax IDs | "ABCPD1234E" |
| contact_person, contact_gender, contact_dob, contact_primary_phone, contact_secondary_phone, contact_photo, contact_residential_address | mixed | NULL | NULL | Primary contact person's details | "Ravi Kumar" |
| username / password | varchar(255) | NULL | NULL | Franchise portal login credentials (plaintext column name — should store hashed password) | "franchise1" |
| franchise_tenure_start_date / end_date | varchar(255) | NULL | NULL | Contract period | "2024-01-01" |
| aadhar_number / pan_card / aadhar_card_image / pan_card_image | varchar | NULL | NULL | KYC documents | "1234-5678-9012" |
| bankDetails / reraRegistrationNumber / gstCertificate | varchar(255) | NULL | NULL | Compliance/banking docs | "HDFC0001234" |
| franchise_image_* (7 columns) | varchar/text | NULL | NULL | Uploaded profile image metadata | "logo.png" |
| display | enum('Y','N') | NULL | 'Y' | Show on public site? | "Y" |
| status | varchar(10) | NULL | 'A' | Active/Inactive | "A" |
| deleted_status | enum('A','I') | NULL | 'I' | Soft-delete flag | "I" |
| deleted_at | datetime | NULL | NULL | Soft-delete timestamp | NULL |
| created_by / updated_by | int | NULL | NULL | Audit | 1 |
| created_date / updated_date | timestamp | NULL | CURRENT_TIMESTAMP | Audit | 2024-01-01 |
| created_ip / updated_ip | varchar(50) | NULL | NULL | IP | "10.0.0.1" |
| created_at / updated_at | timestamp | NULL | CURRENT_TIMESTAMP / NULL | Duplicate audit columns (legacy + new naming coexist) | 2024-01-01 |

### `job_applications`
**Purpose:** Applications submitted against a `careers` posting.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| jobId | int | NULL | NULL | FK-by-convention → `careers.id` | 3 |
| applicant_name / email / mobile | text | NOT NULL | — | Applicant contact info | "Priya" |
| resume | text | NULL | NULL | Path/link to uploaded resume | "/uploads/resume.pdf" |
| country / state / city | varchar(100) | NULL | NULL | Applicant location | "India" |
| message | text | NULL | NULL | Cover note | "I am interested" |
| createdAt / updatedAt | datetime | NULL | NULL | Audit | 2024-06-01 |
| application_status | text | NULL | NULL | Reviewed/Shortlisted/Rejected | "New" |

### `master_allocate_features`
**Purpose:** Same idea as `allocate_amenities` but for "special features" instead of amenities — a saved feature-set template per property/sub-project type.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| allocation_id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| property_type_id / sub_project_type_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention to `master_property_type` / `master_project_sub_type` | 2 |
| selected_features | longtext | NOT NULL | — | JSON/CSV of chosen feature IDs | `[1,4]` |
| allocationType | varchar(255) | NULL | NULL | Category | "Residential" |
| created_by | bigint | NULL | NULL | Audit | 3 |
| created_role | varchar(255) | NULL | NULL | Creator's role | "Admin" |
| created_at / updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |

### Standard "master lookup" tables

The following tables all follow the **same simple lookup pattern**: `id` (PK, int, NOT NULL), `name`/label varchar(255), `description` text, a `..._status ENUM('A','I') DEFAULT 'I'` (or `'A'`) flag, and the standard audit sextet `created_by bigint`, `created_date datetime`, `updated_by bigint`, `updated_date datetime`, `created_ip varchar(20)`, `updated_ip varchar(20)`. They exist purely to populate dropdown lists elsewhere in the app, so each is documented in one row instead of being repeated 25 times.

| Table | Extra/different columns | Purpose (dropdown feeds) |
|---|---|---|
| `master_amenities` | `amenities_header_id` (FK→`master_amenities_header`) | Individual amenities (e.g. "Swimming Pool") grouped under a header |
| `master_amenities_header` | `country_code` | Amenity group headers (e.g. "Sports", "Convenience") |
| `master_approval_authority` | `country_code`, `state_code`, `city_code` | Government bodies that approve projects (e.g. HMDA) |
| `master_approval_status` | — | Approval workflow states (e.g. Pending/Approved) |
| `master_banks` | `public ENUM('Y','N')`, `logo_path` | Banks offering home loans, shown to leads/buyers |
| `master_banner_types` | — | Types of homepage banners |
| `master_bhk_sizes` | `no_of_parkings`, `no_of_balconies`, `no_of_bathrooms`, `min_size`, `max_size` | BHK configuration presets (1BHK, 2BHK...) |
| `master_community_types` | `country_code` | Gated community / standalone, etc. |
| `master_farm_house_types` | — | Farmhouse sub-categories |
| `master_gallery_headers` | `country_code` | Section headers for project photo galleries |
| `master_listing_type` | `slug`, `order` | Sale / Rent / Resale listing categories |
| `master_permissions` | — | Individual permission flags for RBAC |
| `master_possession_status` | `country_code` | Ready-to-move / Under-construction, etc. |
| `master_project_sub_type` | `project_type_id` (FK→`master_project_type`) | Sub-categories of a project type (e.g. Villa under Residential) |
| `master_project_type` | `country_code` | Residential / Commercial / Plot |
| `master_property_facing` | `country_code` | East/West/North facing, etc. |
| `master_property_sizes` | `country_code` | Preset plot/property size ranges |
| `master_property_sub_type` | `property_type_id` (FK→`master_property_type`) | Sub-categories of property type |
| `master_property_type` | `country_code` | Apartment/Villa/Plot/Office etc. |
| `master_property_uds_sizes` | `country_code` | Undivided Share (UDS) size presets |
| `master_role` | `role_access` | Named user roles (Admin, Sales Executive, Franchise…) |
| `master_saleable_area_representation` | — | How saleable area is expressed (sqft, sqm) |
| `master_special_features` | `special_features_header_id` (FK) | Individual special features under a header |
| `master_special_features_header` | `country_code` | Grouping headers for special features |
| `master_specifications` | `specifications_header_id` (FK) | Construction spec items (e.g. "Flooring: Vitrified tiles") |
| `master_specifications_header` | `country_code` | Grouping headers for specifications (e.g. "Structure", "Flooring") |
| `master_user_type` | — | Categories of platform users (Admin/Franchise/Customer) |
| `master_villa_types` | — | Villa sub-categories |

*Validation notes for all of the above:* `id` is `NOT NULL` with no default (auto-increment applied via `ALTER TABLE`); most text fields are optional (`DEFAULT NULL`); status columns are constrained to exactly `'A'` or `'I'` by the `ENUM` type — any other value is rejected by MySQL itself.

### `master_cities`
**Purpose:** Master list of Indian (or other) cities used for address/location dropdowns.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| city_name | varchar(255) | NOT NULL | — | Full city name | "Hyderabad" |
| city_code | varchar(10) | NOT NULL | — | Short code | "HYD" |
| country_code | varchar(2) | NOT NULL | — | FK-by-convention → `master_country.country_code` | "IN" |
| state_code | varchar(5) | NOT NULL | — | FK-by-convention → `master_states.state_code` | "TS" |

### `master_country`
**Purpose:** Master list of countries.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| country_name | varchar(255) | NOT NULL | — | Full name | "India" |
| country_code | varchar(2) | NOT NULL | — | ISO-style code | "IN" |
| phone_code | varchar(5) | NOT NULL | — | Dialing code | "+91" |

### `master_states`
**Purpose:** Master list of states/provinces.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| state_name | varchar(255) | NOT NULL | — | Full name | "Telangana" |
| state_code | varchar(5) | NOT NULL | — | Short code | "TS" |
| country_code | varchar(2) | NOT NULL | — | FK-by-convention → `master_country.country_code` | "IN" |

### `master_locality`
**Purpose:** Master list of localities/neighborhoods within a city.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| locality_name | varchar(255) | NOT NULL | — | Neighborhood name | "Gachibowli" |
| city_code | varchar(10) | NOT NULL | — | FK-by-convention → `master_cities.city_code` | "HYD" |
| country_code | varchar(2) | NOT NULL | — | FK-by-convention → `master_country.country_code` | "IN" |
| state_code | varchar(5) | NOT NULL | — | FK-by-convention → `master_states.state_code` | "TS" |

### `master_dropout_reasons`
**Purpose:** Reasons a lead can be marked as "dropped out" (lost) during the sales pipeline.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| dropout_reason | text | NULL | NULL | Reason text | "Budget mismatch" |
| created_by / updated_by | varchar(100) | NULL | NULL | Audit (stored as text, not an ID reference) | "admin" |
| created_date / updated_date | datetime | NULL | NULL | Audit | 2024-06-01 |
| status | varchar(100) | NULL | NULL | Active/Inactive | "A" |
| created_ip / updated_ip | varchar(100) | NULL | NULL | IP | "10.0.0.1" |

### `master_franchise_class`, `master_franchise_tier`, `master_franchise_type`
**Purpose:** Three-level classification of franchises — tier (broadest), type, and class — used to configure business rules/pricing per franchise level.

| Table | Key columns | Description |
|---|---|---|
| `master_franchise_tier` | `id`, `franchise_tier` varchar(100), `status` | Top-level tier label (e.g. "Tier 1", "Tier 2") |
| `master_franchise_type` | `id`, `franchise_tier` int (FK), `franchise_type` varchar(100), `status` | Type within a tier |
| `master_franchise_class` | `id`, `franchise_tier` int, `franchise_type` int, `franchise_class` varchar(100), `status` | Class within a type/tier — most granular |

All three share `created_date`, `created_by`, `created_ip`, `updated_date`, `updated_by`, `updated_ip` audit columns (varchar-typed rather than proper FK/int types in several places).

### `master_modules`
**Purpose:** List of application modules (matches the CodeIgniter HMVC module folders: leads, deal, home, leadflow, franchaiseleads, login) — used to scope status-types and permissions per module.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| module_id | int | NOT NULL | — | Primary key | 1 |
| module | varchar(100) | NULL | NULL | Module name | "leads" |
| order | varchar(100) | NULL | NULL | Display order | "1" |
| created_by / updated_by | int | NULL | NULL | Audit | 1 |
| created_date | varchar(100) | NULL | NULL | Audit (inconsistently typed as text) | "2024-06-01" |
| updated_date | datetime | NULL | NULL | Audit | 2024-06-01 |
| created_ip / updated_ip | varchar(100) | NULL | NULL | IP | "10.0.0.1" |
| status | varchar(100) | NULL | NULL | Active/Inactive | "A" |
| deleted_status | varchar(100) | NULL | NULL | Soft-delete flag | "N" |

### `master_project_name`
**Purpose:** The canonical "project" master record (a building/development), distinct from `project_listings` which appears to represent a specific listing/unit-group posted for sale within a project.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint | NOT NULL | — | Primary key | 1 |
| name | text | NULL | NULL | Project name | "Green Meadows" |
| country_code/state_code/city_code/locality | varchar | NULL | NULL | Location codes | "IN"/"TS"/"HYD" |
| builder_id | bigint | NULL | NULL | FK-by-convention → `builders.id` | 4 |
| position | int | NULL | 1 | Sort order | 1 |
| mobile_number / email | varchar/varchar(100) | NULL | NULL | Project contact info | "9876543210" |
| latitude / longitude | varchar(100) | NULL | NULL | Map coordinates | "17.4239" |
| total_number_of_blocks / number_of_floors_blocks / total_number_of_units | int | NULL | 0 | Project scale | 5 |
| community_type | varchar(255) | NULL | NULL | Community type text | "Gated" |
| age_of_possession | varchar(255) | NULL | NULL | Possession timeframe | "2 years" |
| project_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by/updated_by, created_date/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `master_registration_gst_prices`
**Purpose:** Location-specific registration & GST percentage rates used to estimate total property cost.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int UNSIGNED | NOT NULL | — | Primary key | 1 |
| prices_name | varchar(255) | NULL | NULL | Rate-set label | "Telangana GST 2024" |
| description | tinytext | NULL | NULL | Notes | "Standard rate" |
| country_id / state_id / city_id | int | NULL | NULL | FK-by-convention to location masters | 1 |
| registration_percentage / gst_percentage | decimal(10,2) | NULL | NULL | Percentage rates | 7.50 |
| prices_status | enum('A','I') | NULL | 'A' | Active/Inactive | "A" |
| created_by/updated_by, created_date/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `master_response_message` and `master_status_code`
**Purpose:** API response-message and status-code dictionaries — likely used by the API layer to return consistent, translatable messages (`lang` column suggests multi-language support was planned).

| Table | Key columns | Description |
|---|---|---|
| `master_response_message` | `id`, `code`, `module`, `operation`, `message`, `lang`, `status ENUM('A','I')` | Human-readable message per API response code/operation |
| `master_status_code` | `id`, `code`, `status`, `type`, `message`, `lang` | Numeric status/error codes and their meaning |

### `master_source` and `master_source_type`
**Purpose:** Lead-source tracking — where a lead came from (source) and the broader category of that source (source type), e.g. Source Type = "Digital", Source = "Facebook Ads".

| Table | Key columns | Description |
|---|---|---|
| `master_source_type` | `id`, `source_type` text, `source_status`, `status` | Broad channel category |
| `master_source` | `id`, `source_type_id` varchar(100) (FK-by-convention), `source_name` text, `status` | Specific source used in `project_leads.source_id` |

### `master_statustype`, `master_status_code`, `master_sub_module`, `master_module_statustype_mapping`
**Purpose:** Together these define a configurable **status workflow engine**: `master_modules` lists modules, `master_sub_module` lists sub-modules, `master_statustype` lists all possible lead/deal statuses (tagged to a module/sub-module with an icon), and `tbl_module_statustype_mapping` (documented later) defines which status can transition to which.

| Column (`master_statustype`) | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| status_type | varchar(255) | NULL | NULL | Status label | "Contacted" |
| module / sub_module | text | NULL | NULL | Scope of this status | "leads" |
| icon | text | NOT NULL | — | UI icon reference | "fa-phone" |
| created_by | int | NULL | NULL | Audit | 1 |
| created_date | timestamp | NULL | CURRENT_TIMESTAMP | Audit | 2024-06-01 |
| updated_by / updated_date | text | NOT NULL | — | Audit (unusually `NOT NULL` text, not int/datetime) | "admin" |
| created_ip / updated_ip | varchar(20) | NULL | NULL | IP | "10.0.0.1" |
| status | varchar(10) | NULL | NULL | Active/Inactive | "A" |

`master_sub_module` mirrors `master_modules` (`id`, `sub_module`, `module`, audit columns) — sub-categories within a module.

### `migrations`
**Purpose:** Standard Laravel migration-tracking table (records which schema migrations have run) — further evidence of a Laravel component in the stack.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int UNSIGNED | NOT NULL | — | Primary key | 1 |
| migration | varchar(255) | NOT NULL | — | Migration file name | "2024_01_01_000000_create_users_table" |
| batch | int | NOT NULL | — | Migration batch number | 1 |

### OAuth / API authentication tables (`oauth_access_tokens`, `oauth_auth_codes`, `oauth_clients`, `oauth_personal_access_clients`, `oauth_refresh_tokens`, `personal_access_tokens`)
**Purpose:** This is the standard **Laravel Passport** (OAuth2 server) table set, plus Laravel Sanctum's `personal_access_tokens`. It confirms a separate token-based API exists (likely feeding a mobile app or the public site) alongside session-based CodeIgniter login.

| Table | Key columns | Description |
|---|---|---|
| `oauth_clients` | `id` char(36) PK, `user_id`, `name`, `secret`, `provider`, `redirect`, `personal_access_client`, `password_client`, `revoked` | Registered API client apps |
| `oauth_access_tokens` | `id` varchar(100) PK, `user_id`, `client_id`, `name`, `scopes`, `revoked`, `expires_at` | Issued access tokens |
| `oauth_auth_codes` | `id` varchar(100) PK, `user_id`, `client_id`, `scopes`, `revoked`, `expires_at` | Temporary authorization codes (OAuth2 authorization-code grant) |
| `oauth_refresh_tokens` | `id` varchar(100) PK, `access_token_id`, `revoked`, `expires_at` | Refresh tokens to renew access tokens |
| `oauth_personal_access_clients` | `id`, `client_id`, timestamps | Marks which client is used for personal access tokens |
| `personal_access_tokens` | `id`, `tokenable_type`, `tokenable_id`, `name`, `token` (UNIQUE-ish, 64 chars), `abilities`, `last_used_at`, `expires_at` | Sanctum-style simple API tokens (polymorphic — can belong to any model via `tokenable_type`/`tokenable_id`) |

### `our_offices`
**Purpose:** Physical company office locations shown on the public website (About/Contact page).

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| office_type / speciality | varchar(255) | NULL | NULL | Office category | "Regional Office" |
| country/state/city/office_location | varchar(255) | NULL | NULL | Address parts | "Hyderabad" |
| contact_person / office_email / office_number | varchar(255) | NULL | NULL | Contact details | "Ravi" |
| about_office | text | NULL | NULL | Description | "Our flagship office" |
| status | enum('A','I') | NOT NULL | 'A' | Active/Inactive | "A" |
| created_at / updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |
| personImg | text | NULL | NULL | Office head photo path | "/img/x.png" |

### `package_listings` and `purchased_packages`
**Purpose:** Subscription/listing-quota packages sold to builders or sales partners so they can post a limited number of `project_listings`; `purchased_packages` records who bought which package and how much quota remains.

| Table | Key columns | Description |
|---|---|---|
| `package_listings` | `id`, `listing_type`, `country_code/state_code/city_code`, `package_one/two/three_type\|price\|days`, `no_of_listings`, `package_for`, `package_status` | Defines a purchasable package (price tiers, duration, quota) |
| `purchased_packages` | `purchase_id` PK, `package_id` (FK→`package_listings.id`), `user_id`, `user_role`, `package_type`, `price`, `number_of_days`, `total_listings`, `available_listings`, `activated_date`, `deactivate_date`, `purchase_date`, `purchase_status` | One purchase transaction + remaining quota tracking |

### `password_reset_tokens`
**Purpose:** Standard Laravel password-reset token table (email + token pair, no separate PK column — `email` is the primary key).

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| email | varchar(255) | NOT NULL | — | Primary key; user's email | "user@x.com" |
| token | varchar(255) | NOT NULL | — | Hashed reset token | "a1b2c3..." |
| created_at | timestamp | NULL | NULL | When the reset was requested | 2024-06-01 |

### `project_google_map_attributes`
**Purpose:** Caches Google Places API results (hospitals, schools, banks, parks, airports near a project) so the app doesn't re-call Google's API on every page view.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| project_id | int | NOT NULL | — | FK-by-convention → `master_project_name.id` | 1 |
| type | text | NOT NULL | — | POI category | "hospital" |
| data | longtext | NOT NULL | — | Raw JSON response from Google Places API | `{"results":[...]}` |
| status | int | NOT NULL | — | Active/valid flag | 1 |
| created_date / updated_date | datetime | NOT NULL | CURRENT_TIMESTAMP | Cache timestamps | 2024-06-01 |

### `project_leads` ⭐ (central table)
**Purpose:** The core sales-lead table — every enquiry captured for a specific project goes here. Drives the `leads` and `home` modules.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 101 |
| customer_name | varchar(255) | NOT NULL | — | Lead's name | "Anita Rao" |
| email_id | varchar(255) | NULL | NULL | Lead's email | "anita@x.com" |
| mobile_number | varchar(255) | NOT NULL | — | Lead's phone number | "9876543210" |
| project_id | int | NULL | NULL | FK-by-convention → `master_project_name.id` | 1 |
| ProjectFranchiseId | int | NULL | NULL | FK-by-convention → `franchise.franchise_id` (which franchise owns this project lead) | 4 |
| PhoneNumberExtension | varchar(255) | NULL | NULL | Country dial code | "+91" |
| CompletedStatus | int | NULL | 0 | FK-by-convention → `master_statustype.id` (current pipeline stage) | 1 |
| ChangeProject | enum('Y','N') | NULL | 'N' | Whether the lead was moved to a different project | "N" |
| status | varchar(11) | NULL | `'A'` (stored oddly as `'''A'''`) | Active/Inactive text flag | "A" |
| created_at / updated_at | text | NOT NULL | — | Audit (stored as free text, not a real datetime type) | "2024-06-01" |
| CreatedBy / ModifiedBy | int | NULL | NULL | FK-by-convention → `users.id` | 5 |
| CreatedDate | datetime | NOT NULL | CURRENT_TIMESTAMP | Lead creation time | 2024-06-01 10:00:00 |
| CreatedIPAddress / ModifiedIPAddress | varchar(50) | NULL | NULL | IP addresses | "10.0.0.1" |
| ModifiedDate | timestamp | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | Last-updated time | 2024-06-02 |
| FranchiseId | int | NULL | NULL | FK-by-convention → `franchise.franchise_id` | 4 |
| source_id | int | NOT NULL | 0 | FK-by-convention → `master_source.id` | 2 |
| comments | longtext | NULL | NULL | Free-text notes | "Interested in 3BHK" |
| sourcetype | int | NULL | NULL | FK-by-convention → `master_source_type.id` | 1 |
| Reason | int | NULL | NULL | FK-by-convention → `master_dropout_reasons.id` | NULL |
| DeletedStatus | enum('Yes','No') | NULL | 'No' | Soft-delete flag | "No" |
| DeactivateComments | text | NULL | NULL | Reason for deactivation | NULL |
| RequestedDate / RequestedBy | datetime/int | NULL | NULL | Used for reassignment/approval workflow | NULL |

*Validation notes:* `customer_name` and `mobile_number` are mandatory (`NOT NULL`) — the app cannot save a lead without a name and phone number. `status`/`DeletedStatus`/`ChangeProject` are constrained to their `ENUM` lists by MySQL.

### `project_leadseee`
**Purpose:** Structurally a near-duplicate of `project_leads` but simpler (fewer workflow columns) and on the newer `utf8mb4` charset. The unusual name (typo-like "leadseee") and its smaller footprint suggest this was an experimental/rework table or a leftover from a migration attempt that was not fully adopted.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| customer_name / mobile_number / email_id | varchar | NOT NULL | — | Lead contact info | "Anita" |
| project_id / source_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention | 1 |
| comments | text | NULL | NULL | Notes | "Follow up next week" |
| status | enum('A','I') | NOT NULL | — | Active/Inactive | "A" |
| created_at / updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |

### `project_listings` ⭐ (central table)
**Purpose:** A specific listing posted for sale/rent (linked to a `master_project_name` project) with full legal/approval/description detail. This is the largest single table in the schema (~80 columns).

*Key columns (full list is extensive — grouped by concern below):*

| Group | Columns | Description |
|---|---|---|
| Identity | `id` (PK), `propertyId`, `purchase_id` (FK→`purchased_packages`), `assigned_to` (FK→`users`), `project_name_id` (FK→`master_project_name`), `project_listing_name` | Listing identity & ownership |
| Classification | `property_type_id`, `property_sub_type_id`, `isSale`, `isRent`, `listing_type_id` | What kind of listing this is |
| Location | `country_code`, `state_code`, `city_code`, `locality`, `sub_locality`, `street_name`, `door_number`, `builder_id`, `listed_by`, `latitude`, `longitude` | Where the property is |
| Approvals | `approval_authority`, `approval_number`, `approval_year`, `approval_document_path`, `real_estate_authority`, `real_estate_approval_number/_year/_document_path`, `other_1/2/3_approval_*` | Legal/RERA approvals (up to 5 approval types) |
| Land/Layout | `total_project_land_area(_size_id)`, `totalNumberOfBlocks`, `numberOfFloorsBlocks`, `totalNumberOfUnits`, `project_layout_document_path`, `sizeRepresentation` | Overall project scale |
| Utilities | `water_source`, `number_of_borewells`, `ground_water_depth` | Water infrastructure |
| Description | `furnishedStatus`, `community_type_id`, `property_min_size`, `property_max_size`, `property_size_representation_id`, `possession_status_id`, `project_description`, `project_specification` | Property description |
| Pricing extras | `preferred_location_floor_raising_charger_per_sft`, `prefered_location_charges_floor_charges_valid_from`, `preffered_location_charges_facing_per_sft`, `preffered_location_charges_corner_per_sft` | Location-based premium charges |
| Contact/media | `contact_timing_from/to`, `broucher_path` | Contact hours and brochure download |
| Status/workflow | `possession_by`, `posted_by`, `posted_on`, `age_of_possession`, `project_status`, `is_active`, `approval_status ENUM('A','I','R','')`, `approved_by`, `approval_rejected_by`, `approval_reject_reason` | Listing lifecycle & moderation |
| Audit | `created_by_type`, `created_by`, `created_date`, `created_ip`, `updated_by_type`, `updated_by`, `updated_date`, `updated_ip` | Standard audit |

*Validation notes:* `isSale`/`isRent` are `ENUM('1','0')` — booleans modeled as string enums rather than `TINYINT(1)`. `approval_status` allows an empty string as a valid enum member alongside 'A'/'I'/'R', which is unusual and can make "not yet decided" ambiguous with an empty value.

### `project_listings_furnished_mapping`
**Purpose:** Records which furnishing features (AC, wardrobe, modular kitchen, etc.) apply to a listing.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| project_listing_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `project_listings.id` | 10 |
| furnished | varchar(255) | NOT NULL | — | Furnishing category (e.g. "Semi-furnished") | "Semi-furnished" |
| feature_names | varchar(255) | NOT NULL | — | Specific feature | "Modular kitchen" |
| mapping_status | varchar(255) | NOT NULL | — | Active/Inactive | "A" |
| created_at / updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |

### Mapping / junction tables for `project_listings`

The following are all **many-to-many junction tables** between `project_listings` and a master table, sharing a very similar shape (`id`, `project_listing_id` FK, a `*_id` FK to the related master table, a status enum, and audit columns). Each resolves an N:M relationship into two 1:N relationships.

| Table | Links `project_listings` to | Purpose |
|---|---|---|
| `project_listing_amenities_mapping` | `master_amenities` (via `amenities_id`) | Which amenities a listing has |
| `project_listing_banks_mapping` | `master_banks` (via `bank_id`) | Which banks offer loans for this listing |
| `project_listing_special_features_mapping` | `master_special_features` (via `special_feature_id`) | Which special features a listing has |
| `project_listing_specifications_mapping` | `master_specifications` (via `specifications_id`) + free-text `description` + a loose `new_column` (undocumented, likely an ad-hoc patch) | Construction specification details per listing |
| `project_listing_approval_status_history` | `master_approval_status` (via `approval_status_id`) | Audit trail of a listing's approval-workflow changes |

Common columns: `id` PK, `project_listing_id`, the related `*_id`, `mapping_status`/`record_status ENUM('A','I')`, `created_by_type`, `created_by`, `created_date`, `updated_by_type`, `updated_by`, `updated_date`, `created_ip`, `updated_ip`.

### `project_listing_gallery`
**Purpose:** Photos/media uploaded for a listing, organized under a gallery header (e.g. "Exterior", "Interior").

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| project_listing_id | int | NULL | NULL | FK-by-convention → `project_listings.id` | 10 |
| gallery_header_id | int | NULL | NULL | FK-by-convention → `master_gallery_headers.id` | 2 |
| file_path / thumbnail_path | text | NULL | NULL | Image paths | "/uploads/img1.jpg" |
| metadata | text | NULL | NULL | Extra image info (JSON) | `{"width":1200}` |
| order | bigint | NULL | NULL | Display order | 1 |
| gallery_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by_type/created_by/created_date, updated_by_type/updated_by/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `project_listing_units`
**Purpose:** Individual sellable units (flat/villa/plot configuration) within a listing, with full pricing breakdown — this is where price per unit type actually lives.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| project_listing_id | int | NULL | NULL | FK-by-convention → `project_listings.id` | 10 |
| villa_type_id / farm_house_type_id / property_facing_id / property_bhk_size_id | int | NULL | NULL | FK-by-convention to related master tables | 1 |
| super_built_up_area / carpet_area / floor_level / uds / plot_size / length / width | varchar(10) | NULL | NULL | Size measurements | "1250" |
| car_parkings / balconies / bathrooms | int | NULL | NULL | Unit configuration counts | 2 |
| property_uds_size_id / property_size_id / dimension_representation | mixed | NULL | NULL | FK-by-convention / unit of measure | 1 |
| north_facing_road_width_in_fts | varchar(10) | NULL | NULL | Road width | "30" |
| currency | varchar(10) | NULL | NULL | Pricing currency | "INR" |
| base_price / total_base_price / amenities_charges / car_parking_charges / club_house_charges / corpus_fund / advance_maintenance_charges / legal_charges / others_1/2/3_charges / estimated_total_price / gst_charges / registration_charges | varchar(10) | NULL | NULL | Full price breakdown (stored as varchar, not decimal — see Performance section) | "4500000" |
| advance_maintenance_for_months | int | NULL | NULL | Months of advance maintenance | 12 |
| floor_number | int | NULL | 0 | Which floor | 5 |
| floor_plan_path / floor1_plan_path / floor2_plan_path / thumbnail_path | text | NULL | NULL | Floor plan images | "/uploads/plan.png" |
| metadata | text | NULL | NULL | Extra JSON | `{}` |
| order | bigint | NULL | NULL | Sort order | 1 |
| unit_status | enum('A','I') | NULL | 'A' | Active/Inactive | "A" |
| created_by_type/created_by/created_date, updated_by_type/updated_by/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `project_listing_video_links`
**Purpose:** Video URLs (YouTube etc.) attached to a listing.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| project_listing_id | int | NULL | NULL | FK-by-convention → `project_listings.id` | 10 |
| video_url / video1 / video2 | text | NULL | NULL | Video links | "https://youtube.com/..." |
| video_type | varchar(255) | NULL | NULL | e.g. "YouTube" | "YouTube" |
| video_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by_type/created_by/created_date, updated_by_type/updated_by/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `registration`
**Purpose:** Sign-up records for new platform users (builders, franchises, or customers) before/alongside their `users` account — the `otp` column suggests mobile/email verification during sign-up.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| user_type_id | int | NULL | NULL | FK-by-convention → `master_user_type.id` | 2 |
| first_name / last_name | varchar(255) | NULL | NULL | Name | "Ravi" |
| email / mobile | varchar | NULL | NULL | Contact | "ravi@x.com" |
| otp | text | NULL | NULL | One-time password for verification | "483920" |
| username / password | varchar | NULL | NULL | Login credentials | "ravi123" |
| country_code/state_code/city_code/address | mixed | NULL | NULL | Location | "IN" |
| company_name / gst_number | varchar(255) | NULL | NULL | Business details | "ABC Corp" |
| registration_status | enum('A','I') | NULL | 'I' | Approved/pending | "I" |
| created_by/updated_by, created_date/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `role_permissions_mapping`
**Purpose:** Junction table implementing role-based access control (RBAC) — which permissions each role has.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| role_id | int | NULL | NULL | FK-by-convention → `master_role.id` | 2 |
| permission_id | int | NULL | NULL | FK-by-convention → `master_permissions.id` | 5 |
| role_permission_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by/updated_by, created_date/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `tbl_channel_partner`
**Purpose:** External channel-partner agents (individuals/agencies who refer customers for a commission) who can log in and submit `tbl_cp_leads`.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| city_office_id | int | NOT NULL | — | FK-by-convention → `tbl_city_office.id` | 1 |
| role_id | varchar(100) | NOT NULL | — | FK-by-convention → `master_role.id` | "3" |
| full_name / date_of_birth / date_of_joining | text/varchar | NOT NULL | — | Identity | "Suresh Kumar" |
| primary_email / secondary_email | varchar(100) | mixed | NULL | Contact | "suresh@x.com" |
| primary_mobile / secondary_mobile | varchar(100) | mixed | NULL | Contact | "9876543210" |
| username / password | varchar/text | NOT NULL/NULL | NULL | Login credentials | "suresh_cp" |
| profile / bank_details / aadhar_card / pan_card | varchar(100) | NULL | NULL | KYC/profile docs | "profile.pdf" |
| tenure_start_date / tenure_end_date | varchar(100) | NULL | NULL | Contract period | "2024-01-01" |
| status | enum('A','I') | NULL | 'A' | Active/Inactive | "A" |
| created_at | datetime | NULL | NULL | Audit | 2024-06-01 |
| created_by/created_ip, updated_at/updated_by/updated_ip | mixed | NULL | NULL | Standard audit | — |

### `tbl_city_office`
**Purpose:** Physical sales office per city — the top of the internal sales hierarchy (city office → team leader → sales executive).

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| user_role | int | NOT NULL | — | FK-by-convention → `master_role.id` | 2 |
| city_office_name | varchar(255) | NOT NULL | — | Office name | "Hyderabad Office" |
| city_office_primary_phone/secondary_phone/primary_email/secondary_email | varchar(255) | mixed | NULL | Office contact | "info@x.com" |
| country/state/city/city_office_address | varchar(255) | NOT NULL | — | Location | "Telangana" |
| user_name / password | varchar(255) | NOT NULL | — | Office login credentials | "hyd_office" |
| office_head_name/primary_phone/secondary_phone/primary_email/secondary_email/date_of_birth/profile | varchar(255) | NOT NULL | — | Office head details | "Ramesh" |
| status | enum('A','I') | NOT NULL | 'A' | Active/Inactive | "A" |
| created_ip/updated_ip | varchar(255) | NULL | NULL | IP | "10.0.0.1" |
| created_at/updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |
| created_by/updated_by | int | NULL | NULL | Audit | 1 |

### `tbl_city_office_sales_executive`
**Purpose:** Individual sales staff working under a city office (and optionally under a team leader) — the person actually assigned to work leads.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| city_office_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `tbl_city_office.id` | 1 |
| team_leader_id | int | NULL | NULL | FK-by-convention → `tbl_team_leaders.id` | 3 |
| role_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `master_role.id` | 4 |
| full_name / username / password / primary_email / primary_mobile | varchar(255) | NOT NULL | — | Identity & login | "Anil" |
| date_of_birth | date | NULL | NULL | DOB | "1990-05-01" |
| date_of_joining | varchar(100) | NULL | NULL | Joining date | "2023-01-01" |
| secondary_email/secondary_mobile/profile/resume/aadhar_card/pan_card | varchar(255) | NULL | NULL | Optional profile info | "resume.pdf" |
| bank_details | text | NULL | NULL | Banking info | "HDFC..." |
| status | enum('A','I') | NOT NULL | 'A' | Active/Inactive | "A" |
| created_by/created_ip/updated_by/updated_ip | varchar(255) | NULL | NULL | Audit | "admin" |
| created_at/updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |

### `tbl_cp_leads`
**Purpose:** Leads submitted specifically by a channel partner — structurally almost identical to `project_leads` but with `channel_partner_id` instead of `FranchiseId`/`ProjectFranchiseId`.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| channel_partner_id | int | NOT NULL | — | FK-by-convention → `tbl_channel_partner.id` | 2 |
| project_id | int | NOT NULL | — | FK-by-convention → `master_project_name.id` | 1 |
| customer_name | text | NOT NULL | — | Lead name | "Kiran" |
| email / mobile_number / PhoneNumberExtension | varchar(100) | NULL | NULL | Contact | "kiran@x.com" |
| CompletedStatus | int | NULL | 0 | FK-by-convention → `master_statustype.id` | 1 |
| ChangeProject | enum('Y','N') | NULL | 'N' | Reassigned project flag | "N" |
| status | varchar(100) | NULL | `'"A"'` (note stray quotes baked into the literal default) | Active/Inactive | "A" |
| created_at/updated_at | text | NULL | NULL | Audit (text-typed) | "2024-06-01" |
| CreatedBy/ModifiedBy | int | NULL | NULL | FK-by-convention → `users.id` | 5 |
| CreatedDate/ModifiedDate | datetime | NULL | NULL | Audit | 2024-06-01 |
| CreatedIPAddress/ModifiedIPAddress | varchar(100) | NULL | NULL | IP | "10.0.0.1" |
| source_id | int | NULL | 0 | FK-by-convention → `master_source.id` | 2 |
| comments | text | NULL | NULL | Notes | "Called, interested" |
| sourcetype | varchar(100) | NULL | NULL | FK-by-convention → `master_source_type.id` | "1" |
| Reason | int | NULL | NULL | FK-by-convention → `master_dropout_reasons.id` | NULL |
| DeletedStatus | enum('Yes','No') | NULL | 'No' | Soft-delete | "No" |
| DeactivateComments/RequestedDate/RequestedBy | mixed | NULL | NULL | Reassignment workflow | NULL |

### `tbl_cp_leads_status_history` and `tbl_lead_status_history` ⭐ (central tables)
**Purpose:** Full audit trail of every status change made to a channel-partner lead / a regular project lead respectively — this is how the sales pipeline history ("Contacted → Site Visit → Negotiation → Closed/Dropped") is reconstructed.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| LeadStatusID | int | NOT NULL | — | Primary key | 1001 |
| LeadId | int | NULL | NULL | FK-by-convention → `tbl_cp_leads.id` / `project_leads.id` | 101 |
| ProjectId | int | NULL | NULL | FK-by-convention → `master_project_name.id` | 1 |
| CompletedStatus | int | NULL | NULL | FK-by-convention → `master_statustype.id` (status just recorded) | 3 |
| FutureStatus | int | NULL | NULL | FK-by-convention → `master_statustype.id` (next planned status) | 4 |
| FutureStatusDate / FutureStatusTimeHours / FutureStatusTimeMinutes | date/int | NULL | NULL | Scheduled follow-up time | "2024-06-10" |
| DropoutReasonId | int | NULL | NULL | FK-by-convention → `master_dropout_reasons.id` | NULL |
| DOReasonLoanEligibility/City/CityLocation/Budget/Possession | varchar/int | NULL | NULL | Structured dropout-reason detail | "Not eligible" |
| Comments | text | NULL | NULL | Free-text note for this status change | "Customer requested callback" |
| ChangeProject | enum('Y','N') | NULL | 'N' | Project reassignment flag | "N" |
| CreatedBy/ModifiedBy | int | NULL | NULL | FK-by-convention → `users.id` | 5 |
| CreatedDate | datetime | NOT NULL | — | When this history row was created | 2024-06-01 10:00:00 |
| CreatedIPAddress/ModifiedIPAddress | varchar | NULL | NULL | IP | "10.0.0.1" |
| ModifiedDate | datetime | NULL | NULL | Last edit time | 2024-06-02 |
| ActionFrom | enum('T','P','F','O') | NULL | NULL | Which channel recorded the action (Telecaller/Partner/Franchise/Other, inferred) | "T" |
| ProjectFranchiseId | varchar(50) | NULL | NULL | (only in `tbl_lead_status_history`) franchise scoping | "4" |
| Status | varchar(10)/varchar(100) | NULL | 'A' | Row-level active flag | "A" |
| DeletedStatus | enum('A','I') | NULL | 'I' | Soft-delete flag (comment in dump: `A=Active, I=Inactive`) | "I" |
| RequestedDate/RequestedBy | timestamp/int | NULL | NULL | Reassignment request tracking | NULL |

*Note:* `tbl_lead_status_history` contains by far the most data in the dump (thousands of INSERT rows), confirming it is the busiest table — every single lead touch/follow-up generates a row here.

### `tbl_cp_lead_history_dropout_reasons` and `tbl_lead_status_history_dropout_reasons`
**Purpose:** Extra free-text detail captured specifically when a lead is dropped out, linked back to a status-history row.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| DropOutId | int | NOT NULL | — | Primary key | 1 |
| LeadStatusID | int | NULL | NULL | FK-by-convention → `tbl_lead_status_history`/`tbl_cp_leads_status_history` | 1001 |
| LeadId | int | NULL | NULL | FK-by-convention → the parent lead | 101 |
| userId | int | NULL | NULL | FK-by-convention → `users.id` | 5 |
| DropoutReasonId | int | NULL | NULL | FK-by-convention → `master_dropout_reasons.id` | 2 |
| DropoutReasonComment1 / DropoutReasonComment2 / Comments | text | NULL | NULL | Free-text elaboration | "Chose competitor" |
| ActionFrom | varchar(100)/text | NULL | NULL | Channel that logged it | "T" |
| CreatedBy/CreatedDate/CreatedIPAddress | varchar(100) | NULL | NULL | Audit (all text-typed, not proper int/datetime) | "admin" |

### `tbl_module_statustype_mapping`
**Purpose:** Defines the **allowed status-transition graph** for a module — i.e. which `StatusFrom` can legally move to which `StatusTo` (e.g. you can't jump straight from "New" to "Closed" without passing through "Contacted"). This is the workflow rule-engine backing the lead pipeline.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| MappingID | int | NOT NULL | — | Primary key | 1 |
| Module | int | NULL | NULL | FK-by-convention → `master_modules.module_id` | 1 |
| StatusFrom / StatusTo | int | NULL | NULL | FK-by-convention → `master_statustype.id` (both ends of the transition) | 1 → 2 |
| CreatedBy/ModifiedBy | int | NULL | NULL | Audit | 1 |
| CreatedDate | timestamp | NULL | CURRENT_TIMESTAMP | Audit | 2024-06-01 |
| ModifiedDate | timestamp | NULL | '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP | Audit (zero-date default is a legacy MySQL pattern, deprecated in modern MySQL strict mode) | 2024-06-02 |
| CreatedIPAddress/ModifiedIPAddress | varchar(20) | NULL | NULL | IP | "10.0.0.1" |
| Status | varchar(10) | NULL | NULL | Active/Inactive | "A" |
| DeletedStatus | enum('A','I') | NULL | 'I' | Soft-delete | "I" |

### `tbl_team_leaders`
**Purpose:** Mid-level sales staff who supervise a group of sales executives within a city office.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| city_office_id | int | NOT NULL | — | FK-by-convention → `tbl_city_office.id` | 1 |
| role_id | int | NOT NULL | — | FK-by-convention → `master_role.id` | 3 |
| full_name | text | NOT NULL | — | Name | "Meena" |
| date_of_birth | date | NULL | NULL | DOB | "1988-03-01" |
| date_of_joining | varchar(100) | NULL | NULL | Joining date | "2022-01-01" |
| username/password | varchar(100) | NOT NULL | — | Login credentials | "meena_tl" |
| primary_email | text | NOT NULL | — | Contact | "meena@x.com" |
| secondary_email | text | NULL | NULL | Alt contact | NULL |
| primary_mobile | varchar(100) | NOT NULL | — | Contact | "9876543210" |
| secondary_mobile/profile/bank_details/resume/aadhar_card/pan_card | varchar(255) | NULL | NULL | Profile/KYC | NULL |
| status | enum('A','I') | NULL | 'A' | Active/Inactive | "A" |
| created_by/created_ip/updated_by/updated_ip | varchar | NULL | NULL | Audit | "admin" |
| created_at/updated_at | datetime | NULL | NULL | Audit | 2024-06-01 |

### `tbl_users_projects_mapping` and `tbl_user_location_mapping`
**Purpose:** Junction tables controlling *which projects* and *which geographic areas* a given user (sales executive/franchise) is allowed to see leads for — i.e. lead-visibility scoping rules.

| Table | Key columns | Description |
|---|---|---|
| `tbl_users_projects_mapping` | `id` PK, `user_id` varchar(255) (FK-by-convention, oddly typed as text not int), `user_type`, `project_ids` varchar(255) (comma-separated list — a normalization smell, see §15), `leads_start_date`, `status`, `DeletedStatus` | Which projects a user can access |
| `tbl_user_location_mapping` | `id` PK, `user_id` bigint UNSIGNED, `user_type`, `country`, `state`, `city`, `locality`, `status` | Which geographic territory a user can access |

### `users` ⭐ (central table)
**Purpose:** Core internal application user account (admin/staff/franchise login) — separate from `tbl_city_office_sales_executive`/`tbl_team_leaders`/`franchise` which each have their own login columns; `users` looks like the unified/central auth table referenced by `entity_id`/`entity_type` (a polymorphic link back to whichever staff type the account represents).

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| role_id | text | NULL | NULL | FK-by-convention → `master_role.id` (stored as text, possibly CSV for multi-role) | "2" |
| entity_id / entity_type | varchar | NULL | NULL | Polymorphic link to the specific staff record (e.g. `tbl_city_office_sales_executive`) | "15" / "sales_executive" |
| first_name / last_name | varchar(255) | NULL | NULL | Name | "Priya" |
| email / mobile / username | varchar | NULL | NULL | Login identifiers | "priya@x.com" |
| company_name | varchar(255) | NULL | NULL | For builder/franchise accounts | "ABC Corp" |
| password | varchar(255) | NULL | NULL | Hashed password | "$2y$10$..." |
| country_code/state_code/city_code/address | mixed | NULL | NULL | Location | "IN" |
| user_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by/updated_by, created_date/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |
| project_type_id | varchar(255) | NULL | NULL | Which project type(s) the user works with | "1,2" |
| otp | text | NULL | NULL | Login OTP | "483920" |

### `user_enquiries`
**Purpose:** Generic "Contact Us" enquiries from the public site not tied to a specific project.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| name/mobile/email | varchar(255) | NOT NULL | — | Contact info | "Kavya" |
| country/city | varchar(255) | NOT NULL | — | Location | "India" |
| subject/message | text | NOT NULL | — | Enquiry content | "General enquiry" |
| createdAt/updatedAt | text | NOT NULL | — | Audit (text-typed) | "2024-06-01" |
| status | text | NOT NULL | — | Processing status | "New" |
| created_at/updated_at | timestamp | NULL | NULL | Duplicate proper-typed audit columns | 2024-06-01 |

### `user_feedback` and `user_feedbacks`
**Purpose:** Two separate (likely duplicate/legacy vs. newer) tables capturing website feedback forms — `user_feedback` (older, no status/timestamps, **and notably has no primary key defined in the ALTER section**) vs. `user_feedbacks` (newer, utf8mb4, has status & timestamps but also has **no primary key**).

| Table | Key columns | Description |
|---|---|---|
| `user_feedback` | `id`, `name`, `mail`, `feedback`, `typefeedback` (all `text NOT NULL`) | Older simple feedback form |
| `user_feedbacks` | `name`, `email`, `feedback`, `message`, `status ENUM('A','I')`, `createdAt`, `updatedAt` | Newer feedback form (no `id` column at all) |

*This is one of the schema's data-integrity gaps: `user_feedbacks` has no primary key of any kind, so individual rows cannot be reliably referenced or updated.*

### `user_otps`
**Purpose:** One-time passwords issued for mobile-number verification (login/registration).

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| mobile | varchar(15) | NOT NULL | — | Phone number the OTP was sent to | "9876543210" |
| otp | varchar(100) | NOT NULL | — | The OTP code | "483920" |
| expires_at | datetime | NOT NULL | — | Expiry time | 2024-06-01 10:05:00 |
| created_at | datetime | NULL | NULL | Issued time | 2024-06-01 10:00:00 |

### `user_responses`
**Purpose:** Records a franchise's response/action on a lead assigned to it — e.g. logging a scheduled site visit.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint UNSIGNED | NOT NULL | — | Primary key | 1 |
| project_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `master_project_name.id` | 1 |
| user_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `users.id` | 5 |
| name/mobile/email | varchar | NOT NULL/NULL | — | Lead's contact info (denormalized copy) | "Anita" |
| franchise_id | bigint UNSIGNED | NOT NULL | — | FK-by-convention → `franchise.franchise_id` | 4 |
| franchiseName | varchar(255) | NOT NULL | — | Denormalized franchise name | "Unimakler Hyderabad" |
| contacted_date / scheduled_visit_time | varchar(255) | NULL | NULL | Follow-up scheduling | "2024-06-10 15:00" |
| response_status | enum('A','I') | NOT NULL | — | Active/Inactive | "A" |
| created_at/updated_at | timestamp | NULL | NULL | Audit | 2024-06-01 |

### `website_banners`
**Purpose:** Promotional banners shown on the public website, optionally tied to a specific listing.

| Column | Data Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | int | NOT NULL | — | Primary key | 1 |
| country_code/state_code/city_code | text | NOT NULL | — | Where the banner shows (unusually typed as `text` rather than `varchar`) | "IN" |
| project_listing_id | int | NULL | NULL | FK-by-convention → `project_listings.id` | 10 |
| banner_type_id | int | NULL | NULL | FK-by-convention → `master_banner_types.id` | 1 |
| banner_position | int | NULL | NULL | Sort/placement order | 1 |
| banner_status | enum('A','I') | NULL | 'I' | Active/Inactive | "A" |
| created_by_type/created_by/created_date, updated_by_type/updated_by/updated_date, created_ip/updated_ip | mixed | NULL | NULL | Standard audit | — |

---

## 5. Primary Keys

Every table except **`user_feedback`** and **`user_feedbacks`** has a defined `PRIMARY KEY` (confirmed via the `ADD PRIMARY KEY` statements in the dump — 101 tables have one, 2 tables have none). Most primary keys are named `id` and are `AUTO_INCREMENT` integers, chosen because:

- They uniquely identify a row without depending on business data that can change (e.g. a person's name can change, an auto-generated number never needs to).
- They are compact (4–8 bytes), which keeps the primary index small and fast.

Tables that deviate from the plain `id` naming (still integer surrogate keys, just domain-specific names — a naming-consistency issue, see §20):

| Table | Primary Key Column |
|---|---|
| `franchise` | `franchise_id` |
| `master_allocate_features` | `allocation_id` |
| `master_modules` | `module_id` |
| `purchased_packages` | `purchase_id` |
| `tbl_cp_leads_status_history` | `LeadStatusID` |
| `tbl_lead_status_history` | `LeadStatusID` |
| `tbl_cp_lead_history_dropout_reasons` | `DropOutId` |
| `tbl_lead_status_history_dropout_reasons` | `DropOutId` |
| `tbl_module_statustype_mapping` | `MappingID` |
| `password_reset_tokens` | `email` (natural key, not surrogate — makes sense since one active token per email) |

All other 91 tables use `id`. Tables with **no primary key** (`user_feedback`, `user_feedbacks`) cannot guarantee row uniqueness, cannot be safely `UPDATE`d/`DELETE`d by a single row without risking hitting multiple identical rows, and cannot be efficiently replicated in row-based replication — this is a design weakness worth fixing.

---

## 6. Foreign Keys

**Important finding:** the dump contains **zero database-enforced foreign keys** (`grep -c "FOREIGN KEY"` on the full SQL file returns 0). Every relationship below is *implied* by column naming (`xxx_id` pointing at another table's primary key) and is only enforced by application code in the CodeIgniter models — the database itself will happily accept a `project_leads.project_id` that points to a project which doesn't exist.

### Implied relationships (by naming convention)

| Child table . Column | Parent table . Column | Cardinality | Real example |
|---|---|---|---|
| `builder_locations.builder_id` | `builders.id` | N:1 | One builder ("ABC Developers") can have many branch locations |
| `master_project_name.builder_id` | `builders.id` | N:1 | Many projects can belong to one builder |
| `project_listings.project_name_id` | `master_project_name.id` | N:1 | A project can have multiple listings (e.g. Phase 1, Phase 2) |
| `project_listings.assigned_to` | `users.id` | N:1 | Many listings can be managed by one staff user |
| `project_listings.purchase_id` | `purchased_packages.purchase_id` | N:1 | A package purchase can cover multiple listings |
| `project_listing_units.project_listing_id` | `project_listings.id` | N:1 | One listing has many unit configurations (1BHK, 2BHK, 3BHK) |
| `project_listing_gallery.project_listing_id` | `project_listings.id` | N:1 | One listing has many gallery photos |
| `project_listing_amenities_mapping.project_listing_id` + `.amenities_id` | `project_listings.id` + `master_amenities.id` | N:M (via junction) | A listing can have many amenities, and an amenity (e.g. "Gym") can appear on many listings |
| `project_listing_banks_mapping.project_listing_id` + `.bank_id` | `project_listings.id` + `master_banks.id` | N:M (via junction) | A listing can be financed by many banks; a bank finances many listings |
| `project_leads.project_id` | `master_project_name.id` | N:1 | Many leads can be interested in one project |
| `project_leads.FranchiseId` / `.ProjectFranchiseId` | `franchise.franchise_id` | N:1 | Many leads are handled by one franchise |
| `project_leads.source_id` | `master_source.id` | N:1 | Many leads can come from the same source (e.g. "Facebook Ads") |
| `project_leads.sourcetype` | `master_source_type.id` | N:1 | Many sources share one source type |
| `project_leads.Reason` | `master_dropout_reasons.id` | N:1 | Many leads can share the same dropout reason |
| `project_leads.CreatedBy` / `.ModifiedBy` | `users.id` | N:1 | Many leads created/modified by one user |
| `tbl_lead_status_history.LeadId` | `project_leads.id` | N:1 | One lead has many status-history entries (its full timeline) |
| `tbl_lead_status_history.CompletedStatus` / `.FutureStatus` | `master_statustype.id` | N:1 | Many history rows reference the same status label |
| `tbl_lead_status_history_dropout_reasons.LeadStatusID` | `tbl_lead_status_history.LeadStatusID` | 1:1 (usually) | Extra dropout detail tied to one specific status-change event |
| `tbl_cp_leads.channel_partner_id` | `tbl_channel_partner.id` | N:1 | Many leads submitted by one channel partner |
| `tbl_channel_partner.city_office_id` | `tbl_city_office.id` | N:1 | Many channel partners registered under one city office |
| `tbl_city_office_sales_executive.city_office_id` | `tbl_city_office.id` | N:1 | Many sales executives work at one city office |
| `tbl_city_office_sales_executive.team_leader_id` | `tbl_team_leaders.id` | N:1 | Many sales executives report to one team leader |
| `tbl_team_leaders.city_office_id` | `tbl_city_office.id` | N:1 | Many team leaders belong to one city office |
| `role_permissions_mapping.role_id` + `.permission_id` | `master_role.id` + `master_permissions.id` | N:M (via junction) | A role has many permissions; a permission belongs to many roles |
| `tbl_module_statustype_mapping.StatusFrom` / `.StatusTo` | `master_statustype.id` | N:1 (both ends) | Defines legal transitions between status values |
| `franchise.franchise_type` / `.franchise_class` | `master_franchise_type.id` / `master_franchise_class.id` | N:1 | Many franchises share a type/class |
| `master_cities.state_code` / `.country_code` | `master_states.state_code` / `master_country.country_code` | N:1 | Many cities belong to one state/country |
| `master_locality.city_code` | `master_cities.city_code` | N:1 | Many localities belong to one city |
| `job_applications.jobId` | `careers.id` | N:1 | Many applications for one job posting |
| `purchased_packages.package_id` | `package_listings.id` | N:1 | Many purchases of the same package |
| `oauth_access_tokens.client_id` | `oauth_clients.id` | N:1 | Many tokens issued to one client app |
| `oauth_refresh_tokens.access_token_id` | `oauth_access_tokens.id` | 1:1 | Each access token has (at most) one refresh token |

### Why there are no enforced FKs (and what it costs)
Without real `FOREIGN KEY` constraints, MySQL cannot guarantee referential integrity: a `project_id` in `project_leads` could reference a project that was deleted, or never existed, and MySQL will not stop it. This trades safety for flexibility/performance (no constraint-checking overhead on writes) but pushes all correctness responsibility onto the PHP application code — a common (if risky) pattern in older CodeIgniter-era projects, and something a team should weigh fixing as the schema matures (see §16/§20).

---

## 7. Table Relationships

Plain-English relationship flow for the **main lead-to-deal business process**:

```
[Website Visitor]
        │  fills enquiry form
        ▼
project_leads  (or tbl_cp_leads if referred by a channel partner)
   • project_id ───────────► master_project_name ───► builders
   • source_id  ───────────► master_source ─────────► master_source_type
   • FranchiseId ──────────► franchise ─────────────► master_franchise_type/tier/class
        │
        │  every status change is logged
        ▼
tbl_lead_status_history  (or tbl_cp_leads_status_history)
   • CompletedStatus / FutureStatus ───► master_statustype
   • DropoutReasonId ───────────────────► master_dropout_reasons
        │
        │  if dropped out, extra detail captured
        ▼
tbl_lead_status_history_dropout_reasons
        │
        │  meanwhile, the project itself is published with details from:
        ▼
project_listings ──► project_listing_units (pricing)
                 ──► project_listing_gallery (photos)
                 ──► project_listing_amenities_mapping ──► master_amenities
                 ──► project_listing_banks_mapping ──► master_banks
        │
        │  staff working the lead are organized as:
        ▼
tbl_city_office ──► tbl_team_leaders ──► tbl_city_office_sales_executive
        │
        ▼
   users (unified login) ──► role_id ──► master_role ──► role_permissions_mapping ──► master_permissions
```

**In words:** A visitor's enquiry becomes a row in `project_leads`, tagged with which project they're interested in and where the lead came from. As sales staff (organized under a city office → team leader → sales executive hierarchy, or a franchise) work the lead, every touch-point is appended to `tbl_lead_status_history`, referencing a status from `master_statustype`. If the lead is lost, a reason from `master_dropout_reasons` is recorded. The project itself, and everything a buyer sees about it (units, price, photos, amenities, financing banks), lives in `project_listings` and its mapping tables.

---

## 8. CRUD Operations

Examples for the 9 most central tables: `users`, `project_leads`, `tbl_lead_status_history`, `master_project_name`, `project_listings`, `franchise`, `tbl_city_office_sales_executive`, `master_statustype`, `project_listing_units`.

### `users`

```sql
-- CREATE: register a new internal user
INSERT INTO users (role_id, first_name, last_name, email, mobile, username, password, user_status, created_date)
VALUES ('2', 'Priya', 'Sharma', 'priya@unimakler.com', '9876543210', 'priya.sharma', '$2y$10$hashedpwd', 'A', NOW());
-- role_id: which role this user has (FK-by-convention to master_role)
-- password should always be a HASH, never plain text
-- user_status defaults new accounts to Active

-- READ: fetch one active user by email (used during login)
SELECT id, first_name, last_name, email, password, user_status
FROM users
WHERE email = 'priya@unimakler.com' AND user_status = 'A';
-- WHERE narrows to exactly the account being logged in and confirms it's active

-- UPDATE: deactivate a user
UPDATE users
SET user_status = 'I', updated_by = 1, updated_date = NOW()
WHERE id = 42;
-- Only row with id=42 is changed; updated_by/updated_date record who/when

-- DELETE: remove a user (rare — soft-delete via user_status is preferred)
DELETE FROM users WHERE id = 42;
-- Hard delete; in this schema there's no users.deleted_at, so this is irreversible
```

### `project_leads`

```sql
-- CREATE: capture a new website enquiry
INSERT INTO project_leads (customer_name, email_id, mobile_number, project_id, source_id, status, CreatedDate)
VALUES ('Anita Rao', 'anita@x.com', '9876543210', 1, 2, 'A', NOW());

-- READ: all leads for a given project that are still active
SELECT id, customer_name, mobile_number, CompletedStatus, CreatedDate
FROM project_leads
WHERE project_id = 1 AND DeletedStatus = 'No'
ORDER BY CreatedDate DESC;

-- UPDATE: move a lead to a new pipeline stage
UPDATE project_leads
SET CompletedStatus = 3, ModifiedBy = 5, ModifiedDate = NOW()
WHERE id = 101;

-- DELETE: soft-delete a lead (preferred over hard delete)
UPDATE project_leads SET DeletedStatus = 'Yes' WHERE id = 101;
```

### `tbl_lead_status_history`

```sql
-- CREATE: log a status change event for a lead
INSERT INTO tbl_lead_status_history (LeadId, ProjectId, CompletedStatus, FutureStatus, Comments, CreatedBy, CreatedDate, Status)
VALUES (101, 1, 3, 4, 'Customer requested a site visit', 5, NOW(), 'A');

-- READ: full timeline for one lead, latest first
SELECT LeadStatusID, CompletedStatus, FutureStatus, Comments, CreatedDate
FROM tbl_lead_status_history
WHERE LeadId = 101
ORDER BY CreatedDate DESC;

-- UPDATE: correct a mistaken comment on a history entry
UPDATE tbl_lead_status_history SET Comments = 'Corrected note', ModifiedBy = 5, ModifiedDate = NOW()
WHERE LeadStatusID = 5001;

-- DELETE: history rows are normally never hard-deleted (they are the audit trail);
-- soft-delete flag is used instead
UPDATE tbl_lead_status_history SET DeletedStatus = 'I' WHERE LeadStatusID = 5001;
```

### `master_project_name`

```sql
-- CREATE
INSERT INTO master_project_name (name, country_code, state_code, city_code, builder_id, project_status, created_date)
VALUES ('Green Meadows', 'IN', 'TS', 'HYD', 4, 'A', NOW());

-- READ: active projects in a city
SELECT id, name, locality FROM master_project_name WHERE city_code = 'HYD' AND project_status = 'A';

-- UPDATE
UPDATE master_project_name SET total_number_of_units = 250, updated_date = NOW() WHERE id = 1;

-- DELETE (soft)
UPDATE master_project_name SET project_status = 'I' WHERE id = 1;
```

### `project_listings`

```sql
-- CREATE
INSERT INTO project_listings (project_name_id, property_type_id, listing_type_id, is_active, created_date)
VALUES (1, 1, 2, 'A', NOW());

-- READ: approved, active listings
SELECT id, propertyId, project_name_id FROM project_listings WHERE is_active = 'A' AND approval_status = 'A';

-- UPDATE: approve a listing
UPDATE project_listings SET approval_status = 'A', approved_by = 'admin' WHERE id = 10;

-- DELETE (soft)
UPDATE project_listings SET is_active = 'I' WHERE id = 10;
```

### `franchise`

```sql
-- CREATE
INSERT INTO franchise (franchise_name, franchise_type, franchise_city, franchise_primary_email, status, created_date)
VALUES ('Unimakler Hyderabad West', 1, 'Hyderabad', 'hydwest@unimakler.com', 'A', NOW());

-- READ
SELECT franchise_id, franchise_name, franchise_city FROM franchise WHERE status = 'A';

-- UPDATE
UPDATE franchise SET franchise_territory = 'Gachibowli, Kondapur' WHERE franchise_id = 4;

-- DELETE (soft)
UPDATE franchise SET deleted_status = 'A', deleted_at = NOW() WHERE franchise_id = 4;
```

### `tbl_city_office_sales_executive`

```sql
-- CREATE
INSERT INTO tbl_city_office_sales_executive (city_office_id, role_id, full_name, username, password, primary_email, primary_mobile, status)
VALUES (1, 4, 'Anil Kumar', 'anil.kumar', '$2y$10$hashedpwd', 'anil@unimakler.com', '9876543210', 'A');

-- READ
SELECT id, full_name FROM tbl_city_office_sales_executive WHERE city_office_id = 1 AND status = 'A';

-- UPDATE
UPDATE tbl_city_office_sales_executive SET team_leader_id = 3 WHERE id = 7;

-- DELETE (soft)
UPDATE tbl_city_office_sales_executive SET status = 'I' WHERE id = 7;
```

### `master_statustype`

```sql
-- CREATE
INSERT INTO master_statustype (status_type, module, icon, created_date, status)
VALUES ('Site Visit Scheduled', 'leads', 'fa-calendar', NOW(), 'A');

-- READ: all statuses for the leads module
SELECT id, status_type FROM master_statustype WHERE module = 'leads' AND status = 'A';

-- UPDATE
UPDATE master_statustype SET icon = 'fa-calendar-check' WHERE id = 3;

-- DELETE (soft)
UPDATE master_statustype SET status = 'I' WHERE id = 3;
```

### `project_listing_units`

```sql
-- CREATE
INSERT INTO project_listing_units (project_listing_id, property_bhk_size_id, super_built_up_area, base_price, currency, unit_status)
VALUES (10, 2, '1250', '4500000', 'INR', 'A');

-- READ: units for a listing ordered by price
SELECT id, super_built_up_area, base_price FROM project_listing_units WHERE project_listing_id = 10 ORDER BY base_price ASC;

-- UPDATE
UPDATE project_listing_units SET base_price = '4650000' WHERE id = 55;

-- DELETE (soft)
UPDATE project_listing_units SET unit_status = 'I' WHERE id = 55;
```

---

## 9. Sample Data

Illustrative rows (based on real column shapes seen in the dump; where actual INSERT rows were visible in the source file they were used as a basis).

### `master_country`
| id | country_name | country_code | phone_code |
|---|---|---|---|
| 1 | India | IN | +91 |
| 2 | United Arab Emirates | AE | +971 |

### `master_cities`
| id | city_name | city_code | country_code | state_code |
|---|---|---|---|---|
| 1 | Hyderabad | HYD | IN | TS |
| 2 | Bengaluru | BLR | IN | KA |

### `builders`
| id | name | headoffice_location | builder_status |
|---|---|---|---|
| 1 | ABC Developers | Hyderabad | A |
| 2 | Skyline Constructions | Bengaluru | A |

### `master_project_name`
| id | name | city_code | builder_id | project_status |
|---|---|---|---|---|
| 1 | Green Meadows | HYD | 1 | A |
| 2 | Skyline Heights | BLR | 2 | A |

### `project_listings` (subset of columns)
| id | project_name_id | property_type_id | is_active | approval_status |
|---|---|---|---|---|
| 10 | 1 | 1 | A | A |
| 11 | 2 | 2 | A | R |

### `project_listing_units` (subset)
| id | project_listing_id | super_built_up_area | base_price | currency |
|---|---|---|---|---|
| 55 | 10 | 1250 | 4500000 | INR |
| 56 | 10 | 1450 | 5200000 | INR |

### `project_leads`
| id | customer_name | mobile_number | project_id | CompletedStatus | source_id |
|---|---|---|---|---|---|
| 101 | Anita Rao | 9876543210 | 1 | 3 | 2 |
| 102 | Kiran Reddy | 9123456789 | 2 | 1 | 4 |

### `tbl_lead_status_history`
| LeadStatusID | LeadId | CompletedStatus | FutureStatus | Comments |
|---|---|---|---|---|
| 5001 | 101 | 3 | 4 | "Customer requested a site visit" |
| 5002 | 101 | 4 | 5 | "Site visit completed, negotiating price" |

### `franchise`
| franchise_id | franchise_name | franchise_city | status |
|---|---|---|---|
| 4 | Unimakler Hyderabad West | Hyderabad | A |
| 5 | Unimakler Bengaluru North | Bengaluru | A |

### `users`
| id | first_name | last_name | email | user_status |
|---|---|---|---|---|
| 1 | Priya | Sharma | priya@unimakler.com | A |
| 2 | Ravi | Kumar | ravi@unimakler.com | A |

---

## 10. Business Logic

A one/two-sentence "why does this table exist" for every table, grouped by the module most likely to use it.

**leads module** (`application/modules/leads`): `project_leads` — capture and list leads for a project; `master_source`, `master_source_type` — populate the "how did you hear about us" dropdown when creating a lead; `master_project_name`, `project_listings` — supply the project picker.

**franchaiseleads module**: `tbl_cp_leads`, `tbl_cp_leads_status_history`, `tbl_cp_lead_history_dropout_reasons`, `tbl_channel_partner` — parallel lead pipeline for channel-partner-sourced leads; `franchise`, `master_franchise_type/tier/class` — franchise identity and classification.

**home module** (dashboard/overview): `tbl_lead_status_history`, `tbl_cp_leads_status_history` — feed "completed today," "scheduled," "activity feed" widgets; `tbl_module_statustype_mapping` — determines which next-status options to show; `master_dropout_reasons` — populates dropout reason dropdown; `user_responses` — franchise activity/visit logging.

**leadflow module**: `tbl_lead_status_history`, `tbl_cp_leads_status_history`, `master_statustype`, `master_dropout_reasons`, `master_modules`, `master_sub_module`, `tbl_module_statustype_mapping` — this module is almost entirely the status-transition workflow engine (moving a lead from one stage to the next, validating that the transition is allowed, and recording history).

**login module**: `users`, `registration`, `user_otps`, `password_reset_tokens`, `master_role`, `role_permissions_mapping`, `master_permissions`, `tbl_city_office_sales_executive`, `tbl_team_leaders`, `franchise`, `tbl_channel_partner` — authentication can originate from several different staff tables, unified logically by `users`/`role_id`.

**Project/listing catalogue** (used across modules, likely a separate admin/API area not in the 6 CI modules read): `builders`, `builder_locations`, `master_project_name`, `project_listings` and all its mapping tables (`project_listing_units`, `_gallery`, `_amenities_mapping`, `_banks_mapping`, `_special_features_mapping`, `_specifications_mapping`, `_video_links`, `_approval_status_history`, `_furnished_mapping`), plus every `master_property_*`, `master_bhk_sizes`, `master_villa_types`, `master_farm_house_types`, `master_possession_status`, `master_community_types`, `master_amenities(+header)`, `master_special_features(+header)`, `master_specifications(+header)`, `master_banks`, `master_gallery_headers`, `master_listing_type`, `master_saleable_area_representation`, `master_registration_gst_prices`, `master_approval_authority`, `master_approval_status`, `allocate_amenities`, `master_allocate_features`, `project_google_map_attributes` — this whole cluster exists to power a detailed property-listing website (similar to 99acres/MagicBricks) that leads are generated from.

**Sales organization** (used by login/home/leadflow for assignment & scoping): `tbl_city_office`, `tbl_city_office_sales_executive`, `tbl_team_leaders`, `tbl_users_projects_mapping`, `tbl_user_location_mapping` — model the internal sales org chart and control which leads/projects each user can see.

**Public marketing site** (likely served by a separate front-end, not the 6 CRM modules): `cms_pages`, `website_banners`, `master_blogs`, `careers`, `job_applications`, `form_responses`, `user_enquiries`, `user_feedback`, `user_feedbacks`, `our_offices` — standard corporate-website content tables.

**Subscriptions/monetization**: `package_listings`, `purchased_packages` — likely gate how many listings a builder/partner can publish based on what they paid for.

**Platform infrastructure** (Laravel API layer, not directly CodeIgniter): `oauth_clients`, `oauth_access_tokens`, `oauth_auth_codes`, `oauth_refresh_tokens`, `oauth_personal_access_clients`, `personal_access_tokens`, `migrations`, `failed_jobs`, `deleted_logs` — support a token-based API and background job processing that likely powers a mobile app or external integrations.

---

## 11. Database Flow

End-to-end flow through the system, reconstructed from the actual tables and their columns:

```
1. LEAD CAPTURE
   Website visitor / CP referral / walk-in
        → project_leads (or tbl_cp_leads)  [source_id, project_id, FranchiseId set]

2. ASSIGNMENT
   Lead is scoped to a user via tbl_users_projects_mapping / tbl_user_location_mapping
   and worked by a tbl_city_office_sales_executive (or franchise)

3. LEAD FLOW / ACTIVITY (leadflow module)
   Every call/visit/follow-up creates a row in tbl_lead_status_history
        CompletedStatus (what just happened) + FutureStatus (what's planned next)
        validated against tbl_module_statustype_mapping (legal transitions)

4. DROPOUT (if lost)
   Reason recorded via master_dropout_reasons
        → tbl_lead_status_history_dropout_reasons (extra detail)
        DeletedStatus / status columns updated to reflect loss

5. CONVERSION / DEAL CLOSE (deal module)
   Lead reaches a terminal "closed/won" status in master_statustype
   (no dedicated "deals" table exists in this schema — the deal module
   appears to operate purely on project_leads + tbl_lead_status_history,
   treating "deal closed" as just another status value)

6. POST-SALE
   No dedicated post-sale/commission tables were found in this dump —
   the schema stops at deal closure.
```

Supporting flows running in parallel:

```
CONTENT/MARKETING FLOW
cms_pages / master_blogs / website_banners → drives site visitors →
form_responses / user_enquiries → manually triaged into project_leads

RECRUITMENT FLOW (unrelated to sales, same DB)
careers → job_applications

SUBSCRIPTION FLOW
package_listings → purchased_packages → controls how many
project_listings a builder/partner may publish
```

---

## 12. Data Types

Every distinct MySQL data type actually used in this schema, confirmed by scanning the `CREATE TABLE` statements:

| Type | Used for | Why | Example from this schema |
|---|---|---|---|
| `int` / `int UNSIGNED` | IDs, counts, small numeric flags | Whole numbers, 4 bytes, fast to index; `UNSIGNED` when negative values are impossible (e.g. counts) | `project_leads.id`, `careers.id` |
| `bigint` / `bigint UNSIGNED` | IDs on newer tables, especially where high row-volume is expected | Larger range than `int` for tables expected to grow very large (e.g. OAuth tokens, audit tables) | `oauth_access_tokens.user_id`, `deleted_logs.id` |
| `tinyint(1)` | Boolean-style flags | Common MySQL convention for true/false (0/1) | `oauth_clients.revoked` |
| `varchar(n)` | Short text with a known max length (names, emails, codes, phone numbers) | Stores only as much space as needed (variable length), with a hard cap to prevent abuse | `users.email varchar(255)`, `master_country.country_code varchar(2)` |
| `char(36)` | Fixed-length UUID strings | Every UUID is always exactly 36 characters, so a fixed-length type is slightly more efficient than varchar | `oauth_clients.id` |
| `text` | Medium free-form text (descriptions, comments, addresses) | No practical length limit needed, but not as large as `longtext` | `master_amenities.description`, `tbl_lead_status_history.Comments` |
| `tinytext` | Very short free text | Slightly more compact than `text` for tiny notes | `master_registration_gst_prices.description` |
| `longtext` | Very large text/JSON-as-string blobs | Needed for storing large JSON payloads or long HTML content | `franchise.franchise_description`, `project_google_map_attributes.data` |
| `json` | Structured JSON data with MySQL-native JSON validation/functions | Guarantees the stored value is syntactically valid JSON and allows JSON path queries | `deleted_logs.data` |
| `enum(...)` | Small fixed set of allowed text values | Self-documenting and enforces validity at the DB level without a lookup table (a lightweight alternative to a master table) | `master_amenities.amenities_status ENUM('A','I')`, `project_listings.isSale ENUM('1','0')` |
| `decimal(10,2)` | Exact monetary/percentage values | Unlike `float`/`double`, `decimal` avoids floating-point rounding errors — essential for money/percentages | `master_registration_gst_prices.gst_percentage` |
| `date` | Calendar date only, no time | When time-of-day is irrelevant | `tbl_channel_partner.date_of_birth`, `tbl_lead_status_history.FutureStatusDate` |
| `time` | Time of day only, no date | Recurring daily windows | `project_listings.contact_timing_from/to` |
| `datetime` | Date + time, not tied to a timezone/auto-update | General timestamps set explicitly by the app | `project_leads.CreatedDate`, `master_amenities.created_date` |
| `timestamp` | Date + time, often with `DEFAULT CURRENT_TIMESTAMP` / `ON UPDATE CURRENT_TIMESTAMP` auto-behaviour | Used where MySQL should auto-populate the value on insert/update without the app having to send it | `franchise.created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, `oauth_access_tokens.created_at` |

*Data-type inconsistency observed:* several logically-numeric or logically-datetime columns are stored as `varchar`/`text` instead of a proper numeric/date type — e.g. `project_listing_units.base_price varchar(10)`, `master_modules.created_date varchar(100)`, `project_leads.created_at text`, `tbl_users_projects_mapping.user_id varchar(255)`. This is flagged again in §16 (Performance) and §20 (Best Practices) because it prevents MySQL from doing correct numeric/date comparisons, sorting, and indexing on those columns.

---

## 13. SQL Concepts

Each core SQL concept demonstrated with real tables/columns from this schema.

```sql
-- SELECT: retrieve columns
SELECT customer_name, mobile_number FROM project_leads;

-- INSERT: add a row
INSERT INTO master_dropout_reasons (dropout_reason, status) VALUES ('Budget mismatch', 'A');

-- UPDATE: modify existing rows
UPDATE project_leads SET CompletedStatus = 5 WHERE id = 101;

-- DELETE: remove rows
DELETE FROM user_otps WHERE expires_at < NOW();

-- WHERE: filter rows
SELECT * FROM franchise WHERE status = 'A';

-- GROUP BY: aggregate rows into buckets
SELECT project_id, COUNT(*) AS lead_count
FROM project_leads
GROUP BY project_id;

-- ORDER BY: sort results
SELECT id, customer_name, CreatedDate FROM project_leads ORDER BY CreatedDate DESC;

-- LIMIT: cap the number of rows returned
SELECT * FROM project_leads ORDER BY CreatedDate DESC LIMIT 10;

-- HAVING: filter after aggregation (WHERE can't reference aggregate results)
SELECT project_id, COUNT(*) AS lead_count
FROM project_leads
GROUP BY project_id
HAVING COUNT(*) > 50;

-- LIKE: pattern-match text
SELECT * FROM project_leads WHERE customer_name LIKE 'Ani%';   -- starts with "Ani"

-- IN: match against a list of values
SELECT * FROM project_leads WHERE CompletedStatus IN (1, 2, 3);

-- BETWEEN: range filter
SELECT * FROM project_leads WHERE CreatedDate BETWEEN '2024-01-01' AND '2024-06-30';

-- DISTINCT: remove duplicate rows
SELECT DISTINCT city_code FROM master_project_name;

-- COUNT: count matching rows
SELECT COUNT(*) FROM project_leads WHERE DeletedStatus = 'No';

-- SUM: total a numeric column (note: base_price is varchar here, so a real query
-- would need CAST(base_price AS DECIMAL) — see §16)
SELECT SUM(CAST(base_price AS DECIMAL(12,2))) FROM project_listing_units WHERE project_listing_id = 10;

-- AVG: average value
SELECT AVG(CAST(base_price AS DECIMAL(12,2))) FROM project_listing_units;

-- MAX / MIN: highest / lowest value
SELECT MAX(CreatedDate) AS latest_lead, MIN(CreatedDate) AS earliest_lead FROM project_leads;
```

---

## 14. Joins

```
project_leads                         master_project_name
┌────┬───────────┬────────────┐       ┌────┬───────────────┐
│ id │ project_id│ customer   │       │ id │ name          │
├────┼───────────┼────────────┤       ├────┼───────────────┤
│101 │     1     │ Anita Rao  │───┐   │ 1  │ Green Meadows │
│102 │     2     │ Kiran Reddy│   └──►│ 2  │ Skyline Hts   │
│103 │     9     │ Old Lead   │       └────┴───────────────┘
└────┴───────────┴────────────┘        (project_id 9 doesn't exist here)
```

### INNER JOIN — only rows that match in both tables
```sql
SELECT pl.customer_name, mp.name AS project_name
FROM project_leads pl
INNER JOIN master_project_name mp ON pl.project_id = mp.id;
-- Lead 103 (project_id=9) is dropped because there's no matching project row
```

### LEFT JOIN — all rows from the left table, matched data from the right if it exists
```sql
SELECT pl.customer_name, mp.name AS project_name
FROM project_leads pl
LEFT JOIN master_project_name mp ON pl.project_id = mp.id;
-- Lead 103 is still returned, with project_name = NULL
```

### RIGHT JOIN — all rows from the right table, matched data from the left if it exists
```sql
SELECT mp.name AS project_name, pl.customer_name
FROM project_leads pl
RIGHT JOIN master_project_name mp ON pl.project_id = mp.id;
-- Every project is listed, even ones with zero leads (customer_name = NULL)
```

### CROSS JOIN — every combination of rows from both tables (no ON condition)
```sql
SELECT s.source_name, st.source_type
FROM master_source s
CROSS JOIN master_source_type st;
-- Useful for building a full "source x source type" reference matrix, not for normal data queries
```

### SELF JOIN — a table joined to itself
```sql
-- Find every lead that shares the same mobile number as another lead (possible duplicate)
SELECT a.id AS lead1_id, b.id AS lead2_id, a.mobile_number
FROM project_leads a
INNER JOIN project_leads b
  ON a.mobile_number = b.mobile_number AND a.id <> b.id;
```

### A real 3-table JOIN used in this schema (lead + status history + status label)
```sql
SELECT pl.customer_name, h.CreatedDate, st.status_type
FROM project_leads pl
INNER JOIN tbl_lead_status_history h ON h.LeadId = pl.id
INNER JOIN master_statustype st ON st.id = h.CompletedStatus
ORDER BY h.CreatedDate DESC;
```

---

## 15. Normalization

**1NF (First Normal Form)** — every column holds a single, atomic value (no repeating groups/lists in one cell), and every row is unique.
- *Mostly followed:* the vast majority of tables store one value per column.
- *Violation found:* `tbl_users_projects_mapping.project_ids varchar(255)` clearly stores a **comma-separated list of project IDs** in a single column (e.g. `"1,4,7"`), which breaks 1NF — you cannot efficiently query "which users have access to project 4" with a plain `WHERE`, and you cannot enforce that each ID is valid. This should be a separate junction table (`user_id`, `project_id`) with one row per pair.
- *Violation found:* `users.project_type_id varchar(255)` and `franchise.super_franchise_id varchar(255)` show similar signs of storing multiple/compound values in a single text column rather than a proper relation.

**2NF (Second Normal Form)** — must be in 1NF, and every non-key column must depend on the *whole* primary key (only relevant for tables with composite keys).
- Nearly every table in this schema uses a single-column surrogate key (`id`), so 2NF violations of the classic "partial dependency on part of a composite key" kind are largely **not applicable** here — there are no true composite primary keys in the dump.

**3NF (Third Normal Form)** — must be in 2NF, and no non-key column may depend on another non-key column (no "transitive dependencies").
- *Reasonably followed* in the master-data layer: cities reference states via `state_code` rather than repeating the state name; localities reference cities by code, etc.
- *Violation found:* `user_responses.franchiseName` duplicates data that is already derivable from `franchise_id → franchise.franchise_name` — a classic transitive dependency / denormalization. This may be an intentional performance trade-off (avoiding a join) but it does mean the two values can drift out of sync if `franchise.franchise_name` is later edited.
- *Violation found:* many `master_*_id` FK-by-convention columns coexist with free-text duplicates of the same information in the same table (e.g. `project_leads.comments` free text next to structured status columns; `franchise.franchise_tier varchar(255)` duplicating what should be an FK to `master_franchise_tier.id`, since `franchise.franchise_tier` is typed as text ('2') rather than referencing the tier table's surrogate key consistently).

**Overall assessment:** the schema is a **partially normalized, pragmatic web-app schema** — the master/lookup layer (`master_*`) is well normalized and reused everywhere, but the transactional tables (`project_leads`, `tbl_lead_status_history`, `franchise`, `users`) show typical real-world denormalization: some CSV-in-a-column fields, some redundant/copied text fields, and inconsistent typing of what should be numeric foreign keys. This is common in fast-moving CRM projects but does create maintenance risk as the app grows.

---

## 16. Performance

**Indexes present in the dump:**
- `PRIMARY KEY` on 100 of 102 tables (auto-indexed).
- Only **1** additional `UNIQUE KEY`: `failed_jobs_uuid_unique` on `failed_jobs.uuid`.
- Only **18** additional `ADD KEY` (secondary index) statements in the entire dump — meaning the vast majority of `*_id` foreign-key-by-convention columns (e.g. `project_leads.project_id`, `tbl_lead_status_history.LeadId`, `project_listing_units.project_listing_id`) have **no secondary index** at all.

**Why this matters:** every query that filters or joins on an un-indexed `*_id` column (e.g. `SELECT * FROM tbl_lead_status_history WHERE LeadId = 101`, which is exactly the kind of query the leadflow module runs constantly) forces MySQL to do a **full table scan**. Given `tbl_lead_status_history` is the single largest table in this dump (thousands of rows and growing with every lead touch-point), this is the single biggest performance risk in the schema.

**Recommended indexes to add** (based on how the app clearly queries the data):
```sql
ALTER TABLE tbl_lead_status_history ADD INDEX idx_leadid (LeadId);
ALTER TABLE tbl_lead_status_history ADD INDEX idx_projectid (ProjectId);
ALTER TABLE project_leads ADD INDEX idx_project_id (project_id);
ALTER TABLE project_leads ADD INDEX idx_franchise_id (FranchiseId);
ALTER TABLE project_listing_units ADD INDEX idx_listing_id (project_listing_id);
ALTER TABLE project_listing_gallery ADD INDEX idx_listing_id (project_listing_id);
ALTER TABLE project_listing_amenities_mapping ADD INDEX idx_listing_id (project_listing_id);
```

**Composite indexes:** when a query always filters on two columns together (e.g. "leads for project X that are not deleted"), a composite index on `(project_id, DeletedStatus)` is faster than two single-column indexes, because MySQL can satisfy the whole `WHERE` clause from one index lookup:
```sql
ALTER TABLE project_leads ADD INDEX idx_project_deleted (project_id, DeletedStatus);
```

**Avoiding duplicate data:** as noted in §15, columns like `user_responses.franchiseName` duplicate `franchise.franchise_name`. Where such denormalization is kept deliberately for read performance, it should be paired with application logic (or a trigger) that keeps the copy in sync — otherwise reports can silently show stale names.

**Other observed issues:**
- Monetary/numeric values stored as `varchar` (`project_listing_units.base_price`, etc.) prevent MySQL from using efficient numeric index range scans (`WHERE base_price BETWEEN ...`) and force `CAST()`s in every query.
- `latin1` vs `utf8mb4` charset split across the schema means joining an old table to a new table on a text column can require an implicit charset conversion, which silently disables index usage on that join.

**General best practices:**
- Always index columns used in `WHERE`, `JOIN ... ON`, and `ORDER BY`.
- Avoid `SELECT *` in application code — fetch only the columns you need (many tables here are 15-80 columns wide).
- Use `LIMIT` for paginated lists (the leads/leadflow list screens should never load an entire table at once).
- Periodically archive very old `tbl_lead_status_history` rows if the table grows unbounded, since history is rarely queried far into the past.

---

## 17. Security

**SQL Injection:** none of this documentation implies the app is safe from it — that depends entirely on how the CodeIgniter models build queries. CodeIgniter's Query Builder (`$this->db->where(...)`) parameterizes values automatically; **raw string-concatenated queries** (e.g. `"WHERE id = " . $_GET['id']`) must never be used. Always prefer parameter binding:
```php
$this->db->where('id', $this->input->get('id'));   // safe
// NEVER: $this->db->query("SELECT * FROM users WHERE id = " . $_GET['id']);  // unsafe
```

**Prepared statements:** the same idea in raw SQL/PDO — the query structure is sent to MySQL separately from the data values, so user input can never be interpreted as SQL syntax:
```sql
PREPARE stmt FROM 'SELECT * FROM project_leads WHERE mobile_number = ?';
SET @mobile = '9876543210';
EXECUTE stmt USING @mobile;
```

**Plaintext-looking password columns:** several tables (`franchise.password`, `tbl_city_office.password`, `tbl_channel_partner.password`, `users.password`) are plain `varchar(255)` — this is fine *as long as* the application always stores a strong hash (bcrypt/Argon2) rather than the raw password. There is no way to tell from the schema alone whether this is done correctly; it must be verified in the PHP code.

**User permissions (principle of least privilege):** the app's own database user (used in the CodeIgniter DB config) should only have the privileges it actually needs (`SELECT/INSERT/UPDATE/DELETE`) and never `DROP`/`GRANT`/`SUPER` in production. Separate credentials should exist for migrations/admin tasks vs. the live application.

**Backups:** with no foreign-key constraints and several soft-delete flags (`DeletedStatus`, `deleted_at`, `is_active`, etc.), regular full backups (`mysqldump` or managed snapshots) are essential — this very file (`unimakler_api.sql`) is itself a backup dump. Given `deleted_logs` exists specifically to capture deleted-row snapshots, it should be included in every backup and periodically archived, not treated as disposable.

**Transactions, rollback, commit:** whenever an operation touches multiple related tables (e.g. inserting a `project_leads` row **and** its first `tbl_lead_status_history` row), wrap both in a transaction so they either both succeed or both fail — otherwise a crash mid-operation leaves a lead with no history, or history pointing at a lead that doesn't exist (made worse by the lack of FK constraints):
```sql
START TRANSACTION;
INSERT INTO project_leads (customer_name, mobile_number, project_id, source_id, CreatedDate)
VALUES ('Anita Rao', '9876543210', 1, 2, NOW());
INSERT INTO tbl_lead_status_history (LeadId, ProjectId, CompletedStatus, CreatedBy, CreatedDate, Status)
VALUES (LAST_INSERT_ID(), 1, 1, 5, NOW(), 'A');
COMMIT;              -- both inserts are saved
-- ROLLBACK;         -- (use instead of COMMIT if something went wrong, to undo both)
```

---

## 18. Common Queries

```sql
-- 1. Find all leads for a specific project
SELECT id, customer_name, mobile_number, CreatedDate
FROM project_leads
WHERE project_id = 1;

-- 2. Find all "active" internal users
SELECT id, first_name, last_name, email
FROM users
WHERE user_status = 'A';

-- 3. Join leads with their latest status history entry
SELECT pl.id, pl.customer_name, h.CompletedStatus, h.CreatedDate
FROM project_leads pl
INNER JOIN tbl_lead_status_history h ON h.LeadId = pl.id
WHERE h.CreatedDate = (
    SELECT MAX(h2.CreatedDate) FROM tbl_lead_status_history h2 WHERE h2.LeadId = pl.id
);

-- 4. Count leads by status (pipeline funnel view)
SELECT st.status_type, COUNT(*) AS total_leads
FROM project_leads pl
INNER JOIN master_statustype st ON st.id = pl.CompletedStatus
GROUP BY st.status_type
ORDER BY total_leads DESC;

-- 5. Monthly lead report — new leads captured per month
SELECT DATE_FORMAT(CreatedDate, '%Y-%m') AS lead_month, COUNT(*) AS leads_count
FROM project_leads
GROUP BY DATE_FORMAT(CreatedDate, '%Y-%m')
ORDER BY lead_month DESC;

-- 6. Latest 10 leads (newest first)
SELECT id, customer_name, mobile_number, CreatedDate
FROM project_leads
ORDER BY CreatedDate DESC
LIMIT 10;

-- 7. Pagination — page 3 of leads, 20 per page
SELECT id, customer_name, mobile_number, CreatedDate
FROM project_leads
ORDER BY CreatedDate DESC
LIMIT 20 OFFSET 40;   -- page 3 = skip the first 2 pages (40 rows)

-- 8. Search leads by name or mobile number
SELECT id, customer_name, mobile_number
FROM project_leads
WHERE customer_name LIKE '%Anita%' OR mobile_number LIKE '%9876543210%';

-- 9. Filter listings by city, property type, and active status
SELECT id, propertyId, project_name_id
FROM project_listings
WHERE city_code = 'HYD' AND property_type_id = 1 AND is_active = 'A';

-- 10. Franchises and how many leads each currently owns
SELECT f.franchise_name, COUNT(pl.id) AS active_leads
FROM franchise f
LEFT JOIN project_leads pl ON pl.FranchiseId = f.franchise_id AND pl.DeletedStatus = 'No'
GROUP BY f.franchise_name
ORDER BY active_leads DESC;
```

Each of the above follows the same reading pattern: **`SELECT`** picks the columns you want → **`FROM`**/**`JOIN`** picks which table(s) to read → **`WHERE`** filters rows → **`GROUP BY`** buckets rows for aggregation → **`ORDER BY`** sorts the final result → **`LIMIT`/`OFFSET`** trims it to a page.

---

## 19. API Mapping

Based on reading the actual controllers in `application/modules/*/controllers/`:

| Controller (method) | Likely tables touched | What it does |
|---|---|---|
| `leads/controllers/Leads.php :: leads_insert()` | `project_leads` (write), `master_project_name`/`project_listings` (read, for validation) | Inserts a new lead captured from a public lead form |
| `leads/controllers/Leads.php :: checkDuplicateLeadsCount()` / `checkDuplicateLeadsData()` | `project_leads` (read) | Checks whether a mobile/email already has a lead for a project, to prevent duplicate submissions |
| `leads/controllers/Leads.php :: retrievesourcebysourcetype()` | `master_source`, `master_source_type` (read) | Populates the source dropdown filtered by source type |
| `leads/controllers/Leads.php :: getProjectsAjax()` | `master_project_name` / `project_listings` (read) | AJAX project search/autocomplete for the lead form |
| `franchaiseleads/controllers/Franchaiseleads.php :: leads_insert()` | `tbl_cp_leads` (write) | Same pattern as `Leads::leads_insert()` but for the franchise/channel-partner leads pipeline |
| `franchaiseleads/controllers/Franchaiseleads.php :: checkDuplicateLeadsCount/Data()` | `tbl_cp_leads` (read) | Duplicate-check equivalent for CP leads |
| `franchaiseleads/controllers/Franchaiseleads.php :: retrievecity()` | `master_cities` (read) | City dropdown for franchise lead forms |
| `home/controllers/Home.php :: index()` | `project_leads`, `tbl_lead_status_history` (read) | Dashboard landing page — likely today's lead counts/activity |
| `home/controllers/Home.php :: completed()` / `scheduled()` | `tbl_lead_status_history` (read, filtered by status/date) | "Completed today" and "scheduled" activity widgets |
| `home/controllers/Home.php :: projects()` | `master_project_name` / `project_listings` (read) | Project list for the dashboard/filter |
| `home/controllers/Home.php :: activity()` / `leadinfo()` / `leadtransition()` | `project_leads`, `tbl_lead_status_history` (read/write) | Shows a lead's detail and records a transition/activity entry |
| `home/controllers/Home.php :: noResponseInsert()` | `tbl_lead_status_history` (write) | Logs a "no response" outcome for a follow-up attempt |
| `home/controllers/Home.php :: franchisehome()` / `franchiseactivity()` / `franchiseleadinfo()` | `tbl_cp_leads`, `tbl_cp_leads_status_history`, `franchise` | Franchise-scoped versions of the same dashboard/activity screens |
| `home/controllers/Home.php :: noResponseFranchiseLeadInsert()` | `tbl_cp_leads_status_history` (write) | "No response" logging for CP leads |
| `home/controllers/Home.php :: leads_ajax_list()` | `project_leads` (read) | AJAX-paginated lead list grid |
| `home/controllers/Home.php :: insertNewLead()` / `insertWalkinNewLead()` | `project_leads` (write) | Manual/walk-in lead entry by staff |
| `leadflow/controllers/Leadflow.php :: getProjectLeads()` | `project_leads` (read, filtered by project) | Lists leads for a chosen project |
| `leadflow/controllers/Leadflow.php :: getLeadDetails()` | `project_leads`, `tbl_lead_status_history` (read) | Loads a single lead plus its history timeline |
| `leadflow/controllers/Leadflow.php :: insertLeadFlow()` | `tbl_lead_status_history` (write), `project_leads` (update status) | Core "record a status change" action — the heart of the pipeline |
| `leadflow/controllers/Leadflow.php :: nextActivity()` | `tbl_module_statustype_mapping` (read) | Determines the valid next statuses to offer the user |
| `leadflow/controllers/Leadflow.php :: getDropoutReasons()` | `master_dropout_reasons` (read) | Populates dropout-reason dropdown |
| `leadflow/controllers/Leadflow.php :: getCitiesArea()` | `master_cities`, `master_locality` (read) | Location dropdowns |
| `leadflow/controllers/Leadflow.php :: nextActivityFranchiseLead()` / `getFranchiseLeadDropoutReasons()` / `insertFranchiseLeadFlow()` | `tbl_cp_leads_status_history`, `master_dropout_reasons`, `tbl_module_statustype_mapping` | Franchise-lead equivalents of the above |
| `login/controllers/Login.php :: checkUser()` | `users` (read, credential check) | Authenticates a user (compares hashed password) |
| `login/controllers/Login.php :: crmst()` / `taskuaFun()` | `users`, `master_role`, `role_permissions_mapping` | Loads role/permission context after login |
| `login/controllers/Login.php :: getNoaccessUsers()` | `users`, `role_permissions_mapping` | Determines which users lack a given permission |
| `login/controllers/Login.php :: logout()` | (session only) | No table writes expected — clears session/cookie |
| `deal/controllers/Deal.php :: index()` | `project_leads`, `tbl_lead_status_history` (read) | Deal-stage dashboard (built on the same lead/status tables — no separate "deal" table exists) |
| `deal/controllers/Deal.php :: insertdealclose()` | `tbl_lead_status_history` (write, likely `project_leads` status update) | Marks a lead as closed/won by writing a terminal status entry |

*Note:* the `deal` module's small size (only `index()` and `insertdealclose()`) combined with the absence of any `deals`/`sales` table in the schema confirms that "closing a deal" in this system is modeled simply as **another status value** on the existing lead, not a separate business entity.

---

## 20. Best Practices

**Naming conventions actually observed (and their inconsistencies):**
- Most tables/columns use `snake_case` (`project_leads`, `created_by`), but a large subset — mostly the `tbl_*` and `master_statustype`/`tbl_lead_status_history` family — use `PascalCase` for columns (`LeadStatusID`, `CreatedBy`, `ModifiedDate`, `DeletedStatus`). Mixing conventions within one schema makes it harder to predict a column's exact spelling and increases typo bugs in application code.
- Primary keys are usually `id`, but several tables use a domain-specific name (`franchise_id`, `module_id`, `LeadStatusID`, `DropOutId`, `MappingID`) — functionally fine, but inconsistent, and it means generic ORM/model code can't always assume `id` is the PK column.
- Table prefixes are inconsistent: `master_*` for lookup tables and `tbl_*` for some transactional tables, but many other transactional tables (`project_leads`, `franchise`, `users`, `registration`) have **no prefix at all**. A single consistent prefixing scheme (or none) would be easier to reason about.
- FK-by-convention columns mostly end in `_id` (`project_id`, `builder_id`) but several don't (`LeadId`, `FranchiseId`, `channel_partner_id` vs `franchise_id` for the same underlying concept in different tables).

**Soft delete vs hard delete:** the schema **prefers soft delete**, implemented three different ways depending on the table's era:
- A dedicated `DeletedStatus`/`deleted_status` enum column (`project_leads.DeletedStatus ENUM('Yes','No')`, `franchise.deleted_status ENUM('A','I')`, `tbl_lead_status_history.DeletedStatus ENUM('A','I')`).
- Reusing the general `status`/`*_status` active flag as the delete flag (most `master_*` tables — setting status to `'I'` effectively "removes" the row from dropdowns).
- A true `deleted_at` timestamp column (`franchise.deleted_at`, `deleted_logs.deleted_at`) — the most conventional soft-delete pattern, but only used in 1-2 tables.
- No table in this dump appears to rely purely on hard `DELETE` for business data; hard deletes seem reserved for token/OTP-style transient tables (`user_otps`, `oauth_access_tokens`).
- **Inconsistency risk:** because three different soft-delete conventions coexist, a developer must check each table individually rather than relying on one universal rule — a good candidate for standardization.

**Audit columns:** almost every table carries a `created_by`/`created_date(or _at)`/`updated_by`/`updated_date(or _at)`/`created_ip`/`updated_ip` sextet — a solid, consistently-applied convention overall, even though the underlying data *types* of these columns are inconsistent (`datetime` vs `timestamp` vs `varchar` vs `text` for what should always be a date/time — see §12).

**Transactions & error handling (recommendations for the application layer, since the DB has no FK safety net):**
- Wrap any multi-table write (e.g. lead insert + first history row) in a transaction (see §17 example) so a partial failure never leaves orphaned data.
- Because there are no FK constraints, the application must validate that referenced IDs exist *before* inserting (e.g. confirm `project_id` exists in `master_project_name` before inserting into `project_leads`).
- Log failures centrally — the presence of `failed_jobs` and `deleted_logs` shows the team has already invested in this pattern; it should be extended consistently to all critical write paths.

---

## 21. Interview Questions

**Beginner**

1. **Q: What is the difference between a database and a table?**
   A: A database is the whole collection (e.g. `unimakler_api`); a table is one organized list within it (e.g. `project_leads`) — like a filing cabinet vs. one folder inside it.

2. **Q: What is a primary key, and can it be NULL?**
   A: A column that uniquely identifies every row (e.g. `users.id`). It can never be NULL, because then it couldn't guarantee uniqueness or let other rows reliably reference it.

3. **Q: What does `NOT NULL` mean, and can you give an example from this schema?**
   A: It forces a column to always have a value. `project_leads.customer_name` is `NOT NULL` — you cannot save a lead without a name.

4. **Q: What is `AUTO_INCREMENT` used for?**
   A: It lets MySQL generate the next unique number automatically, so the app never has to compute IDs itself — e.g. every table's `id` column in this schema.

5. **Q: What SQL keyword do you use to filter rows?**
   A: `WHERE`, e.g. `SELECT * FROM franchise WHERE status = 'A'`.

6. **Q: What is the difference between `WHERE` and `HAVING`?**
   A: `WHERE` filters individual rows before grouping; `HAVING` filters *after* `GROUP BY`, so it can reference aggregate functions like `COUNT()`.

**Intermediate**

7. **Q: What is a foreign key, and does this schema use them?**
   A: A column referencing another table's primary key. Interestingly, this schema has **zero database-enforced foreign keys** — every relationship (e.g. `project_leads.project_id → master_project_name.id`) is implied by naming only and enforced in PHP code, not by MySQL.

8. **Q: What's the difference between `INNER JOIN` and `LEFT JOIN`?**
   A: `INNER JOIN` returns only rows that match in both tables; `LEFT JOIN` returns every row from the left table regardless of a match, filling unmatched right-side columns with NULL. Example: joining `project_leads` to `master_project_name` with `LEFT JOIN` would still show a lead even if its `project_id` doesn't exist in the projects table.

9. **Q: Why might a column be `varchar` instead of `int` even though it holds numbers?**
   A: Usually a design mistake or historical baggage — this schema has examples like `project_listing_units.base_price varchar(10)`, which prevents correct numeric sorting/filtering and requires `CAST()` in every query.

10. **Q: What is an index, and why does it matter for `tbl_lead_status_history`?**
    A: An index is a fast lookup structure. `tbl_lead_status_history` is queried constantly by `LeadId`, but that column has **no index** in this dump, meaning every such query does a full table scan — a real performance risk as the table grows.

11. **Q: What's the difference between `DELETE` and a soft delete?**
    A: `DELETE` permanently removes the row; a soft delete just flags it (e.g. `DeletedStatus = 'Yes'`) so it's hidden from normal queries but still recoverable. This schema uses soft delete almost everywhere for business data.

12. **Q: What does `DEFAULT CURRENT_TIMESTAMP` do?**
    A: MySQL automatically fills that column with the current date/time if the app doesn't supply one — used throughout this schema's audit columns like `franchise.created_date`.

**Advanced**

13. **Q: What normalization issues can you spot in this schema?**
    A: `tbl_users_projects_mapping.project_ids` stores a comma-separated list of IDs in one column (violates 1NF); `user_responses.franchiseName` duplicates data derivable from a join to `franchise` (a 3NF/transitive-dependency smell).

14. **Q: Why is it risky to have no foreign key constraints, and what's the trade-off?**
    A: Risk: orphaned rows (a lead pointing to a deleted project), harder-to-catch bugs, no automatic cascading. Trade-off: slightly faster writes (no constraint-checking) and more flexibility during rapid schema evolution — common in early-stage or fast-moving CRM projects.

15. **Q: How would you design a composite index for "find active leads for a project," and why is it faster than two separate indexes?**
    A: `ALTER TABLE project_leads ADD INDEX idx_project_deleted (project_id, DeletedStatus);` — a composite index lets MySQL satisfy both filter conditions from a single index scan, whereas two separate single-column indexes would require MySQL to intersect two index scans (slower, and MySQL often only uses one of them anyway).

16. **Q: What's the difference between `ENUM` and a lookup/master table for representing status?**
    A: `ENUM('A','I')` is compact and self-validating but requires an `ALTER TABLE` to add a new value and can't carry extra metadata (icon, description). A master table like `master_statustype` is more flexible (new statuses added via `INSERT`, can carry icons/module scoping) but requires a join to read the label — this schema actually uses *both* patterns for different needs (simple active/inactive = ENUM; rich, evolving lead-pipeline statuses = master table).

17. **Q: What is a transaction, and where would you use one in this schema?**
    A: A transaction groups multiple statements so they succeed or fail together. It should wrap the "insert a lead + insert its first status history row" sequence in `leadflow/Leadflow.php::insertLeadFlow()`, since without database-level FK protection a partial failure here would leave inconsistent data.

18. **Q: What does `ON UPDATE CURRENT_TIMESTAMP` do, and where is it used here?**
    A: It automatically refreshes a `timestamp` column to "now" every time the row is updated, without the app needing to set it. Used on `franchise.updated_date` and `project_google_map_attributes.updated_date`.

19. **Q: Why might a table like `user_feedbacks` having no primary key be a problem?**
    A: Without a PK, individual rows can't be reliably targeted by `UPDATE`/`DELETE ... WHERE id = ?`, row-based replication is less reliable, and no other table can cleanly reference a specific feedback entry via a foreign key.

20. **Q: How would you find duplicate leads (same mobile number) using SQL?**
    A: A self-join or `GROUP BY ... HAVING COUNT(*) > 1`:
    ```sql
    SELECT mobile_number, COUNT(*) FROM project_leads GROUP BY mobile_number HAVING COUNT(*) > 1;
    ```

---

## 22. Summary

**Key learnings from this schema:**
- Unimakler is a real-estate lead-to-deal CRM built on CodeIgniter 3 HMVC, backed by a 102-table MySQL database (`unimakler_api`) that also carries a full public-website content layer and a Laravel OAuth/queue subsystem.
- The database has **no enforced foreign keys anywhere** — all 30+ relationships documented in §6 are convention-based only, meaning data integrity is entirely the application's responsibility.
- Indexing is sparse: only the primary keys and one `UNIQUE` key are indexed by default; the busiest tables (`tbl_lead_status_history`, `project_leads`) are missing indexes on the columns they're most often filtered by.
- The schema mixes two naming conventions (`snake_case` and `PascalCase`), two charsets (`latin1` and `utf8mb4`), and several ad-hoc soft-delete patterns — signs of organic growth over time rather than a single up-front design.
- "Deal closing" has no dedicated table; it is modeled as a status value inside the same lead-tracking tables used for the whole pipeline.

**Common beginner mistakes to avoid (illustrated by this schema):**
- Storing numbers or dates as `varchar`/`text` "just to be safe" — it breaks sorting, filtering, and math, and this schema shows several real examples of the pain that causes.
- Skipping indexes on foreign-key-by-convention columns, assuming a small table will always stay small.
- Storing multiple values in one column (comma-separated IDs) instead of a proper junction table.
- Relying only on application code for referential integrity without disciplined validation — one missed check anywhere in the codebase can create orphaned rows silently.
- Mixing multiple soft-delete conventions across a schema, which forces every developer to re-learn the "was this deleted?" rule per table.

**Tips for working with this database going forward:**
- When writing a new query, always check §6 for the *implied* relationship before assuming a `JOIN` is safe — validate the FK-by-convention column actually has non-orphaned data.
- Add missing indexes (see §16) before scaling traffic further, especially on `tbl_lead_status_history.LeadId` and `project_leads.project_id`.
- Prefer transactions for any multi-table write, since the database won't catch inconsistencies for you.
- When adding new tables, follow the existing `master_*`/lookup pattern (id, name, description, status, audit columns) for consistency, and use `snake_case` + proper `int`/`datetime` types rather than repeating the legacy `PascalCase`/`varchar-for-everything` pattern seen in older tables.

---

*Document generated from `unimakler_api.sql` (19,853 lines, 102 `CREATE TABLE` statements) and cross-referenced against `application/modules/{leads,deal,home,leadflow,login,franchaiseleads}/controllers/*.php`.*

