(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = reduced ? "auto" : "smooth";
  const grid = $("#project-grid");
  if (!grid) return;

  const projects = $$(".project", grid);
  const tabs = $$(".tab");
  const q = $("#q");
  const searchForm = $("#search-form");
  const clearBtn = $("#search-clear");
  const countEl = $("#result-count");
  const empty = $("#empty");
  const dialog = $("#project-dialog");
  const dialogBody = $("#dialog-body");
  const form = $("#contact-form");
  const allowed = new Set(["all", "brand", "editorial", "package", "digital"]);
  let filter = "all";

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior, block: "start" });
  }

  function sync(updateUrl) {
    const query = q.value.trim().normalize("NFC");
    const needle = query.toLowerCase();
    let visible = 0;

    projects.forEach((el) => {
      const catOk = filter === "all" || el.dataset.category === filter;
      const hay = (el.dataset.search || "").normalize("NFC").toLowerCase();
      const show = catOk && (!needle || hay.includes(needle));
      el.hidden = !show;
      if (show) visible += 1;
    });

    tabs.forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab.dataset.filter === filter));
    });

    countEl.textContent = visible + "개의 작업";
    empty.hidden = visible !== 0;
    clearBtn.hidden = query.length === 0;

    if (updateUrl) {
      const url = new URL(location.href);
      if (filter === "all") url.searchParams.delete("filter");
      else url.searchParams.set("filter", filter);
      if (!query) url.searchParams.delete("q");
      else url.searchParams.set("q", query);
      history.replaceState(null, "", url);
    }
  }

  function setFilter(next) {
    filter = allowed.has(next) ? next : "all";
    sync(true);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setFilter(tab.dataset.filter);
      scrollToId("lookbook");
    });
  });

  q.addEventListener("input", () => sync(true));

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sync(true);
    scrollToId("lookbook");
  });

  clearBtn.addEventListener("click", () => {
    q.value = "";
    sync(true);
    q.focus();
  });

  $$("[data-jump]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setFilter(link.dataset.jump);
      const id = (link.getAttribute("href") || "#lookbook").replace("#", "");
      scrollToId(id);
    });
  });

  $("#reset-filters").addEventListener("click", () => {
    q.value = "";
    setFilter("all");
    scrollToId("lookbook");
  });

  function openProject(article) {
    const tpl = $("template", article);
    if (!tpl || !dialog || !dialogBody) return;
    dialogBody.replaceChildren(tpl.content.cloneNode(true));
    const slot = $("[data-slot='cover']", dialogBody);
    const cover = $(".cover", article);
    if (slot && cover) slot.append(cover.cloneNode(true));
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    const title = $("#dialog-title", dialogBody);
    if (title) {
      title.tabIndex = -1;
      title.focus();
    }
  }

  projects.forEach((article) => {
    const link = $(".text-link", article);
    if (!link) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openProject(article);
    });
  });

  const closeBtn = $(".dialog-close", dialog);
  if (closeBtn) closeBtn.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  const navLinks = $$(".nav a");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    navLinks.forEach((link) => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  const status = $("#form-status");
  const preview = $("#mail-preview");
  const fieldPairs = [
    [$("#name"), $("#err-name")],
    [$("#email"), $("#err-email")],
    [$("#message"), $("#err-message")],
  ];

  function setError(input, errorEl, message) {
    input.setAttribute("aria-invalid", "true");
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    input.removeAttribute("aria-invalid");
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  fieldPairs.forEach(([input, errorEl]) => {
    input.addEventListener("input", () => clearError(input, errorEl));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = fieldPairs[0][0];
    const emailInput = fieldPairs[1][0];
    const messageInput = fieldPairs[2][0];
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const topic = $("#topic").value;
    let ok = true;

    if (!name) {
      setError(nameInput, fieldPairs[0][1], "이름을 입력해 주세요.");
      ok = false;
    } else {
      clearError(nameInput, fieldPairs[0][1]);
    }

    if (!email || !emailInput.checkValidity()) {
      setError(emailInput, fieldPairs[1][1], "이메일 형식을 확인해 주세요.");
      ok = false;
    } else {
      clearError(emailInput, fieldPairs[1][1]);
    }

    if (!message) {
      setError(messageInput, fieldPairs[2][1], "메시지를 입력해 주세요.");
      ok = false;
    } else {
      clearError(messageInput, fieldPairs[2][1]);
    }

    if (!ok) {
      status.textContent = "";
      preview.hidden = true;
      const bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }

    const subject = "[월간 서아] " + name + "님의 메시지";
    const body = "이름: " + name + "\n이메일: " + email + "\n분야: " + topic + "\n\n" + message + "\n";
    preview.hidden = false;
    preview.textContent =
      "받는 사람: hello@atelier-seoa.example\n제목: " +
      subject +
      "\n\n" +
      body +
      "\n이 내용은 서버에 저장하지 않았습니다.";
    status.textContent =
      "메일 앱으로 연결했습니다. 열리지 않으면 아래 내용을 복사해 주세요. 이 페이지는 메시지를 저장하지 않습니다.";
    window.location.href =
      "mailto:hello@atelier-seoa.example?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  });

  const params = new URLSearchParams(location.search);
  const initialFilter = params.get("filter");
  if (initialFilter && allowed.has(initialFilter)) filter = initialFilter;
  if (params.get("q")) q.value = params.get("q");
  sync(false);

  const hashId = location.hash.replace("#", "");
  const hashed = hashId ? document.getElementById(hashId) : null;
  if (hashed && hashed.classList.contains("project")) openProject(hashed);
})();
