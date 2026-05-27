import { query } from './db';
import { supabaseServer } from './supabaseServer';

export async function uploadDocumentLogic(file: File, empNo: string, uploadedBy: string = 'admin') {
  const fileName = file.name;
  const lower = fileName.toLowerCase();
  if (!(lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx'))) {
    throw new Error('Only PDF, DOC, and DOCX files are allowed.');
  }

  // Verify employee exists
  const empCheck = await query('SELECT emp_no FROM pmo.employees WHERE emp_no = $1', [empNo]);
  if (empCheck.rows.length === 0) {
    throw new Error(`Employee with empNo ${empNo} not found.`);
  }

  // Initialize storage bucket
  try {
    await supabaseServer.storage.createBucket('candidate-resumes', {
      public: false,
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    });
  } catch (err) {}

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${empNo}/${Date.now()}_${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseServer.storage
    .from('candidate-resumes')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload to storage: ${uploadError.message}`);
  }

  // Register in DB
  const insertResult = await query(
    `INSERT INTO pmo.candidate_profile_document (emp_no, file_name, upload_location, uploaded_by, upload_date)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     RETURNING candidate_profile_document_id`,
    [empNo, fileName, storagePath, uploadedBy]
  );

  return {
    message: `Candidate file ${fileName} uploaded. Added 1 new candidate.`,
    candidateProfileId: insertResult.rows[0].candidate_profile_document_id
  };
}

export async function getDocumentsLogic(empNo: string) {
  const result = await query(
    'SELECT candidate_profile_document_id, emp_no, file_name, upload_location, uploaded_by, upload_date FROM pmo.candidate_profile_document WHERE emp_no = $1',
    [empNo]
  );
  return result.rows.map(row => ({
    candidateProfileDocumentId: row.candidate_profile_document_id,
    empNo: row.emp_no,
    fileName: row.file_name,
    uploadLocation: row.upload_location,
    uploadedBy: row.uploaded_by,
    uploadDate: row.upload_date
  }));
}

export async function deleteDocumentsLogic(empNo: string) {
  // Find documents
  const docsResult = await query(
    'SELECT file_name, upload_location FROM pmo.candidate_profile_document WHERE emp_no = $1',
    [empNo]
  );

  let deletedFileName = 'Resume';
  if (docsResult.rows.length > 0) {
    deletedFileName = docsResult.rows[0].file_name;
  }

  // Delete from Supabase Storage
  const filePaths = docsResult.rows.map(row => row.upload_location);
  if (filePaths.length > 0) {
    const { error: deleteErr } = await supabaseServer.storage
      .from('candidate-resumes')
      .remove(filePaths);
    if (deleteErr) {
      console.warn('Storage deletion warning:', deleteErr);
    }
  }

  // Delete from DB
  await query('DELETE FROM pmo.candidate_profile_document WHERE emp_no = $1', [empNo]);

  return {
    message: `Resume **${deletedFileName}** deleted successfully for candidate ${empNo}.`,
    empNo
  };
}
