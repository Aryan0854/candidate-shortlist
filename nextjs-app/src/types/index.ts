export interface BrData {
  autoReqId: string;
  currentReqStatus: string;
  grade: string;
  designation: string;
  recruiter: string;
  departmentType: string;
  bu: string;
  clientInterview: string;
  mandatorySkills: string;
  entity: string;
  clientName: string;
  billingType: string;
  project: string;
  requesterId: string;
  tagManager: string;
  rmName: string;
  jobDescription: string;
  joiningLocation: string;
  backfillForEmployeeName: string;
  dateApproved: string;
  noOfPositions: number;
  positionsRemaining: number;
  sourcingType: string;
  requirementType: string;
  stBillRate: number;
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface Employee {
  empNo: string;
  empName: string;
  grade: string;
  cumulativeRating: string;
  appraisalRating: string;
  previousRmName: string;
  br: string;
  designation: string;
  officialMailId: string;
  phoneNumber: string;
  businessUnit: string;
  previousClient: string;
  sbu: string;
  top3Skills: string;
  ratingOutOf10ForTop3Skills: string;
  skillsCategory: string;
  skillsBucket: string;
  detailedSkills: string;
  infiniteDoj: string;
  receivedDate: string;
  lwd: string;
  status: string;
  remarks: string;
  deployedExitMonth: string;
  deployedExitDate1: string;
  deployedClient: string;
  reasonForMovementToCorpPool: string;
  currentLocation: string;
  preferredLocation: string;
  officeLocation: string;
}

export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CandidateProfileDocument {
  candidateProfileDocumentId: number;
  empNo: string;
  fileName: string;
  uploadLocation: string;
  uploadedBy: string;
  uploadDate: string;
}

export interface HeaderFieldMapping {
  id: number;
  entityName: string;
  headerName: string;
  entityFieldName: string;
  active: boolean;
}
