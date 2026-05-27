import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    stBillRate: row.st_bill_rate ? parseFloat(row.st_bill_rate) : 0,
    createdBy: row.created_by,
    createdDate: row.created_date,
    modifiedBy: row.modified_by,
    modifiedDate: row.modified_date
  };
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ autoReqId: string }> }
) {
  try {
    const params = await props.params;
    const { autoReqId } = params;

    if (!autoReqId) {
      return NextResponse.json({ error: 'autoReqId parameter is required' }, { status: 400 });
    }

    const result = await query('SELECT * FROM pmo.br_data WHERE auto_req_id = $1', [autoReqId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: `BR Data not found for ID: ${autoReqId}` }, { status: 404 });
    }

    const mapped = mapBrDbToFrontend(result.rows[0]);
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error fetching single BR requirement:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ autoReqId: string }> }
) {
  try {
    const params = await props.params;
    const { autoReqId } = params;

    if (!autoReqId) {
      return NextResponse.json({ error: 'autoReqId parameter is required' }, { status: 400 });
    }

    // Delete record from DB
    const deleteResult = await query('DELETE FROM pmo.br_data WHERE auto_req_id = $1 RETURNING auto_req_id', [autoReqId]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: `Job requirement with autoReqId ${autoReqId} not found` }, { status: 404 });
    }

    return NextResponse.json({
      message: `Job requirement BR ID ${autoReqId} deleted successfully.`,
      deletedBrId: autoReqId
    });
  } catch (error: any) {
    console.error('Error deleting BR requirement:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
