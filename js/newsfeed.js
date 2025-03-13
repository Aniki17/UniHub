const API_URL = 'http://localhost:5000';
    
// Load articles from backend on page load
window.onload = function () {
    fetchArticles();
};

function fetchArticles() {
    fetch(`${API_URL}/articles`)
        .then(response => response.json())
        .then(articles => {
            const newsFeed = document.getElementById('news-feed');
            newsFeed.innerHTML = ''; // Clear existing articles
            articles.forEach(article => {
                createArticleElement(article.id, article.title, article.content);
            });
        })
        .catch(error => console.error('Error fetching articles:', error));
}

function addArticle() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    if (title && content) {
        fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        })
        .then(response => response.json())
        .then(article => {
            createArticleElement(article.id, title, content);
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
        })
        .catch(error => console.error('Error adding article:', error));
    }
}

function createArticleElement(id, title, content) {
    const article = document.createElement('div');
    article.className = 'article';
    article.setAttribute('data-id', id);

    const articleTitle = document.createElement('h2');
    articleTitle.innerText = title;
    article.appendChild(articleTitle);

    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = function (event) {
        event.stopPropagation();
        deleteArticle(id, article);
    };

    article.appendChild(removeBtn);
    article.onclick = function (event) {
        if (!event.target.classList.contains('remove-btn')) {
            openModal(title, content);
        }
    };

    document.getElementById('news-feed').appendChild(article);
}

function deleteArticle(id, articleElement) {
    fetch(`${API_URL}/articles/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(() => {
            articleElement.remove();
        })
        .catch(error => console.error('Error deleting article:', error));
}

function openModal(title, content) {
    document.getElementById('modal-content').innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}