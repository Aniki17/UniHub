// Document model for storing PDF references
class DocumentModel {
  constructor() {
    // Check if localStorage has documents array
    const storedDocs = localStorage.getItem('eLearningDocuments');
    this.documents = storedDocs ? JSON.parse(storedDocs) : [];
  }

  // Add a new document
  addDocument(document) {
    // Generate ID
    document.id = Date.now().toString();
    document.uploadDate = new Date().toISOString();
    this.documents.push(document);
    this._saveToStorage();
    return document.id;
  }

  // Get all documents
  getAllDocuments() {
    return [...this.documents];
  }

  // Get document by ID
  getDocument(id) {
    return this.documents.find(doc => doc.id === id);
  }

  // Delete document
  deleteDocument(id) {
    this.documents = this.documents.filter(doc => doc.id !== id);
    this._saveToStorage();
  }

  // Private method to save to localStorage
  _saveToStorage() {
    localStorage.setItem('eLearningDocuments', JSON.stringify(this.documents));
  }
}