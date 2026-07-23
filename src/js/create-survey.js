function toggleRow(id, show) {
  const row = document.getElementById(id);
  if (!row) return;
  row.classList.toggle("form-row--hidden", !show);
}

function toggleDisplay(id, show, display) {
  const row = document.getElementById(id);
  if (!row) return;
  row.style.display = show ? (display || "grid") : "none";
}

/* ── Section 1: Survey Details ─────────────────────────────────────────── */
const surveyType = document.getElementById("survey-type");
surveyType.addEventListener("change", () => {
  toggleRow("row-template", surveyType.value === "templates");
});

/* ── Section 2: Appearance ─────────────────────────────────────────────── */
const titleType = document.getElementById("title-type");
titleType.addEventListener("change", () => {
  toggleRow("row-title-text", titleType.value === "use_specific_text");
});

const introEnabled = document.getElementById("intro-page-enabled");
introEnabled.addEventListener("change", () => {
  const on = introEnabled.value === "enabled";
  toggleRow("row-intro-title", on);
  toggleRow("row-intro-desc", on);
  toggleRow("row-intro-btn", on);
});

const tncEnabled = document.getElementById("tnc-enabled");
tncEnabled.addEventListener("change", () => {
  const on = tncEnabled.value === "enabled";
  toggleRow("row-tnc-label", on);
  toggleRow("row-tnc-nav", on);
});

document.getElementById("btn-upload-logo").addEventListener("click", () => {
  document.getElementById("logo-upload").click();
});

/* ── Section 3: Respondent Experience ─────────────────────────────────── */
const quotaEnabled = document.getElementById("quota-enabled");
quotaEnabled.addEventListener("change", () => {
  const on = quotaEnabled.value === "enabled";
  toggleRow("row-quota-condition", on);
  toggleRow("row-quota-limit", on);
});

const saveContinue = document.getElementById("save-continue");
saveContinue.addEventListener("change", () => {
  toggleRow("row-allow-edits", saveContinue.value === "enabled");
});

const linkAccess = document.getElementById("link-access");
function syncSetPassword() {
  const responseOn = document.getElementById("response-access").value === "enabled";
  toggleRow("row-set-password", responseOn && linkAccess.value === "share_with_password");
}
linkAccess.addEventListener("change", syncSetPassword);

const responseAccess = document.getElementById("response-access");
responseAccess.addEventListener("change", () => {
  const on = responseAccess.value === "enabled";
  ["row-link-access", "row-generate-link", "row-generate-download", "row-generate-merged"].forEach((id) =>
    toggleRow(id, on)
  );
  syncSetPassword();
});

/* ── Timer modal ─────────────────────────────────────────────────────── */
let timerSaved = false;
const ptPageCount = 3;

