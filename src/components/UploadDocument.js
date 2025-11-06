import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const UploadDocument = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { token } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            if (title.trim()) {
                formData.append('title', title);
            }
            
            if (tags.trim()) {
                // Convert comma-separated tags to array and remove whitespace
                const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                tagsArray.forEach(tag => {
                    formData.append('tags[]', tag);
                });
            }

            const response = await fetch('https://api.equipo25.edu/rag/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            setMessage('Document uploaded successfully!');
            setFile(null);
            setTitle('');
            setTags('');

        } catch (error) {
            setMessage('Error uploading document: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-document">
            <h2>Upload Document</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="file">Document File (PDF/Text)*:</label>
                    <input
                        type="file"
                        id="file"
                        accept=".pdf,.txt"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter document title"
                    />
                </div>

                <div>
                    <label htmlFor="tags">Tags (comma-separated):</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags, separated by commas"
                    />
                </div>

                <button type="submit" disabled={!file || loading}>
                    {loading ? 'Uploading...' : 'Upload Document'}
                </button>

                {message && (
                    <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default UploadDocument;