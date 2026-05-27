const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Simple helper to load .env.local manually since dotenv might not be installed
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL is not set in nextjs-app/.env.local");
  process.exit(1);
}

const SCHEMA_SQL = `
CREATE SCHEMA IF NOT EXISTS pmo;

CREATE TABLE IF NOT EXISTS pmo.br_data (
    auto_req_id                 VARCHAR(100) PRIMARY KEY,
    current_req_status          VARCHAR(100),
    grade                       VARCHAR(100),
    designation                 TEXT,
    recruiter                   TEXT,
    department_type             VARCHAR(100),
    bu                          VARCHAR(100),
    client_interview            TEXT,
    mandatory_skills            TEXT,
    entity                      VARCHAR(100),
    client_name                 TEXT,
    billing_type                VARCHAR(100),
    project                     TEXT,
    requester_id                VARCHAR(100),
    tag_manager                 TEXT,
    rm_name                     TEXT,
    job_description             TEXT,
    joining_location            VARCHAR(150),
    backfill_for_employee_name  VARCHAR(150),
    date_approved               TEXT,
    no_of_positions             INT,
    positions_remaining         INT,
    sourcing_type               VARCHAR(100),
    requirement_type            VARCHAR(100),
    st_bill_rate                NUMERIC(10,2),
    created_by                  VARCHAR(100),
    created_date                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by                 VARCHAR(100),
    modified_date               TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmo.employees (
    emp_no                             VARCHAR(30) PRIMARY KEY,
    emp_name                           VARCHAR(255),
    grade                              VARCHAR(50),
    cumulative_rating                  VARCHAR(50),
    appraisal_rating                   VARCHAR(50),
    previous_rm_name                   VARCHAR(255),
    br                                 VARCHAR(50),
    designation                        VARCHAR(200),
    official_mail_id                   VARCHAR(255) UNIQUE,
    phone_number                       VARCHAR(30),
    business_unit                      VARCHAR(200),
    previous_client                    VARCHAR(200),
    sbu                                VARCHAR(200),
    top_3_skills                       TEXT,
    rating_out_of_10_for_top_3_skills  TEXT,
    skills_category                    TEXT,
    skills_bucket                      TEXT,
    detailed_skills                    TEXT,
    infinite_doj                       DATE,
    received_date                      DATE,
    lwd                                TEXT,
    status                             VARCHAR(100),
    remarks                            TEXT,
    deployed_exit_month                VARCHAR(50),
    deployed_exit_date1                TEXT,
    deployed_client                    VARCHAR(255),
    reason_for_movement_to_corp_pool   TEXT,
    current_location                   VARCHAR(200),
    preferred_location                 VARCHAR(200),
    office_location                    VARCHAR(200),
    created_by                         VARCHAR(100),
    created_date                       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by                        VARCHAR(100),
    modified_date                      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmo.br_employee_match (
    auto_req_id VARCHAR(50) REFERENCES pmo.br_data(auto_req_id) ON DELETE CASCADE,
    emp_no VARCHAR(50) REFERENCES pmo.employees(emp_no) ON DELETE CASCADE,
    skill_name VARCHAR(255),
    match_percent FLOAT,
    PRIMARY KEY (auto_req_id, emp_no, skill_name)
);

CREATE TABLE IF NOT EXISTS pmo.br_skill_map (
    auto_req_id VARCHAR(50) REFERENCES pmo.br_data(auto_req_id) ON DELETE CASCADE,
    skill_name VARCHAR(255),
    preferred_flag CHAR(1),
    PRIMARY KEY (auto_req_id, skill_name)
);

CREATE TABLE IF NOT EXISTS pmo.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS pmo.temp_login_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(200) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    redirect_path VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS pmo.candidate_profile_document (
    candidate_profile_document_id SERIAL PRIMARY KEY,
    emp_no VARCHAR(30) REFERENCES pmo.employees(emp_no) ON DELETE CASCADE,
    file_name VARCHAR(255),
    upload_location VARCHAR(512),
    uploaded_by VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pmo.header_field_mapping (
    id                  BIGSERIAL PRIMARY KEY,
    entity_name          VARCHAR(50) NOT NULL,
    header_name          VARCHAR(200) NOT NULL,
    entity_field_name    VARCHAR(100) NOT NULL,
    active               BOOLEAN DEFAULT TRUE
);
`;

