const tableBody = document.getElementById("survey-table-body");
const tabs = document.querySelectorAll("#survey-tabs .tab-primary");

function filterSurveys(tab) {
  if (tab === "all") return SURVEYS;
  if (tab === "my") return SURVEYS.filter((s) => s.owner === "me");
  if (tab === "published") return SURVEYS.filter((s) => s.status === "published");
  if (tab === "draft") return SURVEYS.filter((s) => s.status === "draft");
  return SURVEYS;
}

function renderRows(surveys) {
  tableBody.innerHTML = surveys
    .map(
      (s) => `
      <tr>
        <td>${s.name}</td>
        <td><span class="badge badge--${s.status}">${s.status === "published" ? "Published" : "Draft"}</span></td>
        <td>${s.responses}</td>
        <td>${s.collectors}</td>
        <td>${s.modified}</td>
        <td><span class="link">Open</span></td>
      </tr>`
    )
    .join("");
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("tab-primary--active"));
    tab.classList.add("tab-primary--active");
    renderRows(filterSurveys(tab.dataset.tab));
  });
});

renderRows(filterSurveys("all"));

document.getElementById("btn-create-survey").addEventListener("click", () => {
  window.location.href = "create-survey.html";
});
