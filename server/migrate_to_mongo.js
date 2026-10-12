const { MongoClient } = require('mongodb');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://campusiq_admin:campusiq2026@cluster0.rg2huy4.mongodb.net/?appName=Cluster0';

async function migrate() {
  console.log('Connecting to SQLite local database...');
  const dbPath = path.join(__dirname, 'campusiq.db');
  let sqliteDb;
  try {
    const Database = require('better-sqlite3');
    sqliteDb = new Database(dbPath);
  } catch (e) {
    sqliteDb = new DatabaseSync(dbPath);
  }

  console.log('Reading records from SQLite...');
  const query = `
    SELECT 
      s.id, s.student_id, s.name, s.email, s.department, s.academic_year, s.semester, s.section,
      a.cgpa, a.internal_marks, a.previous_internal_marks, a.backlogs,
      att.attendance_percentage, att.previous_attendance,
      l.login_frequency, l.assignment_completion, l.previous_assignment_completion, l.overdue_assignments, l.learning_activity_hours,
      p.aptitude_score, p.coding_score, p.previous_coding_score, p.mock_interview_score, p.communication_score, p.resume_readiness, p.placed_outcome,
      e.event_participation, e.hackathons, e.certifications, e.club_involvement
    FROM students s
    LEFT JOIN academic_records a ON s.student_id = a.student_id
    LEFT JOIN attendance_records att ON s.student_id = att.student_id
    LEFT JOIN lms_records l ON s.student_id = l.student_id
    LEFT JOIN placement_records p ON s.student_id = p.student_id
    LEFT JOIN engagement_records e ON s.student_id = e.student_id
  `;
  const students = sqliteDb.prepare(query).all();
  console.log(`Found ${students.length} students in SQLite.`);

  const interventions = sqliteDb.prepare('SELECT * FROM interventions').all();
  console.log(`Found ${interventions.length} interventions in SQLite.`);

  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('campusiq');

  const studentsColl = db.collection('students');
  const invColl = db.collection('interventions');

  console.log('Clearing existing collections in MongoDB Atlas...');
  await studentsColl.deleteMany({});
  await invColl.deleteMany({});

  console.log('Inserting students into MongoDB Atlas...');
  if (students.length > 0) {
    await studentsColl.insertMany(students);
  }

  console.log('Inserting interventions into MongoDB Atlas...');
  if (interventions.length > 0) {
    await invColl.insertMany(interventions);
  }

  // Create indexes for high performance
  await studentsColl.createIndex({ student_id: 1 }, { unique: true });
  await studentsColl.createIndex({ department: 1 });
  await studentsColl.createIndex({ academic_year: 1 });
  await invColl.createIndex({ student_id: 1 });

  const studentCount = await studentsColl.countDocuments();
  const invCount = await invColl.countDocuments();
  console.log(`\n========================================`);
  console.log(` MIGRATION TO MONGODB ATLAS SUCCESSFUL! `);
  console.log(` Total Students in MongoDB: ${studentCount}`);
  console.log(` Total Interventions in MongoDB: ${invCount}`);
  console.log(`========================================\n`);

  await client.close();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