const SEED_SQL = `
-- Seed mappings for BR Data import
INSERT INTO pmo.header_field_mapping (entity_name, header_name, entity_field_name, active)
VALUES
('BR_DATA', 'Auto req ID', 'autoReqId', true),
('BR_DATA', 'Current Req Status', 'currentReqStatus', true),
('BR_DATA', 'Grade', 'grade', true),
('BR_DATA', 'Designation', 'designation', true),
('BR_DATA', 'Recruiter', 'recruiter', true),
('BR_DATA', 'Client Interview?', 'clientInterview', true),
('BR_DATA', 'Mandatory Skills', 'mandatorySkills', true),
('BR_DATA', 'Entity', 'entity', true),
('BR_DATA', 'Client Name', 'clientName', true),
('BR_DATA', 'Billing Type', 'billingType', true),
('BR_DATA', 'Project', 'project', true),
('BR_DATA', 'Requester ID', 'requesterId', true),
('BR_DATA', 'TAG Manager', 'tagManager', true),
('BR_DATA', 'RM Name', 'rmName', true),
('BR_DATA', 'Job description', 'jobDescription', true),
('BR_DATA', 'Joining Location', 'joiningLocation', true),
('BR_DATA', 'Backfill for Employee Name', 'backfillForEmployeeName', true),
('BR_DATA', 'Date Approved', 'dateApproved', true),
('BR_DATA', 'No. of Positions', 'noOfPositions', true),
('BR_DATA', 'Positions Remaining', 'positionsRemaining', true),
('BR_DATA', 'Sourcing Type', 'sourcingType', true),
('BR_DATA', 'Requirement Type', 'requirementType', true),
('BR_DATA', 'ST (Bill Rate) Enter only numeric value and 0 for Non-Billable', 'stBillRate', true)
ON CONFLICT DO NOTHING;

-- Seed mappings for Employee Pool import
INSERT INTO pmo.header_field_mapping (entity_name, header_name, entity_field_name, active)
VALUES
('EMPLOYEE', 'Emp No', 'empNo', true),
('EMPLOYEE', 'Emp Name', 'empName', true),
('EMPLOYEE', 'Grade', 'grade', true),
('EMPLOYEE', 'Cumulative Rating', 'cumulativeRating', true),
('EMPLOYEE', 'Appraisal Rating', 'appraisalRating', true),
('EMPLOYEE', 'Previous RM Name', 'previousRmName', true),
('EMPLOYEE', 'Designation', 'designation', true),
('EMPLOYEE', 'Official Mail ID', 'officialMailId', true),
('EMPLOYEE', 'Phone Number', 'phoneNumber', true),
('EMPLOYEE', 'Business Unit', 'businessUnit', true),
('EMPLOYEE', 'Client', 'previousClient', true),
('EMPLOYEE', 'BU', 'businessUnit', true),
('EMPLOYEE', 'SBU', 'businessUnit', true),
('EMPLOYEE', 'Top 3 Skills', 'top3Skills', true),
('EMPLOYEE', 'Rating out of 10 for Top 3 Skills', 'ratingOutOf10ForTop3Skills', true),
('EMPLOYEE', 'Skills Category', 'skillsCategory', true),
('EMPLOYEE', 'Skills Bucket', 'skillsBucket', true),
('EMPLOYEE', 'Detailed Skills', 'detailedSkills', true),
('EMPLOYEE', 'Infinite DOJ', 'infiniteDoj', true),
('EMPLOYEE', 'Received Date', 'receivedDate', true),
('EMPLOYEE', 'LWD', 'lwd', true),
('EMPLOYEE', 'Status', 'status', true),
('EMPLOYEE', 'Remarks', 'remarks', true),
('EMPLOYEE', 'Deployed/Exit Month', 'deployedExitMonth', true),
('EMPLOYEE', 'Deployed/Exit Date-1', 'deployedExitDate1', true),
('EMPLOYEE', 'Deployed Client', 'deployedClient', true),
('EMPLOYEE', 'Reason for Movement to Corp Pool', 'reasonForMovementToCorpPool', true),
('EMPLOYEE', 'Current Location', 'currentLocation', true),
('EMPLOYEE', 'Preferred Location', 'preferredLocation', true),
('EMPLOYEE', 'Office Location', 'officeLocation', true)
ON CONFLICT DO NOTHING;

-- Seed default admin user
INSERT INTO pmo.users (username, first_name, last_name, password, phone, email)
VALUES ('admin', 'System', 'Admin', 'admin', '1234567890', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;
`;

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting to Supabase Database...");
    await client.connect();
    console.log("Connected successfully. Running schema creation...");
    
    await client.query(SCHEMA_SQL);
    console.log("Schema and tables verified/created.");

    console.log("Running seed data insertion...");
    await client.query(SEED_SQL);
    console.log("Seed data applied successfully.");

    console.log("Database migration finished successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
