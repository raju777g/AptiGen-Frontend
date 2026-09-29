import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const options = ["A", "B", "C", "D"];

export default function ResultsPage() {
  const { state } = useLocation();
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [revealedQuestions] = useState(() => state?.reviewQuestions || []);

  if (!state) {
    return <div className="mx-auto mt-10 max-w-md text-center"><p>No results to show.</p><Link to="/my-tests" className="btn btn-primary mt-4">Back to My Tests</Link></div>;
  }

  const { score = 0, totalQuestions = 0, cashbackAwarded, coinsSpent, reviewQuestions = [], contestId, answerKeyAvailableAt } = state;
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const hasAnswerKey = Array.isArray(revealedQuestions) && revealedQuestions.length > 0;
  const releaseLabel = answerKeyAvailableAt ? new Date(`${answerKeyAvailableAt}+05:30`).toLocaleString(undefined, { timeZone: "Asia/Kolkata", weekday: "long", hour: "numeric", minute: "2-digit", hour12: true }) : "Monday at 7:00 PM IST";

  return <div className="mx-auto max-w-4xl space-y-5 py-6">
    <section className="overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#111a31] via-[#17153a] to-[#21144a] p-6 text-center text-white shadow-xl shadow-indigo-950/20 sm:p-9">
      <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200">Test complete</span>
      <div className="mx-auto mt-5 grid h-32 w-32 place-items-center rounded-full border-[7px] border-violet-300/20 bg-white/5" style={{ background: `conic-gradient(#a78bfa ${percentage}%, rgba(255,255,255,.08) ${percentage}% 100%)` }}><div className="grid h-24 w-24 place-items-center rounded-full bg-[#17153a] font-hero text-3xl font-extrabold">{percentage}%</div></div>
      <h1 className="mt-5 font-hero text-2xl font-bold sm:text-3xl">{percentage >= 80 ? "Excellent work!" : percentage >= 50 ? "Good effort!" : "Keep practicing!"}</h1>
      <p className="mt-2 text-slate-300">You got <b className="text-white">{score} of {totalQuestions}</b> questions correct.</p>
      {coinsSpent > 0 && <p className="mt-2 text-sm text-slate-400">Coins spent: {coinsSpent}</p>}
      {cashbackAwarded && <p className="mx-auto mt-4 max-w-md rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-200">🎉 Perfect score! Your 50% cashback has been credited.</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">{contestId ? <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">Contest answer key will be published {releaseLabel}.</p> : <button type="button" onClick={() => setShowAnswerKey((shown) => !shown)} className="btn border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">{showAnswerKey ? "Hide answer key" : "View answer key"}</button>}<Link to="/my-tests" className="btn btn-outline border-white/25 text-white hover:bg-white/10">Back to My Tests</Link></div>
    </section>

    {!contestId && showAnswerKey && (hasAnswerKey ? <section className="space-y-4"><div><h2 className="font-hero text-xl font-bold text-base-content">Answer key</h2><p className="mt-1 text-sm text-base-content/55">Review the correct answer and your response for each question.</p></div>{reviewQuestions.map((item, index) => <article key={item.questionId ?? index} className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-start justify-between gap-3"><h3 className="font-semibold leading-relaxed text-base-content">{index + 1}. {item.questionText}</h3><span className={`badge shrink-0 ${item.isCorrect ? "badge-success" : item.selectedOption ? "badge-error" : "badge-warning"}`}>{item.isCorrect ? "Correct" : item.selectedOption ? "Incorrect" : "Unanswered"}</span></div><div className="grid gap-2 sm:grid-cols-2">{options.map((option) => {
          const optionText = item[`option${option}`];
          if (!optionText) return null;
          const isCorrect = item.correctOption === option;
          const isSelected = item.selectedOption === option;
          return <div key={option} className={`rounded-xl border p-3 text-sm ${isCorrect ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" : isSelected ? "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200" : "border-base-300 text-base-content/75"}`}><b className="mr-2">{option}.</b>{optionText}{isCorrect && <span className="ml-2 text-xs font-bold">Correct answer</span>}{isSelected && <span className="ml-2 text-xs font-bold">Your answer</span>}</div>;
        })}</div></article>)}</section> : <div role="status" className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-900 dark:text-amber-200">The server returned your score but did not include answer details for review.</div>)}
  </div>;
}
