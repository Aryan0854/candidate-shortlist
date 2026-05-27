import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseExcelOrCsv } from '@/lib/excelParser';

function mapEmployeeDbToFrontend(row: any) {
  return {
    empNo: row.emp_no,
    employeeName: row.emp_name, // Map emp_name to employeeName as UI uses both
    empName: row.emp_name,
    grade: row.grade,
    cumulativeRating: row.cumulative_rating,
    appraisalRating: row.appraisal_rating,
    previousRmName: row.previous_rm_name,
    br: row.br,
    designation: row.designation,
    officialMailId: row.official_mail_id,
    phoneNumber: row.phone_number,
    businessUnit: row.business_unit,
    previousClient: row.previous_client,
    sbu: row.sbu,
    top3Skills: row.top_3_skills,
    ratingOutOf10ForTop3Skills: row.rating_out_of_10_for_top_3_skills,
    skillsCategory: row.skills_category,
    skillsBucket: row.skills_bucket,
    detailedSkills: row.detailed_skills,
    infiniteDoj: row.infinite_doj ? new Date(row.infinite_doj).toISOString().split('T')[0] : '',
    receivedDate: row.received_date ? new Date(row.received_date).toISOString().split('T')[0] : '',
    lwd: row.lwd,
    status: row.status,
    remarks: row.remarks,
    deployedExitMonth: row.deployed_exit_month,
    deployedExitDate1: row.deployed_exit_date1,
    deployedClient: row.deployed_client,
    reasonForMovementToCorpPool: row.reason_for_movement_to_corp_pool,
    currentLocation: row.current_location,
    preferredLocation: row.preferred_location,
    officeLocation: row.office_location,
    createdBy: row.created_by,
    createdDate: row.created_date,
    modifiedBy: row.modified_by,
    modifiedDate: row.modified_date
  };
}

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM pmo.employees ORDER BY created_date DESC');
    const mapped = result.rows.map(mapEmployeeDbToFrontend);
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching employee list:', error);
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
    const parseResult = await parseExcelOrCsv(buffer, file.name, 'EMPLOYEE', 'Raw Data');

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
      const empNo = record.empNo || record._primaryId;

      if (!empNo) {
        skipped++;
        errors.push('Missing Employee ID in row.');
        continue;
      }

      try {
        // Check if employee exists
        const checkExist = await query('SELECT emp_no FROM pmo.employees WHERE emp_no = $1', [empNo]);
        const exists = checkExist.rows.length > 0;

        // Clean and validate dates
        const infiniteDoj = record.infiniteDoj && !isNaN(Date.parse(record.infiniteDoj)) ? record.infiniteDoj : null;
        const receivedDate = record.receivedDate && !isNaN(Date.parse(record.receivedDate)) ? record.receivedDate : null;

        if (exists) {
          await query(
            `UPDATE pmo.employees SET 
              emp_name = $2, grade = $3, cumulative_rating = $4, appraisal_rating = $5,
              previous_rm_name = $6, br = $7, designation = $8, official_mail_id = $9,
              phone_number = $10, business_unit = $11, previous_client = $12, sbu = $13,
              top_3_skills = $14, rating_out_of_10_for_top_3_skills = $15, skills_category = $16,
              skills_bucket = $17, detailed_skills = $18, infinite_doj = $19, received_date = $20,
              lwd = $21, status = $22, remarks = $23, deployed_exit_month = $24,
              deployed_exit_date1 = $25, deployed_client = $26, reason_for_movement_to_corp_pool = $27,
              current_location = $28, preferred_location = $29, office_location = $30,
              modified_by = 'admin', modified_date = CURRENT_TIMESTAMP
            WHERE emp_no = $1`,
            [
              empNo,
              record.empName || record.employeeName || '',
              record.grade || '',
              record.cumulativeRating || '',
              record.appraisalRating || '',
              record.previousRmName || '',
              record.br || '',
              record.designation || '',
              record.officialMailId || '',
              record.phoneNumber || '',
              record.businessUnit || '',
              record.previousClient || '',
              record.sbu || '',
              record.top3Skills || '',
              record.ratingOutOf10ForTop3Skills || '',
              record.skillsCategory || '',
              record.skillsBucket || '',
              record.detailedSkills || '',
              infiniteDoj,
              receivedDate,
              record.lwd || '',
              record.status || '',
              record.remarks || '',
              record.deployedExitMonth || '',
              record.deployedExitDate1 || '',
              record.deployedClient || '',
              record.reasonForMovementToCorpPool || '',
              record.currentLocation || '',
              record.preferredLocation || '',
              record.officeLocation || ''
            ]
          );
        } else {
          await query(
            `INSERT INTO pmo.employees (
              emp_no, emp_name, grade, cumulative_rating, appraisal_rating,
              previous_rm_name, br, designation, official_mail_id, phone_number,
              business_unit, previous_client, sbu, top_3_skills, rating_out_of_10_for_top_3_skills,
              skills_category, skills_bucket, detailed_skills, infinite_doj, received_date,
              lwd, status, remarks, deployed_exit_month, deployed_exit_date1,
              deployed_client, reason_for_movement_to_corp_pool, current_location,
              preferred_location, office_location, created_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, 'admin'
            )`,
            [
              empNo,
              record.empName || record.employeeName || '',
              record.grade || '',
              record.cumulativeRating || '',
              record.appraisalRating || '',
              record.previousRmName || '',
              record.br || '',
              record.designation || '',
              record.officialMailId || null, // Mail must be unique, so null is better if blank
              record.phoneNumber || '',
              record.businessUnit || '',
              record.previousClient || '',
              record.sbu || '',
              record.top3Skills || '',
              record.ratingOutOf10ForTop3Skills || '',
              record.skillsCategory || '',
              record.skillsBucket || '',
              record.detailedSkills || '',
              infiniteDoj,
              receivedDate,
              record.lwd || '',
              record.status || '',
              record.remarks || '',
              record.deployedExitMonth || '',
              record.deployedExitDate1 || '',
              record.deployedClient || '',
              record.reasonForMovementToCorpPool || '',
              record.currentLocation || '',
              record.preferredLocation || '',
              record.officeLocation || ''
            ]
          );
        }

        uploaded++;
      } catch (err: any) {
        skipped++;
        errors.push(`Row empNo=${empNo}: ${err.message}`);
      }
    }

    return NextResponse.json({
      status: 'done',
      uploaded,
      skipped,
      errors
    });

  } catch (error: any) {
    console.error('Error uploading employee pool:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
