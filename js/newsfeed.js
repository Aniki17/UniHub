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
                createArticleElement(
                    article.id,
                    article.title,
                    article.content,
                    article.imageUrl,        // Make sure your API returns this
                    article.publishedDate    // Make sure your API returns this
                );
            });
        })
        .catch(error => console.error('Error fetching articles:', error));
}

function addArticle() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const imageUrl = document.getElementById('imageUrl').value.trim();
    const publishedDateInput = document.getElementById('publishedDate').value.trim();
    // Default to today's date if no date is provided
    let publishedDate = publishedDateInput || new Date().toLocaleDateString();

    if (title && content) {
        fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                content,
                imageUrl,
                publishedDate
            })
        })
        .then(response => response.json())
        .then(article => {
            createArticleElement(
                article.id,
                article.title,
                article.content,
                article.imageUrl,
                article.publishedDate
            );
            // Clear the form
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            document.getElementById('imageUrl').value = '';
            document.getElementById('publishedDate').value = '';
            document.getElementById('content').style.height = '30px'; // Reset height
        })
        .catch(error => console.error('Error adding article:', error));
    }
}

function createArticleElement(id, title, content, imageUrl, publishedDate) {
    // Default the published date to today's date if not provided
    publishedDate = publishedDate || new Date().toLocaleDateString();

    const articleCard = document.createElement('div');
    articleCard.className = 'article-card';
    articleCard.setAttribute('data-id', id);
    articleCard.dataset.content = content; // store content for the modal

    // Log the dynamic image URL for debugging
    console.log("Dynamic image URL:", imageUrl);

    // Article Image with error fallback
    const img = document.createElement('img');
    img.className = 'article-image';
    // Use the dynamic imageUrl only if it starts with "http"
    img.src = (imageUrl && imageUrl.startsWith("http")) 
        ? imageUrl 
        : 'https://dummyimage.com/300x150/ccc/000&text=No+Image';
    img.alt = 'Article Image';
    img.onerror = function() {
        this.src = 'https://dummyimage.com/300x150/ccc/000&text=No+Image';
    };

    // Article Title
    const articleTitle = document.createElement('h2');
    articleTitle.innerText = title;
    articleTitle.className = 'article-title';

    // Published Date
    const dateElem = document.createElement('p');
    dateElem.className = 'article-date';
    dateElem.innerText = `Published: ${publishedDate}`;

    // Article Content
    const articleContent = document.createElement('p');
    articleContent.innerText = content;
    articleContent.className = 'article-content';

    // Append children
    articleCard.appendChild(img);
    articleCard.appendChild(articleTitle);
    articleCard.appendChild(dateElem);
    articleCard.appendChild(articleContent);

    // Clicking the article opens the modal
    articleCard.onclick = function () {
        openModal(id);
    };

    // Add the card to the news feed
    document.getElementById('news-feed').appendChild(articleCard);
}

function openModal(id) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const articleElement = document.querySelector(`[data-id='${id}']`);
    
    // Retrieve the stored content from data attributes
    const currentTitle = articleElement.querySelector('.article-title').innerText;
    const currentContent = articleElement.dataset.content;

    // Build the modal content
    modalContent.innerHTML = `
        <h2 id="modal-title">${currentTitle}</h2>
        <p id="modal-text">${currentContent}</p>
    `;
    
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = function () {
        enableEditing(id);
    };
    
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save Changes';
    saveBtn.className = 'save-btn';
    saveBtn.style.display = 'none';
    saveBtn.onclick = function () {
        saveArticle(id);
    };
    
    const removeBtn = document.createElement('button');
    removeBtn.innerText = 'Remove Article';
    removeBtn.className = 'remove-btn';
    removeBtn.onclick = function () {
        deleteArticle(id, articleElement);
    };
    
    modalContent.appendChild(editBtn);
    modalContent.appendChild(saveBtn);
    modalContent.appendChild(removeBtn);
    
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.overflowY = 'auto'; // Allow scrolling
    modal.style.padding = '20px';
}

function enableEditing(id) {
    const titleElem = document.getElementById('modal-title');
    const contentElem = document.getElementById('modal-text');
    
    // Create styled input for title
    const newTitleInput = document.createElement('input');
    newTitleInput.type = 'text';
    newTitleInput.value = titleElem.innerText;
    newTitleInput.id = 'edit-title';
    newTitleInput.style.width = '100%';
    newTitleInput.style.backgroundColor = '#393E46';
    newTitleInput.style.color = '#EEEEEE';
    newTitleInput.style.border = '2px solid #00ADB5';
    newTitleInput.style.padding = '10px';
    newTitleInput.style.borderRadius = '8px';
    
    // Create styled textarea for content
    const newContentTextarea = document.createElement('textarea');
    newContentTextarea.value = contentElem.innerText;
    newContentTextarea.id = 'edit-content';
    newContentTextarea.style.width = '100%';
    newContentTextarea.style.height = '200px';
    newContentTextarea.style.backgroundColor = '#393E46';
    newContentTextarea.style.color = '#EEEEEE';
    newContentTextarea.style.border = '2px solid #00ADB5';
    newContentTextarea.style.padding = '10px';
    newContentTextarea.style.borderRadius = '8px';
    
    titleElem.replaceWith(newTitleInput);
    contentElem.replaceWith(newContentTextarea);
    
    document.querySelector('.edit-btn').style.display = 'none';
    document.querySelector('.save-btn').style.display = 'inline-block';
}

function saveArticle(id) {
    const newTitle = document.getElementById('edit-title').value.trim();
    const newContent = document.getElementById('edit-content').value.trim();

    if (newTitle && newContent) {
        fetch(`${API_URL}/articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newTitle,
                content: newContent,
                // If you also want to update imageUrl or publishedDate,
                // you need to fetch them from the modal (or add more fields).
            })
        })
        .then(response => response.json())
        .then(updatedArticle => {
            // Update the article element in the news feed
            const articleElement = document.querySelector(`[data-id='${id}']`);
            if (articleElement) {
                const titleElem = articleElement.querySelector('.article-title');
                if (titleElem) {
                    titleElem.innerText = updatedArticle.title;
                }
                articleElement.dataset.content = updatedArticle.content;
            }
            fetchArticles(); // Refresh articles from the server
            closeModal();
        })
        .catch(error => console.error('Error editing article:', error));
    }
}

function deleteArticle(id, articleElement) {
    fetch(`${API_URL}/articles/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(() => {
            if (articleElement) {
                articleElement.remove();
            }
            closeModal();
        })
        .catch(error => console.error('Error deleting article:', error));
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Auto-expanding content box with max height constraint
document.getElementById('content').addEventListener('input', function () {
    this.style.height = '30px'; // Reset height
    this.style.height = Math.min(this.scrollHeight, 150) + 'px'; // Adjust height but cap at 150px
});
