"""
test_phase4.py — Phase 4 & 5 Verification Script
Run with the FastAPI server already started:
  python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
Then in a second terminal:
  python test_phase4.py
"""

import requests

API = "http://127.0.0.1:8000/api"

PASS = "PASS"
FAIL = "FAIL"

def check(label, condition, detail=""):
    status = PASS if condition else FAIL
    print(f"  {status}  {label}" + (f" — {detail}" if detail else ""))
    return condition

def section(title):
    print(f"\n{'-'*50}")
    print(f"  {title}")
    print(f"{'-'*50}")

def main():
    all_passed = True
    print("\nStudyBrain AI — Phase 4 & 5 Verification")

    # -- PHASE 4: Track Learning ----------------------
    section("Phase 4 > POST /api/learning/track-learning")
    sessions = [
        {"topic": "Machine Learning", "quiz_score": 8, "quiz_total": 10, "study_time_minutes": 30, "mistakes": 2},
        {"topic": "Neural Networks",  "quiz_score": 4, "quiz_total": 10, "study_time_minutes": 20, "mistakes": 6},
        {"topic": "Gradient Descent", "quiz_score": 3, "quiz_total": 10, "study_time_minutes": 15, "mistakes": 7},
    ]
    for s in sessions:
        try:
            r = requests.post(f"{API}/learning/track-learning", json=s, timeout=5)
            ok = r.status_code == 200 and "current_mastery" in r.json()
            all_passed &= check(f"Track '{s['topic']}'", ok, r.text[:80] if not ok else f"mastery={r.json()['current_mastery']}")
        except Exception as e:
            all_passed &= check(f"Track '{s['topic']}'", False, str(e))

    # -- PHASE 4: Topic Mastery -----------------------
    section("Phase 4 > GET /api/learning/topic-mastery")
    try:
        r = requests.get(f"{API}/learning/topic-mastery", timeout=5)
        data = r.json()
        has_topics = r.status_code == 200 and len(data.get("topics", [])) >= 3
        all_passed &= check("Returns mastery for tracked topics", has_topics,
                             f"found {len(data.get('topics',[]))} topics")
        if has_topics:
            for t in data["topics"]:
                print(f"    • {t['topic']}: {t['mastery_score']}% ({t['level']})")
    except Exception as e:
        all_passed &= check("Topic mastery endpoint", False, str(e))

    # -- PHASE 4: Recommendations ---------------------
    section("Phase 4 > GET /api/learning/recommendations")
    try:
        r = requests.get(f"{API}/learning/recommendations", timeout=5)
        data = r.json()
        has_recs = r.status_code == 200 and len(data.get("recommendations", [])) > 0
        all_passed &= check("Returns at least 1 recommendation", has_recs,
                             f"found {len(data.get('recommendations', []))} recs")
        if has_recs:
            for rec in data["recommendations"]:
                print(f"    • {rec['topic']} ({rec['priority']} priority, {rec['mastery_score']}% mastery)")
    except Exception as e:
        all_passed &= check("Recommendations endpoint", False, str(e))

    # -- PHASE 5: Generate Quiz -----------------------
    section("Phase 5 > POST /api/copilot/generate-quiz")
    try:
        r = requests.post(f"{API}/copilot/generate-quiz",
                          json={"topic": "Machine Learning", "num_questions": 3},
                          timeout=15)
        data = r.json()
        ok = r.status_code == 200 and "quiz" in data and len(data["quiz"]) > 20
        all_passed &= check("Quiz generated successfully", ok,
                             f"difficulty={data.get('difficulty','?')}, len={len(data.get('quiz',''))}")
    except Exception as e:
        all_passed &= check("Generate quiz", False, str(e))

    # -- PHASE 5: Explain -----------------------------
    section("Phase 5 > POST /api/copilot/explain")
    try:
        r = requests.post(f"{API}/copilot/explain",
                          json={"concept": "gradient descent"},
                          timeout=15)
        data = r.json()
        ok = r.status_code == 200 and "explanation" in data and len(data["explanation"]) > 10
        all_passed &= check("Explanation returned", ok,
                             f"len={len(data.get('explanation',''))}")
    except Exception as e:
        all_passed &= check("Explain endpoint", False, str(e))

    # -- PHASE 5: Learning Progress -------------------
    section("Phase 5 > GET /api/copilot/learning-progress")
    try:
        r = requests.get(f"{API}/copilot/learning-progress", timeout=5)
        data = r.json()
        ok = r.status_code == 200 and "topics" in data and "recommendations" in data
        all_passed &= check("Learning progress aggregation", ok,
                             f"topics={data.get('total_tracked','?')}")
    except Exception as e:
        all_passed &= check("Learning progress endpoint", False, str(e))

    # -- Summary --------------------------------------
    print(f"\n{'='*50}")
    if all_passed:
        print("    ALL CHECKS PASSED — Phase 4 & 5 Verified!")
        print("  Phase 4 Completed – Ready for Phase 5 ✓")
        print("  Phase 5 Completed – PROJECT COMPLETED SUCCESSFULLY ✓")
    else:
        print("    SOME CHECKS FAILED — review output above.")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    main()
