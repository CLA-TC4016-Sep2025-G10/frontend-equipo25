import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const RagQuery = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [sources, setSources] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ tags: [], docIds: [] });
    const [availableDocs, setAvailableDocs] = useState([]);
    const [availableTags, setAvailableTags] = useState(new Set());
    const { token } = useContext(AuthContext);

    // Fetch available documents and their tags
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch('https://api.equipo25.edu/rag/documents', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableDocs(data.items);
                    
                    // Extract unique tags from all documents
                    const tags = new Set();
                    data.items.forEach(doc => {
                        if (doc.tags) {
                            doc.tags.forEach(tag => tags.add(tag));
                        }
                    });
                    setAvailableTags(tags);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        if (token) {
            fetchDocuments();
        }
    }, [token]);

    const handleTagToggle = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleDocToggle = (docId) => {
        setFilters(prev => ({
            ...prev,
            docIds: prev.docIds.includes(docId)
                ? prev.docIds.filter(id => id !== docId)
                : [...prev.docIds, docId]
        }));
    };

    const handleStreamingToggle = () => {
        setIsStreaming(!isStreaming);
        setAnswer('');
        setSources([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setAnswer('');
        setSources([]);

        const queryData = {
            question,
            topK: 5,
            filters: {
                tags: filters.tags.length > 0 ? filters.tags : undefined,
                docIds: filters.docIds.length > 0 ? filters.docIds : undefined
            },
            returnSources: true
        };

        try {
            if (isStreaming) {
                const response = await fetch('https://api.equipo25.edu/rag/query/stream', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(queryData)
                });

                if (!response.ok) throw new Error('Error en la consulta');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    setAnswer(prev => prev + chunk);
                }
            } else {
                const response = await fetch('https://api.equipo25.edu/rag/query', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(queryData)
                });

                if (!response.ok) throw new Error('Error en la consulta');

                const data = await response.json();
                setAnswer(data.answer);
                setSources(data.sources || []);
            }
        } catch (error) {
            setError('Error al procesar la consulta: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="rag-query">
            <h2>Consulta RAG</h2>
            
            <form onSubmit={handleSubmit} className="query-form">
                <div className="query-input">
                    <label htmlFor="question">Pregunta:</label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Escriba su pregunta aquí..."
                        required
                    />
                </div>

                <div className="filters-section">
                    <h3>Filtros</h3>
                    
                    <div className="tags-filter">
                        <h4>Tags:</h4>
                        <div className="tags-list">
                            {Array.from(availableTags).map(tag => (
                                <label key={tag} className="tag-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.tags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                    />
                                    {tag}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="docs-filter">
                        <h4>Documentos:</h4>
                        <div className="docs-list">
                            {availableDocs.map(doc => (
                                <label key={doc.id} className="doc-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.docIds.includes(doc.id)}
                                        onChange={() => handleDocToggle(doc.id)}
                                    />
                                    {doc.title || doc.filename}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="query-options">
                    <label className="streaming-toggle">
                        <input
                            type="checkbox"
                            checked={isStreaming}
                            onChange={handleStreamingToggle}
                        />
                        Respuesta en streaming
                    </label>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Procesando...' : 'Enviar consulta'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {answer && (
                <div className="response-section">
                    <h3>Respuesta:</h3>
                    <div className="answer">
                        {answer.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                    
                    {!isStreaming && sources.length > 0 && (
                        <div className="sources">
                            <h3>Fuentes:</h3>
                            <ul>
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <strong>{source.title}</strong>
                                        <p>{source.snippet}</p>
                                        <small>Relevancia: {Math.round(source.score * 100)}%</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RagQuery;