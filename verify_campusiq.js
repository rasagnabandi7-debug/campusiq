/**
 * CampusIQ End-to-End System Verification Suite
 * Tests mathematical scoring calculations, database integrity, and REST API endpoints.
 */
const TARGET_URL = (process.argv[2] || 'http://127.0.0.1:8000').replace(/\/+$/, '');

async function makeRequest(path, method = 'GET', body = null) {
  const url = TARGET_URL + path;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }
  return { status: res.status, body: data };
}

async function runVerification() {
  console.log('====================================================');
  console.log(' CampusIQ End-to-End System Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'API Health Check returns 200 OK & healthy');

    // 2. Dashboard Summary
    const summary = await makeRequest('/api/dashboard/summary');
    assert(summary.status === 200 && summary.body.total_students === 420, `Dashboard Summary reads 420 students (got: ${summary.body.total_students})`);
    assert(summary.body.average_success_score > 60, `Average success score calculated (${summary.body.average_success_score}/100)`);
    assert(summary.body.academic_risk_count > 0, `Academic risk flags active (${summary.body.academic_risk_count} students)`);
    assert(summary.body.placement_risk_count > 0, `Placement risk flags active (${summary.body.placement_risk_count} students)`);

    // 3. Early Warning Radar Alerts
    const alerts = await makeRequest('/api/alerts');
    assert(alerts.status === 200 && alerts.body.alerts.length > 0, `Early Warning Radar active (${alerts.body.total_alerts} prioritized cases)`);
    assert(alerts.body.critical_count > 0, `Critical urgency tier prioritized (${alerts.body.critical_count} critical)`);

    // 4. Student 360° Profile - Critical Student STU-1002
    const stu1002 = await makeRequest('/api/students/STU-1002');
    assert(stu1002.status === 200, 'Student 360 profile endpoint responds 200 OK');
    assert(stu1002.body.name === 'Rohan Verma', 'STU-1002 identity matched (Rohan Verma)');
    assert(stu1002.body.academic_risk_level === 'High', 'STU-1002 academic risk level evaluated as High');
    assert(stu1002.body.attendance.attendance_percentage === 54, 'STU-1002 attendance threshold flag triggered (54%)');
    assert(stu1002.body.academic.backlogs === 3, 'STU-1002 multiple backlogs detected (3)');

    // 5. Student 360° Profile - Placement Gap Student STU-1003
    const stu1003 = await makeRequest('/api/students/STU-1003');
    assert(stu1003.body.name === 'Ananya Patel', 'STU-1003 identity matched (Ananya Patel)');
    assert(stu1003.body.academic_risk_level === 'Low', 'STU-1003 academic risk is Low (CGPA 8.8)');
    assert(stu1003.body.placement_risk_level === 'High', 'STU-1003 placement risk is High (Coding 34)');
    assert(stu1003.body.segments.includes('Academic Achievers, Placement Unready'), 'STU-1003 classified into "Academic Achievers, Placement Unready" segment');

    // 6. Student Segments Catalog
    const segments = await makeRequest('/api/segments');
    assert(segments.status === 200 && segments.body.length === 5, '5 behavioral cohort segments returned');

    // 7. Interventions Management & Outcome Tracker
    const interventions = await makeRequest('/api/interventions');
    assert(interventions.status === 200 && interventions.body.length >= 6, `Intervention workflow active (${interventions.body.length} records)`);
    const completedOutcomes = interventions.body.filter(i => i.status === 'Completed' && i.observed_change);
    assert(completedOutcomes.length >= 2, `Empirical before-and-after outcome tracking verified (${completedOutcomes.length} turnarounds documented)`);

    // 8. CampusIQ Copilot Query
    const copilot = await makeRequest('/api/copilot/query', 'POST', { query: 'Which high-performing students have low placement readiness?' });
    assert(copilot.status === 200, 'Copilot analytics query returns 200 OK');
    assert(copilot.body.category === 'placement_gap', 'Copilot correctly routes query to placement gap analytics');
    assert(copilot.body.matched_students.length > 0, `Copilot surfaces matched students (${copilot.body.matched_students.length} referenced)`);

    // 9. Machine Learning Placement Model
    const ml = await makeRequest('/api/ml/model-info');
    assert(ml.status === 200 && ml.body.is_trained, 'Supervised Random Forest placement model active');
    assert(ml.body.metrics.accuracy >= 0.85, `Model test accuracy verified (${(ml.body.metrics.accuracy * 100).toFixed(1)}%)`);
    assert(ml.body.metrics.roc_auc >= 0.90, `Model ROC-AUC verified (${ml.body.metrics.roc_auc})`);

    console.log('\n----------------------------------------------------');
    console.log(`Results: ${passed}/${total} checks passed (${((passed/total)*100).toFixed(1)}%)`);
    if (passed === total) {
      console.log('Status: ALL VERIFICATION CHECKS PASSED PERFECTLY!');
    }
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('Verification error:', err.message);
  }
}

runVerification();
