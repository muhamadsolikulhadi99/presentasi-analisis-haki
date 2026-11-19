
// ==========================================
// FUNGSI DASAR
// ==========================================

const $ = (selector) => document.querySelector(selector);

const normalize = (text) =>
  String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

// Mengambil data dari content.js
const chapters = window.PAPER_SUMMARIES || [];
const paperText = window.PAPER_TEXT || "";


// ==========================================
// MENAMPILKAN RINGKASAN BAB
// ==========================================

const summaryGrid = $("#summaryGrid");

if (summaryGrid) {
  summaryGrid.innerHTML = chapters.map((chapter, index) => `
    <article class="summary-card">
      <div class="num">BAB ${String(index + 1).padStart(2, "0")}</div>

      <h3>${escapeHTML(
        chapter.title.replace(/^Bab [IVX]+ — /, "")
      )}</h3>

      <p>${escapeHTML(chapter.summary)}</p>

      <ul>
        ${chapter.points.map(point => `
          <li>${escapeHTML(point)}</li>
        `).join("")}
      </ul>

      <button data-chapter="${index}">
        Buka bagian makalah →
      </button>
    </article>
  `).join("");
}


// ==========================================
// MEMPROSES DAN MENAMPILKAN ISI MAKALAH
// ==========================================

function parsePaper() {
  const paperContent = $("#paperContent");
  const tocLinks = $("#tocLinks");

  if (!paperContent || !tocLinks) return;

  const lines = paperText.replace(/\r/g, "").split("\n");

  let output = "";
  const toc = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const text = raw.trim();

    if (!text) continue;

    // Judul BAB
    if (/^BAB (I|II|III|IV|V|VI|VII)\s*$/.test(text)) {
      const chapterTitle = lines[i + 1]?.trim() || text;
      const id = "bab-" + (toc.length + 1);

      toc.push({
        id,
        title: text + " — " + chapterTitle
      });

      output += `
        <h2 id="${id}">
          ${escapeHTML(text)}
          <br>
          ${escapeHTML(chapterTitle)}
        </h2>
      `;

      i++;
      continue;
    }

    // Subjudul huruf A, B, C, dan seterusnya
    if (/^[A-G]\.\s+/.test(text)) {
      output += `<h3>${escapeHTML(text)}</h3>`;
      continue;
    }

    // Daftar pustaka dan catatan metodologis
    if (/^DAFTAR PUSTAKA|^CATATAN METODOLOGIS/i.test(text)) {
      const id = "bagian-" + toc.length;

      toc.push({
        id,
        title: text
      });

      output += `<h2 id="${id}">${escapeHTML(text)}</h2>`;
      continue;
    }

    // Judul makalah
    if (/^MAKALAH$/.test(text)) {
      output += `
        <p style="text-align:center;font-weight:700;letter-spacing:.2em">
          ${escapeHTML(text)}
        </p>
      `;
      continue;
    }

    // Penomoran bagian
    if (text.length < 110 && /^\d+\.\s/.test(text)) {
      output += `<p>${escapeHTML(text)}</p>`;
      continue;
    }

    // Kata kunci
    if (/^Kata kunci:/i.test(text)) {
      output += `<p><b>${escapeHTML(text)}</b></p>`;
      continue;
    }

    // Teks yang seluruhnya dibungkus tanda **
    if (text.startsWith("**") && text.endsWith("**")) {
      output += `<p><b>${escapeHTML(text.slice(2, -2))}</b></p>`;
      continue;
    }

    // Paragraf biasa dan format tebal/miring
    const formattedText = escapeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    output += `<p>${formattedText}</p>`;
  }

  paperContent.innerHTML = output;

  // Membuat daftar isi
  tocLinks.innerHTML = toc.map(item => `
    <a href="#${item.id}">
      ${escapeHTML(item.title)}
    </a>
  `).join("");
}

parsePaper();


// ==========================================
// TOMBOL BUKA BAGIAN MAKALAH
// ==========================================

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chapter]");

  if (!button) return;

  const index = Number(button.dataset.chapter);

  const chapterHeadings = [
    ...document.querySelectorAll(".paper-content h2[id^='bab-']")
  ];

  chapterHeadings[index]?.scrollIntoView({
    behavior: "smooth"
  });
});


// ==========================================
// FITUR PENCARIAN MAKALAH
// ==========================================

