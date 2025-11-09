import React, { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import MenuSidebar from './MenuPage';
import { uploadDocumentRequest } from '../api';

const initialState = {
  file: null,
  title: '',
  tags: ''
};

const UploadDocument = () => {
  const [{ file, title, tags }, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  const updateField = (field) => (value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (newFile) => {
    updateField('file')(newFile || null);
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (title.trim()) formData.append('title', title.trim());

      if (tags.trim()) {
        tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .forEach((tag) => formData.append('tags[]', tag));
      }

      await uploadDocumentRequest(formData, token);
      setMessage('Document uploaded successfully!');
      setFormState(initialState);
    } catch (error) {
      setMessage('Error uploading document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-with-sidebar fixed-page">
      <MenuSidebar />
      <div className="upload-document main-content">
        <section className="upload-header">
          <div>
            <p className="upload-eyebrow">Knowledge Source</p>
            <h1>Upload a document</h1>
            <p className="upload-subtitle">
              Add PDFs or text files to enrich the retrieval base. Each upload is scanned, chunked, and tagged
              so RAG answers stay current.
            </p>
          </div>
          <div className="upload-meta">
            <div>
              <span>Accepted</span>
              <strong>PDF, TXT</strong>
            </div>
            <div>
              <span>Max Size</span>
              <strong>10 MB</strong>
            </div>
          </div>
        </section>

        <div className="upload-grid">
          <form className="upload-form" onSubmit={handleSubmit}>
            <div
              className="upload-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <label htmlFor="file-input">
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  required
                />
                <div className="dropzone-body">
                  <p className="dropzone-title">Drag & drop or click to upload</p>
                  <p className="dropzone-desc">Securely ingest your knowledge sources. Support for PDF & TXT.</p>
                  {file && <span className="dropzone-file">{file.name}</span>}
                </div>
              </label>
            </div>

            <label className="form-control">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => updateField('title')(e.target.value)}
                placeholder="e.g. Incident response runbook"
              />
            </label>

            <label className="form-control">
              <span>Tags</span>
              <input
                type="text"
                value={tags}
                onChange={(e) => updateField('tags')(e.target.value)}
                placeholder="compliance, prod, SOC2"
              />
            </label>

            <button type="submit" disabled={!file || loading}>
              {loading ? 'Uploading...' : 'Upload document'}
            </button>

            {message && (
              <div className={`callout ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </form>

          <aside className="upload-guide">
            <h2>Before you upload</h2>
            <ul>
              <li>Remove sensitive or expired content.</li>
              <li>Add descriptive titles for quick filtering.</li>
              <li>Use comma-separated tags to improve retrieval.</li>
            </ul>
            <div className="guide-card">
              <h3>Need structure?</h3>
              <p>Use consistent headings and sections inside the document so embeddings perform better.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
