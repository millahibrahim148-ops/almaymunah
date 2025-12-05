// CONFIG
const ARTICLES_FOLDER = "articles/";
const isMobile = window.innerWidth < 768;
const perPage = isMobile ? 3 : 4;

let articles = [];
let currentPage = 1;

// FETCH ARTICLE LIST FROM GITHUB-LIKE FOLDER
async function loadArticles() {
  const res = await fetch(ARTICLES_FOLDER);
  const text = await res.text();

  // extract links to files inside folder
  const matches = [...text.matchAll(/href="([^"]+\.(html|md|txt))"/g)];

  const files = matches.map(m => m[1]);

  for (let file of files) {
    const fileRes = await fetch(ARTICLES_FOLDER + file);
    const fileText = await fileRes.text();

    // Extract title
    let title = fileText.match(/<h1[^>]*>(.*?)<\/h1>/i);
    title = title ? title[1] : file.replace(/\..+$/, "");

    // Extract first paragraph
    let desc = fileText.match(/<p[^>]*>(.*?)<\/p>/i);
    desc = desc ? desc[1] : "No description found.";

    articles.push({
      title,
      desc,
      link: ARTICLES_FOLDER + file
    });
  }

  renderPage();
  renderPagination();
}

function renderPage() {
  const list = document.getElementById("articles-container");
  list.innerHTML = "";

  const start = (currentPage - 1) * perPage;
  const pageArticles = articles.slice(start, start + perPage);

  pageArticles.forEach(a => {
    const card = document.createElement("div");
    card.className = "article-card";

    card.innerHTML = `
      <h2 class="article-title">${a.title}</h2>
      <p class="article-desc">${a.desc}</p>
      <a href="${a.link}" class="article-link">Read</a>
    `;

    list.appendChild(card);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(articles.length / perPage);
  const pageBox = document.getElementById("pageNumbers");
  pageBox.innerHTML = "";

  // show at most 3 page buttons + total info
  let pagesToShow = [currentPage + 1, currentPage, currentPage - 1]
    .filter(n => n >= 1 && n <= totalPages)
    .sort((a,b)=>a-b);

  pagesToShow.forEach(num => {
    const span = document.createElement("span");
    span.className = "page-number" + (num === currentPage ? " active" : "");
    span.textContent = num;
    span.onclick = () => {
      currentPage = num;
      renderPage();
      renderPagination();
    };
    pageBox.appendChild(span);
  });
}

// Arrow buttons
document.getElementById("prevPage").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
    renderPagination();
  }
};

document.getElementById("nextPage").onclick = () => {
  const totalPages = Math.ceil(articles.length / perPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
    renderPagination();
  }
};

// Page jump
document.getElementById("jumpBtn").onclick = () => {
  const totalPages = Math.ceil(articles.length / perPage);
  let num = parseInt(document.getElementById("jumpInput").value);
  if (num >= 1 && num <= totalPages) {
    currentPage = num;
    renderPage();
    renderPagination();
  }
};

// Start
loadArticles();