function renderPageTimerCards() {
  const container = document.getElementById("pt-cards-container");
  let html = "";
  for (let i = 1; i <= ptPageCount; i++) {
    html += `
      <div class="pt-card">
        <div class="pt-card__header">
          <span class="pt-card__title">Page ${i}</span>
          <input type="checkbox" class="form-checkbox" onchange="document.getElementById('pt-body-${i}').classList.toggle('pt-card__body--open', this.checked)" />
        </div>
        <div class="pt-card__body" id="pt-body-${i}">
          <div class="form-row">
            <div class="form-row__label">Min Timer</div>
            <div class="form-row__control" style="display:flex;gap:6px;">
              <select class="input"><option>Mins</option><option>0</option><option>5</option><option>10</option></select>
              <select class="input"><option>Secs</option><option>0</option><option>10</option><option>30</option></select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-row__label">Timer label</div>
            <div class="form-row__control"><input type="text" class="input" value="Time left on this page" /></div>
          </div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

document.getElementById("link-timer").addEventListener("click", () => {
  if (!timerSaved) {
    document.getElementById("modal-timer-type").value = "survey_timer";
    document.getElementById("modal-survey-timer-fields").style.display = "block";
    document.getElementById("modal-page-timer-fields").style.display = "none";
  }
  document.getElementById("timer-modal-scrim").classList.add("modal-scrim--open");
});

document.getElementById("modal-timer-type").addEventListener("change", function () {
  const isSurvey = this.value === "survey_timer";
  document.getElementById("modal-survey-timer-fields").style.display = isSurvey ? "block" : "none";
  document.getElementById("modal-page-timer-fields").style.display = isSurvey ? "none" : "block";
  if (!isSurvey) renderPageTimerCards();
});

document.getElementById("st-allow-additional").addEventListener("change", function () {
  toggleDisplay("row-st-auto-approve", this.checked, "grid");
});

document.getElementById("btn-timer-cancel").addEventListener("click", () => {
  document.getElementById("timer-modal-scrim").classList.remove("modal-scrim--open");
});

document.getElementById("btn-timer-save").addEventListener("click", () => {
  timerSaved = true;
  document.getElementById("link-timer").textContent = "Manage Timer";
  document.getElementById("timer-modal-scrim").classList.remove("modal-scrim--open");
});

/* ── Generic condition-row builder (Quota / End Page / Disqualification) ─── */
function makeConditionRow(container, onRemove) {
  const row = document.createElement("div");
  row.className = "condition-row";
  row.innerHTML = `
    <select class="input">
      <option>Question 1</option>
      <option>Question 2</option>
      <option>Question 3</option>
    </select>
    <select class="input">
      <option>Equal to</option>
      <option>Not equal to</option>
      <option>Contains</option>
    </select>
    <input type="text" class="input" placeholder="Value" />
    <button class="condition-row__remove" title="Remove">&times;</button>
  `;
  row.querySelector(".condition-row__remove").addEventListener("click", () => {
    row.remove();
    onRemove();
  });
  container.appendChild(row);
}

function setupConditionPanel(prefix) {
  const scrim = document.getElementById(`${prefix}-condition-scrim`);
  const rowsContainer = document.getElementById(`${prefix}-rows-container`);
  const link = document.getElementById(`link-${prefix}-condition`);
  let saved = false;

  function ensureOneRow() {
    if (rowsContainer.children.length === 0) {
      makeConditionRow(rowsContainer, ensureOneRow);
    }
  }

  function open() {
    if (rowsContainer.children.length === 0) ensureOneRow();
    scrim.classList.add("slideover-scrim--open");
    scrim.querySelector(".slideover").classList.add("slideover--open");
  }

  function close() {
    scrim.querySelector(".slideover").classList.remove("slideover--open");
    setTimeout(() => scrim.classList.remove("slideover-scrim--open"), 250);
  }

  if (link) link.addEventListener("click", open);
  document.getElementById(`btn-${prefix}-add-row`).addEventListener("click", () => makeConditionRow(rowsContainer, ensureOneRow));
  document.getElementById(`btn-${prefix}-cancel`).addEventListener("click", close);
  document.getElementById(`btn-${prefix}-delete`).addEventListener("click", () => {
    rowsContainer.innerHTML = "";
    saved = false;
    if (link) {
      link.textContent = "+ Add Condition";
    }
    close();
  });
  document.getElementById(`btn-${prefix}-save`).addEventListener("click", () => {
    saved = true;
    if (link) link.textContent = "Manage Condition";
    close();
  });
}

setupConditionPanel("quota");

/* ── Section 4: Completion & Distribution ─────────────────────────────── */
const socialPreview = document.getElementById("social-preview-enabled");
socialPreview.addEventListener("change", () => {
  const on = socialPreview.value === "enabled";
  toggleRow("row-preview-title", on);
  toggleRow("row-preview-image", on);
  toggleRow("row-preview-desc", on);
  if (!on) {
    toggleRow("row-preview-title-text", false);
    toggleRow("row-preview-image-upload", false);
  }
});

document.getElementById("preview-title-type").addEventListener("change", function () {
  toggleRow("row-preview-title-text", this.value === "use_specific_title");
});

document.getElementById("preview-image-type").addEventListener("change", function () {
  toggleRow("row-preview-image-upload", this.value === "use_specific_image");
});

document.getElementById("btn-upload-preview-image").addEventListener("click", () => {
  document.getElementById("preview-image-upload").click();
});

/* Document Merge modal */
document.getElementById("btn-doc-merge").addEventListener("click", () => {
  document.getElementById("docmerge-modal-scrim").classList.add("modal-scrim--open");
});

let docMergeSelection = "";
document.querySelectorAll("#docmerge-tpl-list .tpl-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll("#docmerge-tpl-list .tpl-item").forEach((i) => i.classList.remove("tpl-item--selected"));
    item.classList.add("tpl-item--selected");
    docMergeSelection = item.dataset.name;
  });
});

document.getElementById("btn-docmerge-cancel").addEventListener("click", () => {
  document.getElementById("docmerge-modal-scrim").classList.remove("modal-scrim--open");
});

document.getElementById("btn-docmerge-save").addEventListener("click", () => {
  document.getElementById("doc-merge-selected-name").textContent = docMergeSelection;
  document.getElementById("docmerge-modal-scrim").classList.remove("modal-scrim--open");
});

/* Survey End Page */
const sepType = document.getElementById("sep-type");
sepType.addEventListener("change", () => {
  toggleDisplay("sep-default-fields", sepType.value === "default", "block");
  toggleRow("sep-condition-fields", sepType.value === "condition");
});

document.getElementById("sep-default-page").addEventListener("change", function () {
  toggleRow("sep-row-summary", this.value === "summary");
  toggleRow("sep-row-submitted", this.value === "submitted");
  toggleRow("sep-row-custom", this.value === "custom");
  toggleRow("sep-row-redirect", this.value === "redirect");
});

setupConditionPanel("sep");

/* Survey Disqualification Page */
const sdpType = document.getElementById("sdp-type");
sdpType.addEventListener("change", () => {
  toggleRow("sdp-row-custom", sdpType.value === "custom");
  toggleRow("sdp-row-redirect", sdpType.value === "redirect");
  toggleRow("sdp-row-condition", sdpType.value === "condition");
});

setupConditionPanel("sdp");

/* ── Save / Cancel / Push to CRM ──────────────────────────────────────── */
document.getElementById("link-add-form").addEventListener("click", () => {
  alert("Form Builder — next screen to build.");
});

function markSurveySaved() {
  document.getElementById("push-to-crm-unsaved").style.display = "none";
  document.getElementById("push-to-crm-saved").style.display = "flex";
}

document.getElementById("btn-save").addEventListener("click", () => {
  const name = document.getElementById("survey-name").value.trim();
  if (!name) {
    document.getElementById("survey-name").classList.add("input--error");
    return;
  }
  markSurveySaved();
  alert(`Survey "${name}" saved.`);
});

document.getElementById("btn-save-new").addEventListener("click", () => {
  const name = document.getElementById("survey-name").value.trim();
  if (!name) {
    document.getElementById("survey-name").classList.add("input--error");
    return;
  }
  alert(`Survey "${name}" saved. Starting a new survey.`);
  window.location.reload();
});

document.getElementById("link-manage-config").addEventListener("click", () => {
  alert("Push to CRM configuration — next screen to build.");
});
