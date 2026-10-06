# ScholarNest — AI Integration Architecture

This document describes how Google Gemini is integrated into ScholarNest, including prompt design, structured output parsing, caching, and the rationale behind strictly separating deterministic rules from generative language modeling.

---

## 1. Why Deterministic Matching is NOT Delegated to AI

In scholarship evaluation, mathematical precision and equity are paramount. If an LLM is asked to compute whether a student qualifies for a grant, three fundamental failures occur:

1. **Non-Determinism:** The same student profile queried twice could receive an 88% match in one instance and a 72% match in another due to temperature variance.
2. **Hallucination of Cutoffs:** Large language models frequently invent or misread numeric bounds (e.g. interpreting an annual income cap of &le; 4.5 LPA as &le; 45 LPA).
3. **Black Box Disqualification:** A student cannot see the exact point deductions leading to rejection.

### The ScholarNest Hybrid Solution:
- **Deterministic Math Engine:** Calculates the match score (0 to 100) on the backend using verifiable logic:
  - Academic Merit: `25 Points`
  - Family Income Ceiling: `20 Points`
  - Course Compatibility: `20 Points`
  - State & Nativity: `15 Points`
  - Reservation Category: `10 Points`
  - Other Quotas: `10 Points`
- **Generative AI (Gemini):** Explains *why* the student received that score, translates administrative guidelines, verifies certificate readability, and answers contextual student questions.

---

## 2. Where Gemini is Used in ScholarNest

| Feature | Endpoint | Model | Purpose |
|---|---|---|---|
| **Eligibility Explanation** | `POST /api/ai/eligibility-explanation` | `gemini-1.5-flash` | Explains the deterministic result, highlights key strengths, spots missing certificates, and provides actionable advice. |
| **NestGuide Assistant** | `POST /api/ai/nestguide` | `gemini-1.5-flash` | Floating chat advisor providing contextual help in English, Telugu, and Hindi. |
| **Document Verification** | `POST /api/documents/:id/analyze` | `gemini-1.5-flash` | Scans certificate metadata for completeness and flags illegible documents as "Needs Attention". |
| **Scholarship Summaries** | `POST /api/ai/scholarship-summary` | `gemini-1.5-flash` | Simplifies complex government gazette notices into student-readable summaries. |

---

## 3. Prompt Engineering & Structured Outputs

### Example: Eligibility Explanation Prompt
```typescript
const prompt = `
You are NestGuide, the AI Assistant for ScholarNest.
Explain to a student why they matched a specific scholarship based on the DETERMINISTIC engine output provided.
DO NOT recalculate or change the match score. Use the exact score and breakdown provided.

Language requirement: Provide your explanation in ${language}.

Student Profile:
- Course: ${student.course}
- CGPA: ${student.cgpa}
- Annual Family Income: INR ${student.annual_family_income}
- State: ${student.state}
- Category: ${student.category}

Deterministic Engine Output:
- Match Score: ${matchResult.matchScore}/100
- Breakdown: ${JSON.stringify(matchResult.breakdown)}
- Satisfied Criteria: ${JSON.stringify(matchResult.matchedRequirements)}
- Gaps: ${JSON.stringify(matchResult.missingRequirements)}

Respond strictly with valid JSON conforming to this schema:
{
  "summary": "1-2 sentence high-level summary",
  "matchScore": number,
  "eligible": boolean,
  "keyStrengths": ["string"],
  "gapsOrActions": ["string"],
  "documentChecklist": ["string"],
  "actionableAdvice": "string"
}
`;
```

### JSON Extraction & Sanitization:
The backend strips Markdown formatting fences before parsing:
```javascript
const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
const resultJson = JSON.parse(cleaned);
```

---

## 4. AI Caching Strategy

To avoid redundant API calls and respect rate limits:
1. An input hash is computed using `SHA-256`:
   ```javascript
   const inputHash = crypto.createHash('sha256')
     .update(JSON.stringify({ studentId, scholarshipId, matchScore, language }))
     .digest('hex');
   ```
2. The `ai_outputs` table is queried:
   ```sql
   SELECT output_json FROM ai_outputs
   WHERE user_id = $1 AND scholarship_id = $2 AND input_hash = $3 LIMIT 1;
   ```
3. If found, the cached response is returned immediately in under 10ms with zero token cost.

---

## 5. Multilingual Intelligence

NestGuide supports native response generation in:
- **English**
- **Telugu (తెలుగు):** Useful for state-level schemes like Telangana ePASS and Jagananna Vidya Deevena.
- **Hindi (हिंदी):** Useful for Central Sector, AICTE Pragati, and PMSS schemes.

Database entity names and official URLs remain untouched to prevent dead links.

---

## 6. Resilience & Fallback

If `GEMINI_API_KEY` is omitted, offline, or exhausts rate limits, ScholarNest gracefully shifts to an **Intelligent Rule-Based Fallback Engine**. The UI never crashes or shows generic errors during judge evaluation or hackathon presentations.