const searchInput = $("#searchInput");

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    const paperContent = $("#paperContent");

    if (!paperContent) return;

    const query = normalize(event.target.value.trim());

    const paragraphs = [
      ...paperContent.querySelectorAll("p, h2, h3")
    ];

    paragraphs.forEach((paragraph) => {
      const originalText =
        paragraph.dataset.original || paragraph.textContent;

      paragraph.dataset.original = originalText;

      if (!query) {
        paragraph.textContent = originalText;
        return;
      }

      const normalizedText = normalize(originalText);
      const index = normalizedText.indexOf(query);

      if (index === -1) {
        paragraph.textContent = originalText;
        return;
      }

      const match = originalText.slice(index, index + query.length);
      const before = originalText.slice(0, index);
      const after = originalText.slice(index + query.length);

      paragraph.replaceChildren(
        document.createTextNode(before),
        Object.assign(document.createElement("mark"), {
          textContent: match
        }),
        document.createTextNode(after)
      );
    });
  });
}


// ==========================================
// PENGATURAN TAMPILAN WEBSITE
// ==========================================

// Mode terang dan gelap
const themeToggle = $("#themeToggle");

if (themeToggle) {
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
  };
}

// Menu navigasi
const menuToggle = $("#menuToggle");

if (menuToggle) {
  menuToggle.onclick = () => {
    $("#mainNav")?.classList.toggle("open");
  };
}

// Memperbesar ukuran tulisan
const fontUp = $("#fontUp");

if (fontUp) {
  fontUp.onclick = () => {
    const paper = $("#paperContent");

    if (!paper) return;

    const currentSize = parseFloat(
      getComputedStyle(paper).fontSize
    );

    paper.style.fontSize = (currentSize + 1) + "px";
  };
}

// Memperkecil ukuran tulisan
const fontDown = $("#fontDown");

if (fontDown) {
  fontDown.onclick = () => {
    const paper = $("#paperContent");

    if (!paper) return;

    const currentSize = parseFloat(
      getComputedStyle(paper).fontSize
    );

    paper.style.fontSize = Math.max(12, currentSize - 1) + "px";
  };
}

// Menyalin tautan makalah
const copyLink = $("#copyLink");

if (copyLink) {
  copyLink.onclick = async () => {
    try {
      await navigator.clipboard.writeText(
        location.href + "#makalah"
      );

      copyLink.textContent = "Tautan disalin";
    } catch {
      copyLink.textContent = "Salin dari bilah alamat";
    }
  };
}


// ==========================================
// ILUSTRASI ANIMASI UNTUK SETIAP SLIDE
// ==========================================

function getSlideVisual(index) {
  const visuals = [
    {
      icon: "📚",
      left: "💻",
      right: "✨",
      label: "Pendidikan di Era Digital"
    },
    {
      icon: "📖",
      left: "🔍",
      right: "📝",
      label: "Latar Belakang dan Fokus Kajian"
    },
    {
      icon: "©️",
      left: "🛡️",
      right: "⚖️",
      label: "Hak Cipta dan Landasan Hukum"
    },
    {
      icon: "📚",
      left: "📘",
      right: "📗",
      label: "Studi Kasus Dua Buku LKS"
    },
    {
      icon: "⚖️",
      left: "📜",
      right: "🔎",
      label: "Analisis Hukum dan Etika Digital"
    },
    {
      icon: "🤝",
      left: "🕌",
      right: "💡",
      label: "Amanah, Kejujuran, dan Keadilan"
    },
    {
      icon: "👩‍🏫",
      left: "📖",
      right: "🎓",
      label: "Inovasi Pembelajaran PAI"
    },
    {
      icon: "🌟",
      left: "📚",
      right: "🎯",
      label: "Kesimpulan dan Rekomendasi"
    }
  ];

  const item = visuals[index] || visuals[0];

  return `
    <div class="pres-visual" aria-hidden="true">
      <div class="visual-orbit orbit-one"></div>
      <div class="visual-orbit orbit-two"></div>

      <div class="visual-side visual-left">
        ${item.left}
      </div>

      <div class="visual-main">
        ${item.icon}
      </div>

      <div class="visual-side visual-right">
        ${item.right}
      </div>

      <div class="visual-caption">
        ${item.label}
      </div>
    </div>
  `;
}


// ==========================================
// MODE PRESENTASI
// ==========================================

// Slide 0 = Pengantar
// Slide 1 sampai 7 = BAB I sampai BAB VII

let slide = 0;

