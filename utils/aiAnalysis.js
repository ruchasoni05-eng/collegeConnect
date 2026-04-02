// ============================================
// AI Analysis Utility
// Rule-based analysis for feedback/complaints
// Detects: Category, Sentiment, Priority
// ============================================

/**
 * Keywords mapped to each category for auto-detection.
 * The system checks which category has the most keyword matches.
 */
const categoryKeywords = {
  Infrastructure: [
    'building', 'road', 'parking', 'gate', 'wall', 'ceiling', 'roof',
    'floor', 'stairs', 'elevator', 'lift', 'construction', 'repair',
    'maintenance', 'broken', 'damaged', 'leaking', 'crack', 'paint',
    'renovation', 'infrastructure', 'campus'
  ],
  Academic: [
    'teacher', 'professor', 'lecture', 'class', 'exam', 'syllabus',
    'timetable', 'schedule', 'marks', 'grade', 'assignment', 'project',
    'curriculum', 'course', 'subject', 'study', 'academic', 'teaching',
    'faculty', 'education', 'attendance', 'semester', 'result'
  ],
  Facility: [
    'library', 'lab', 'laboratory', 'computer', 'wifi', 'internet',
    'canteen', 'food', 'water', 'washroom', 'toilet', 'bathroom',
    'drinking', 'sports', 'gym', 'playground', 'projector', 'ac',
    'air conditioner', 'fan', 'light', 'electricity', 'power',
    'facility', 'equipment', 'furniture', 'chair', 'desk', 'bench'
  ],
  Administrative: [
    'admission', 'fee', 'scholarship', 'certificate', 'office',
    'administration', 'staff', 'clerk', 'management', 'principal',
    'dean', 'hod', 'document', 'id card', 'registration', 'form',
    'process', 'procedure', 'policy', 'rule', 'regulation', 'hostel'
  ]
};

/**
 * Word lists for sentiment analysis.
 * Score: positive words add +1, negative words add -1.
 */
const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
  'awesome', 'helpful', 'nice', 'best', 'love', 'happy', 'satisfied',
  'impressive', 'outstanding', 'brilliant', 'superb', 'perfect',
  'appreciate', 'thank', 'thanks', 'worthy', 'remarkable', 'pleasant',
  'improved', 'improvement', 'better', 'comfortable', 'convenient'
];

const negativeWords = [
  'bad', 'worst', 'terrible', 'horrible', 'awful', 'poor', 'pathetic',
  'disgusting', 'dirty', 'broken', 'damaged', 'useless', 'waste',
  'disappointed', 'frustrating', 'annoying', 'complaint', 'problem',
  'issue', 'fail', 'failed', 'failure', 'hate', 'angry', 'upset',
  'unhappy', 'unsatisfied', 'unacceptable', 'negligence', 'ignored',
  'delay', 'delayed', 'slow', 'worse', 'worst', 'dangerous', 'unsafe'
];

/**
 * Keywords that indicate high urgency / priority.
 */
const highPriorityWords = [
  'urgent', 'emergency', 'immediately', 'asap', 'critical', 'serious',
  'dangerous', 'unsafe', 'hazard', 'health', 'safety', 'accident',
  'injury', 'fire', 'flood', 'broken', 'collapsed', 'severe',
  'unbearable', 'intolerable', 'worst', 'terrible', 'horrible'
];

const lowPriorityWords = [
  'minor', 'small', 'slight', 'suggest', 'suggestion', 'maybe',
  'could', 'would', 'nice', 'optional', 'consider', 'wish',
  'hope', 'idea', 'thought', 'feedback', 'improve'
];

/**
 * Analyzes feedback/complaint text and returns AI analysis results.
 * @param {string} text - The complaint/feedback message
 * @returns {object} - { detectedCategory, sentiment, priority }
 */
function analyzeText(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // --- Category Detection ---
  // Count keyword matches for each category
  const categoryScores = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    categoryScores[category] = keywords.filter(kw => lowerText.includes(kw)).length;
  }
  // Pick the category with the most matches, default to 'Other'
  const detectedCategory = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])[0];
  const finalCategory = detectedCategory[1] > 0 ? detectedCategory[0] : 'Other';

  // --- Sentiment Analysis ---
  // Count positive and negative word occurrences
  let sentimentScore = 0;
  words.forEach(word => {
    if (positiveWords.includes(word)) sentimentScore++;
    if (negativeWords.includes(word)) sentimentScore--;
  });
  let sentiment = 'Neutral';
  if (sentimentScore >= 2) sentiment = 'Positive';
  else if (sentimentScore <= -1) sentiment = 'Negative';

  // --- Priority Detection ---
  const highCount = highPriorityWords.filter(w => lowerText.includes(w)).length;
  const lowCount = lowPriorityWords.filter(w => lowerText.includes(w)).length;
  let priority = 'Medium';
  if (highCount >= 2) priority = 'High';
  else if (highCount === 1 && lowCount === 0) priority = 'High';
  else if (lowCount >= 2 && highCount === 0) priority = 'Low';
  else if (sentiment === 'Negative' && highCount >= 1) priority = 'High';

  return { detectedCategory: finalCategory, sentiment, priority };
}

module.exports = { analyzeText };
