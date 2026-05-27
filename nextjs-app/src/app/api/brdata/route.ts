import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseExcelOrCsv } from '@/lib/excelParser';

// Map database snake_case keys to camelCase keys expected by React frontend
function mapBrDbToFrontend(row: any) {
  return {
    autoReqId: row.auto_req_id,
    currentReqStatus: row.current_req_status,
    grade: row.grade,
    designation: row.designation,
    recruiter: row.recruiter,
    departmentType: row.department_type,
    bu: row.bu,
    clientInterview: row.client_interview,
    mandatorySkills: row.mandatory_skills,
    entity: row.entity,
    clientName: row.client_name,
    billingType: row.billing_type,
    project: row.project,
    requesterId: row.requester_id,
    tagManager: row.tag_manager,
    rmName: row.rm_name,
    jobDescription: row.job_description,
    joiningLocation: row.joining_location,
    backfillForEmployeeName: row.backfill_for_employee_name,
    dateApproved: row.date_approved,
    noOfPositions: row.no_of_positions ? parseInt(row.no_of_positions, 10) : 0,
    positionsRemaining: row.positions_remaining ? parseInt(row.positions_remaining, 10) : 0,
    sourcingType: row.sourcing_type,
    requirementType: row.requirement_type,
    stBillRate: row.st_bill_rate ? parseFloat(row.st_bill_rate) : 0,
    createdBy: row.created_by,
    createdDate: row.created_date,
    modifiedBy: row.modified_by,
    modifiedDate: row.modified_date
  };
}

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM pmo.br_data ORDER BY created_date DESC');
    const mapped = result.rows.map(mapBrDbToFrontend);
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching BR data:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = await parseExcelOrCsv(buffer, file.name, 'BR_DATA', 'OFFSHORE');

    if (parseResult.errors.length > 0 && parseResult.records.length === 0) {
      return NextResponse.json({
        status: 'failed',
        message: parseResult.errors.join('; ')
      });
    }

    let uploaded = 0;
    let skipped = 0;
    const errors: string[] = [...parseResult.errors];

    for (const record of parseResult.records) {
      const autoReqId = record.autoReqId || record._primaryId;

      if (!autoReqId) {
        skipped++;
        errors.push('Missing Auto req ID in row.');
        continue;
      }

      try {
        // Check if requirement exists
        const checkExist = await query('SELECT auto_req_id FROM pmo.br_data WHERE auto_req_id = $1', [autoReqId]);
        const exists = checkExist.rows.length > 0;

        if (exists) {
          await query(
            `UPDATE pmo.br_data SET 
              current_req_status = $2, grade = $3, designation = $4, recruiter = $5,
              department_type = $6, bu = $7, client_interview = $8, mandatory_skills = $9,
              entity = $10, client_name = $11, billing_type = $12, project = $13,
              requester_id = $14, tag_manager = $15, rm_name = $16, job_description = $17,
              joining_location = $18, backfill_for_employee_name = $19, date_approved = $20,
              no_of_positions = $21, positions_remaining = $22, sourcing_type = $23,
              requirement_type = $24, st_bill_rate = $25, modified_by = 'admin', modified_date = CURRENT_TIMESTAMP
            WHERE auto_req_id = $1`,
            [
              autoReqId,
              record.currentReqStatus || '',
              record.grade || '',
              record.designation || '',
              record.recruiter || '',
              record.departmentType || '',
              record.bu || '',
              record.clientInterview || '',
              record.mandatorySkills || '',
              record.entity || '',
              record.clientName || '',
              record.billingType || '',
              record.project || '',
              record.requesterId || '',
              record.tagManager || '',
              record.rmName || '',
              record.jobDescription || '',
              record.joiningLocation || '',
              record.backfillForEmployeeName || '',
              record.dateApproved || '',
              record.noOfPositions ? parseInt(record.noOfPositions, 10) : 0,
              record.positionsRemaining ? parseInt(record.positionsRemaining, 10) : 0,
              record.sourcingType || '',
              record.requirementType || '',
              record.stBillRate ? parseFloat(record.stBillRate) : 0
            ]
          );
        } else {
          await query(
            `INSERT INTO pmo.br_data (
              auto_req_id, current_req_status, grade, designation, recruiter,
              department_type, bu, client_interview, mandatory_skills, entity,
              client_name, billing_type, project, requester_id, tag_manager,
              rm_name, job_description, joining_location, backfill_for_employee_name,
              date_approved, no_of_positions, positions_remaining, sourcing_type,
              requirement_type, st_bill_rate, created_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 'admin'
            )`,
            [
              autoReqId,
              record.currentReqStatus || '',
              record.grade || '',
              record.designation || '',
              record.recruiter || '',
              record.departmentType || '',
              record.bu || '',
              record.clientInterview || '',
              record.mandatorySkills || '',
              record.entity || '',
              record.clientName || '',
              record.billingType || '',
              record.project || '',
              record.requesterId || '',
              record.tagManager || '',
              record.rmName || '',
              record.jobDescription || '',
              record.joiningLocation || '',
              record.backfillForEmployeeName || '',
              record.dateApproved || '',
              record.noOfPositions ? parseInt(record.noOfPositions, 10) : 0,
              record.positionsRemaining ? parseInt(record.positionsRemaining, 10) : 0,
              record.sourcingType || '',
              record.requirementType || '',
              record.stBillRate ? parseFloat(record.stBillRate) : 0
            ]
          );
        }

        uploaded++;
      } catch (err: any) {
        skipped++;
        errors.push(`Row autoReqId=${autoReqId}: ${err.message}`);
      }
    }

    return NextResponse.json({
      status: 'done',
      uploaded,
      skipped,
      errors
    });

  } catch (error: any) {
    console.error('Error uploading BR data:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
