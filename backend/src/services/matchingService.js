/**
 * Deterministic Matching Engine for ScholarNest
 * Calculates match scores strictly based on actual student profile and scholarship criteria.
 * Scoring breakdown:
 * - Academic: 25
 * - Income: 20
 * - Course: 20
 * - Location: 15
 * - Category: 10
 * - Other: 10
 * Total: 100
 */

export function calculateMatchScore(student = {}, scholarship = {}) {
  const breakdown = {
    academic: 0,
    income: 0,
    course: 0,
    location: 0,
    category: 0,
    other: 0,
  };

  const matchedRequirements = [];
  const missingRequirements = [];
  let isDisqualified = false;

  // 1. ACADEMIC EVALUATION (Max 25)
  const minCgpa = Number(scholarship.minimum_cgpa) || 0;
  const studentCgpa = Number(student.cgpa) || 0;
  const studentPercentage = Number(student.percentage) || 0;
  const effectiveCgpa = studentCgpa > 0 ? studentCgpa : (studentPercentage > 0 ? studentPercentage / 9.5 : 0);

  if (minCgpa === 0) {
    breakdown.academic = 25;
    matchedRequirements.push('No minimum CGPA required; all academic backgrounds qualify');
  } else if (effectiveCgpa > 0) {
    if (effectiveCgpa >= minCgpa) {
      breakdown.academic = 25;
      matchedRequirements.push(`Academic CGPA of ${effectiveCgpa.toFixed(2)} satisfies the required minimum of ${minCgpa.toFixed(2)}`);
    } else if (effectiveCgpa >= minCgpa - 0.5) {
      breakdown.academic = 15;
      missingRequirements.push(`CGPA is ${effectiveCgpa.toFixed(2)}, slightly below required ${minCgpa.toFixed(2)}`);
    } else {
      breakdown.academic = 5;
      missingRequirements.push(`CGPA of ${effectiveCgpa.toFixed(2)} does not meet the minimum requirement of ${minCgpa.toFixed(2)}`);
      isDisqualified = true;
    }
  } else {
    breakdown.academic = 12; // Incomplete profile academic score
    missingRequirements.push(`Academic score not specified in profile; scholarship requires minimum CGPA ${minCgpa.toFixed(2)}`);
  }

  // 2. INCOME EVALUATION (Max 20)
  const maxIncome = Number(scholarship.maximum_income) || 0;
  const studentIncome = Number(student.annual_family_income) || 0;

  if (maxIncome === 0) {
    breakdown.income = 20;
    matchedRequirements.push('No family income ceiling limit for this scholarship');
  } else if (studentIncome > 0) {
    if (studentIncome <= maxIncome) {
      breakdown.income = 20;
      matchedRequirements.push(`Family income of INR ${studentIncome.toLocaleString('en-IN')} is within the limit of INR ${maxIncome.toLocaleString('en-IN')}`);
    } else if (studentIncome <= maxIncome * 1.15) {
      breakdown.income = 8;
      missingRequirements.push(`Annual income of INR ${studentIncome.toLocaleString('en-IN')} is marginally above maximum limit of INR ${maxIncome.toLocaleString('en-IN')}`);
    } else {
      breakdown.income = 0;
      missingRequirements.push(`Annual income of INR ${studentIncome.toLocaleString('en-IN')} exceeds maximum allowed ceiling of INR ${maxIncome.toLocaleString('en-IN')}`);
      isDisqualified = true;
    }
  } else {
    breakdown.income = 10;
    missingRequirements.push(`Annual income not updated in profile; scholarship ceiling is INR ${maxIncome.toLocaleString('en-IN')}`);
  }

  // 3. COURSE ELIGIBILITY (Max 20)
  let eligibleCourses = [];
  try {
    eligibleCourses = Array.isArray(scholarship.course_eligibility)
      ? scholarship.course_eligibility
      : JSON.parse(scholarship.course_eligibility || '[]');
  } catch (e) {
    eligibleCourses = ['All'];
  }

  const isAllCourses = eligibleCourses.some(c => c.toLowerCase() === 'all' || c.toLowerCase() === 'any');
  const studentCourse = (student.course || '').trim().toLowerCase();
  const studentBranch = (student.branch || '').trim().toLowerCase();

  if (isAllCourses) {
    breakdown.course = 20;
    matchedRequirements.push('Open to all degree streams and courses');
  } else if (studentCourse) {
    const courseMatched = eligibleCourses.some(c => {
      const target = c.toLowerCase();
      return studentCourse.includes(target) || target.includes(studentCourse) || studentBranch.includes(target);
    });

    if (courseMatched) {
      breakdown.course = 20;
      matchedRequirements.push(`Enrolled course '${student.course}' matches eligible courses`);
    } else {
      breakdown.course = 0;
      missingRequirements.push(`Course '${student.course}' is not among eligible streams (${eligibleCourses.join(', ')})`);
      isDisqualified = true;
    }
  } else {
    breakdown.course = 10;
    missingRequirements.push(`Current degree/course not specified; eligible streams: ${eligibleCourses.join(', ')}`);
  }

  // 4. LOCATION EVALUATION (Max 15)
  let eligibleStates = [];
  try {
    eligibleStates = Array.isArray(scholarship.eligible_states)
      ? scholarship.eligible_states
      : JSON.parse(scholarship.eligible_states || '[]');
  } catch (e) {
    eligibleStates = ['All India'];
  }

  const isNational = eligibleStates.some(s => s.toLowerCase() === 'all india' || s.toLowerCase() === 'all');
  const studentState = (student.state || '').trim().toLowerCase();

  if (isNational) {
    breakdown.location = 15;
    matchedRequirements.push('Nationwide eligibility across all states and union territories');
  } else if (studentState) {
    const stateMatched = eligibleStates.some(s => s.toLowerCase() === studentState || studentState.includes(s.toLowerCase()));
    if (stateMatched) {
      breakdown.location = 15;
      matchedRequirements.push(`Resident of '${student.state}' qualifies for state-specific quota`);
    } else {
      breakdown.location = 0;
      missingRequirements.push(`Restricted to residents of ${eligibleStates.join(', ')}; student is from ${student.state}`);
      isDisqualified = true;
    }
  } else {
    breakdown.location = 8;
    missingRequirements.push(`State of residence not specified in profile; requires: ${eligibleStates.join(', ')}`);
  }

  // 5. CATEGORY EVALUATION (Max 10)
  let eligibleCategories = [];
  try {
    eligibleCategories = Array.isArray(scholarship.eligible_categories)
      ? scholarship.eligible_categories
      : JSON.parse(scholarship.eligible_categories || '[]');
  } catch (e) {
    eligibleCategories = ['All'];
  }

  const isAllCategories = eligibleCategories.some(cat => cat.toLowerCase() === 'all' || cat.toLowerCase() === 'any');
  const studentCategory = (student.category || '').trim().toLowerCase();

  if (isAllCategories) {
    breakdown.category = 10;
    matchedRequirements.push('Open to all student social and reservation categories');
  } else if (studentCategory) {
    const categoryMatched = eligibleCategories.some(cat => {
      const c = cat.toLowerCase();
      if (c === studentCategory) return true;
      if (c === 'minority' && student.minority_status) return true;
      return false;
    });

    if (categoryMatched) {
      breakdown.category = 10;
      matchedRequirements.push(`Category '${student.category}' matches targeted reservation criteria`);
    } else {
      breakdown.category = 0;
      missingRequirements.push(`Reserved for ${eligibleCategories.join(', ')}; student belongs to ${student.category}`);
      isDisqualified = true;
    }
  } else {
    breakdown.category = 5;
    missingRequirements.push(`Category not specified in profile; target categories: ${eligibleCategories.join(', ')}`);
  }

  // 6. OTHER CONDITIONS (Max 10): Gender, Age, Special criteria
  let otherScore = 0;
  const genderReq = (scholarship.gender_requirement || 'All').trim().toLowerCase();
  const studentGender = (student.gender || '').trim().toLowerCase();

  if (genderReq === 'all') {
    otherScore += 4;
    matchedRequirements.push('Open to all genders');
  } else if (studentGender) {
    if (genderReq === studentGender) {
      otherScore += 4;
      matchedRequirements.push(`Gender '${student.gender}' matches target requirement`);
    } else {
      missingRequirements.push(`Specifically for ${scholarship.gender_requirement} candidates`);
      isDisqualified = true;
    }
  } else {
    otherScore += 2;
  }

  const ageReq = Number(scholarship.age_requirement) || 100;
  const studentAge = Number(student.age) || 0;
  if (ageReq >= 100 || studentAge === 0) {
    otherScore += 3;
  } else if (studentAge <= ageReq) {
    otherScore += 3;
    matchedRequirements.push(`Age ${studentAge} is within maximum limit of ${ageReq}`);
  } else {
    missingRequirements.push(`Student age (${studentAge}) exceeds maximum limit (${ageReq})`);
    isDisqualified = true;
  }

  // Bonus for disability or minority or rural fit if supported
  if (student.disability_status || student.minority_status || student.rural_urban === 'Rural') {
    otherScore += 3;
  } else {
    otherScore += 2;
  }

  breakdown.other = Math.min(10, otherScore);

  // Total Score Calculation
  const totalScore = breakdown.academic + breakdown.income + breakdown.course + breakdown.location + breakdown.category + breakdown.other;
  const matchScore = Math.min(100, Math.max(0, totalScore));
  const eligible = !isDisqualified && matchScore >= 60;

  return {
    matchScore,
    eligible,
    breakdown,
    matchedRequirements,
    missingRequirements,
  };
}
