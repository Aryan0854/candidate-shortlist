import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function mapEmployeeDbToFrontend(row: any) {
  return {
    empNo: row.emp_no,
    employeeName: row.emp_name,
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

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ empNo: string }> }
) {
  try {
    const params = await props.params;
    const { empNo } = params;

    if (!empNo) {
      return NextResponse.json({ error: 'empNo parameter is required' }, { status: 400 });
    }

    const result = await query('SELECT * FROM pmo.employees WHERE emp_no = $1', [empNo]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: `Employee not found for ID: ${empNo}` }, { status: 404 });
    }

    const mapped = mapEmployeeDbToFrontend(result.rows[0]);
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching single employee:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