function showSlide() {
  const presentation = $("#presentation");
  const presBody = $("#presBody");presentation.scrollTop = 0;
  const slideNumber = $("#slideNumber");
  const prevButton = $("#prevSlide");
  const nextButton = $("#nextSlide");

  if (
    !presentation ||
    !presBody ||
    !slideNumber ||
    !prevButton ||
    !nextButton
  ) {
    return;
  }

  const isIntro = slide === 0;
  const chapter = isIntro ? null : chapters[slide - 1];

  if (!isIntro && !chapter) return;

  const introPoints = [
    "Perspektif hukum hak cipta",
    "Etika digital dan integritas akademik",
    "Nilai-nilai Pendidikan Agama Islam"
  ];

  const points = isIntro ? introPoints : chapter.points;

  
  presBody.innerHTML = `
    <div class="pres-layout">

      <div class="pres-content">
        <div class="pres-kicker">
          ${
            isIntro
              ? "PENGANTAR KAJIAN"
              : `BAB ${String(slide).padStart(2, "0")}`
          }
        </div>

        <h2>
          ${
            isIntro
              ? "Menganalisis Satu Kasus Pelanggaran HAKI Secara Menyeluruh"
              : escapeHTML(chapter.title)
          }
        </h2>

        <p>
          ${
            isIntro
              ? "Studi kasus dugaan pelanggaran hak cipta LKS Pendidikan Agama Islam Titian Prestasi dan Pandhan Simo."
              : escapeHTML(chapter.summary)
          }
        </p>

        <ul>
          ${points.map(point => `
            <li>${escapeHTML(point)}</li>
          `).join("")}
        </ul>
      </div>

      <div class="pres-art">
        ${getSlideVisual(slide)}
      </div>

    </div>
  `;

  // Nomor slide
  slideNumber.textContent =
    `${slide + 1} / ${chapters.length + 1}`;

  // Tombol navigasi tetap terlihat
  prevButton.disabled = slide === 0;
  nextButton.disabled = slide === chapters.length;
}


// ==========================================
// MEMBUKA MODE PRESENTASI
// ==========================================

function openPresentation() {
  const presentation = $("#presentation");

  if (!presentation) return;

  presentation.classList.add("active");
  presentation.setAttribute("aria-hidden", "false");

  // Mulai dari slide pengantar
  slide = 0;

  showSlide();

  // Memastikan tampilan diperbarui browser
  requestAnimationFrame(() => {
    showSlide();
  });
}


// ==========================================
// MENUTUP MODE PRESENTASI
// ==========================================

function closePresentation() {
  const presentation = $("#presentation");

  if (!presentation) return;

  presentation.classList.remove("active");
  presentation.setAttribute("aria-hidden", "true");
}


// ==========================================
// MENGHUBUNGKAN TOMBOL BUKA DAN TUTUP
// ==========================================

const presentToggle = $("#presentToggle");
const closePresentationButton = $("#closePresentation");

if (presentToggle) {
  presentToggle.onclick = openPresentation;
}

if (closePresentationButton) {
  closePresentationButton.onclick = closePresentation;
}


// ==========================================
// TOMBOL SLIDE SEBELUMNYA
// ==========================================

const prevSlideButton = $("#prevSlide");

if (prevSlideButton) {
  prevSlideButton.onclick = () => {
    if (slide > 0) {
      slide--;
      showSlide();
    }
  };
}


// ==========================================
// TOMBOL SLIDE BERIKUTNYA
// ==========================================

const nextSlideButton = $("#nextSlide");

if (nextSlideButton) {
  nextSlideButton.onclick = () => {
    if (slide < chapters.length) {
      slide++;
      showSlide();
    }
  };
}


// ==========================================
// NAVIGASI PRESENTASI DENGAN KEYBOARD
// ==========================================

document.addEventListener("keydown", (event) => {
  const presentation = $("#presentation");

  if (!presentation?.classList.contains("active")) {
    return;
  }

  if (event.key === "Escape") {
    closePresentation();
  }

  if (event.key === "ArrowRight") {
    $("#nextSlide")?.click();
  }

  if (event.key === "ArrowLeft") {
    $("#prevSlide")?.click();
  }
});


// ==========================================
// MENDAFTARKAN SERVICE WORKER
// ==========================================

if (
  "serviceWorker" in navigator &&
  location.protocol.startsWith("http")
) {
  navigator.serviceWorker
    .register("./sw.js")
    .catch((error) => {
      console.warn("Service Worker gagal didaftarkan:", error);
    });
}
