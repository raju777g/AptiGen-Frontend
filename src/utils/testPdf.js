import { api } from "../api/client";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));

export async function openTestPdf(testId) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) throw new Error("Allow pop-ups to prepare the test PDF.");

  printWindow.document.write("<!doctype html><html><head><title>Preparing test PDF</title></head><body style='font:16px system-ui;padding:32px'>Preparing your test PDF…</body></html>");
  printWindow.document.close();

  try {
    const { data } = await api.get(`/tests/${testId}/export-data`);
    const questions = (data.questions || []).map((question, index) => `
      <article class="question">
        <h2>${index + 1}. ${escapeHtml(question.questionText)}</h2>
        <ol type="A">
          ${[question.optionA, question.optionB, question.optionC, question.optionD].map((option) => `<li>${escapeHtml(option)}</li>`).join("")}
        </ol>
      </article>`).join("");
    const title = escapeHtml(data.title || "AptiGen Test");
    const created = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "";

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title} - AptiGen</title>
      <style>
        *{box-sizing:border-box}body{margin:0;color:#172033;font:14px/1.55 Arial,"Noto Sans",sans-serif}
        header{margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #7653e8}h1{margin:0 0 5px;font-size:25px;line-height:1.25}header p{margin:0;color:#667085;font-size:12px}
        .question{break-inside:avoid;margin:0 0 22px;padding:0 0 15px;border-bottom:1px solid #e4e7ec}h2{margin:0 0 8px;font-size:15px;font-weight:700}ol{margin:0;padding-left:25px}li{padding:2px 0 2px 4px}
        .print{position:fixed;right:20px;top:20px;border:0;border-radius:8px;padding:10px 15px;background:#6845df;color:#fff;font-weight:700;cursor:pointer}
        @page{size:A4;margin:18mm}@media print{.print{display:none}}
      </style></head><body>
      <button class="print" onclick="window.print()">Print / Save as PDF</button>
      <header><h1>${title}</h1><p>AptiGen test${created ? ` · Created ${escapeHtml(created)}` : ""} · ${data.questions?.length || 0} questions</p></header>
      ${questions || "<p>No questions are available for this test.</p>"}
      <script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250))<\/script>
      </body></html>`);
    printWindow.document.close();
  } catch (error) {
    printWindow.close();
    throw error;
  }
}
