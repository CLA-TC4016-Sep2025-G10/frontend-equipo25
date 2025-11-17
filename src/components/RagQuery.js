import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import MenuSidebar from './MenuPage';
import { listDocuments, queryRag, streamRagQuery } from '../api';

const RagQuery = () => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [sources, setSources] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ tags: [], docIds: [] });
    const [availableDocs, setAvailableDocs] = useState([]);
    const [availableTags, setAvailableTags] = useState(new Set());
    const { token } = useContext(AuthContext);
    const messagesRef = useRef(null);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const data = await listDocuments(token);
                const items = data.items || [];
                setAvailableDocs(items);
                const tags = new Set();
                items.forEach(doc => {
                    if (doc.tags) {
                        doc.tags.forEach(tag => tags.add(tag));
                    }
                });
                setAvailableTags(tags);
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
        setSources([]);
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!question.trim()) return;
        setError('');
        setIsLoading(true);
        setSources([]);

        // push user message
        setMessages(prev => [...prev, { sender: 'user', text: question }]);
        const userQuestion = question;
        setQuestion('');

        const queryData = {
            question: userQuestion,
            topK: 5,
            filters: {
                tags: filters.tags.length > 0 ? filters.tags : undefined,
                docIds: filters.docIds.length > 0 ? filters.docIds : undefined
            },
            returnSources: true
        };

        try {
            if (isStreaming) {
                // add placeholder assistant message
                setMessages(prev => [...prev, { sender: 'assistant', text: '' }]);

                const response = await streamRagQuery(queryData, token);

                if (!response.ok) throw new Error('Query error');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    setMessages(prev => {
                        const copy = [...prev];
                        const last = copy.length - 1;
                        if (last >= 0 && copy[last].sender === 'assistant') {
                            copy[last] = { ...copy[last], text: (copy[last].text || '') + chunk };
                        }
                        return copy;
                    });
                }
            } else {
                const data = await queryRag(queryData, token);
                setMessages(prev => [...prev, { sender: 'assistant', text: data.answer || '' }]);
                
                // Format sources from backend response
                if (data.sources && Array.isArray(data.sources)) {
                    const formattedSources = data.sources.map((source, idx) => ({
                        title: typeof source === 'string' ? source : (source.title || source.filename || `Document ${idx + 1}`),
                        snippet: typeof source === 'string' ? '' : (source.snippet || source.content || ''),
                        score: typeof source === 'string' ? null : (source.score || source.confidence || data.confidence)
                    }));
                    setSources(formattedSources);
                }
            }
        } catch (err) {
            setError('Error processing query: ' + err.message);
            setMessages(prev => [...prev, { sender: 'assistant', text: 'Error: ' + err.message }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, 50);
        }
    };

    return (
        <div className="page-with-sidebar fixed-page">
            <MenuSidebar />
            <section className="rag-experience main-content">
                <header className="rag-hero">
                    <div>
                        <p className="rag-eyebrow">Conversational Search</p>
                        <h1>SecureRAG Assistant</h1>
                        <p className="rag-subtitle">
                            Ask natural questions and the assistant will respond using your uploaded knowledge base,
                            surfacing sources for every answer.
                        </p>
                    </div>
                    <div className="rag-meta">
                        <div>
                            <span>Streaming</span>
                            <label className="switch">
                                <input type="checkbox" checked={isStreaming} onChange={handleStreamingToggle} />
                                <span className="slider" />
                            </label>
                        </div>
                        <div>
                            <span>Filters</span>
                            <strong>{filters.tags.length + filters.docIds.length}</strong>
                        </div>
                    </div>
                </header>

                <div className="rag-grid">
                    <div className="rag-chat-panel">
                        <div className="rag-messages" ref={messagesRef}>
                            {messages.length === 0 && !isLoading ? (
                                <div className="rag-empty">
                                    <h3>Start the conversation</h3>
                                    <p>Ask about procedures, policies, or any document you have uploaded.</p>
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <div key={i} className={`chat-message ${m.sender}`}>
                                        <div className="avatar">{m.sender === 'user' ? 'You' : 'AI'}</div>
                                        <div className="bubble">{m.text}</div>
                                    </div>
                                ))
                            )}
                            {isLoading && <div className="chat-message assistant"><div className="avatar">AI</div><div className="bubble">...</div></div>}
                        </div>

                        {error && <div className="callout error">{error}</div>}

                        {sources && sources.length > 0 && (
                            <div className="rag-sources">
                                <h3>Sources</h3>
                                <ul>
                                    {sources.map((source, idx) => (
                                        <li key={idx}>
                                            <strong>{source.title}</strong>
                                            <p>{source.snippet}</p>
                                            {typeof source.score === 'number' && (
                                                <small>Relevance: {Math.round(source.score * 100)}%</small>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="rag-input">
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask anything about your documents..."
                                rows={2}
                            />
                            <div className="input-actions">
                                <span className="hint">Shift + Enter for newline</span>
                                <button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send'}</button>
                            </div>
                        </form>
                    </div>

                    <aside className="rag-aside">
                        <div className="rag-card">
                            <h3>Tag filters</h3>
                            <div className="chip-grid">
                                {Array.from(availableTags).map(tag => (
                                    <label key={tag} className={`chip ${filters.tags.includes(tag) ? 'selected' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={filters.tags.includes(tag)}
                                            onChange={() => handleTagToggle(tag)}
                                        />
                                        {tag}
                                    </label>
                                ))}
                                {availableTags.size === 0 && <p className="muted small">No tags detected yet.</p>}
                            </div>
                        </div>

                        <div className="rag-card">
                            <h3>Documents</h3>
                            <div className="docs-scroll">
                                {availableDocs.map(doc => (
                                    <label key={doc.id} className={`doc-item ${filters.docIds.includes(doc.id) ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={filters.docIds.includes(doc.id)}
                                            onChange={() => handleDocToggle(doc.id)}
                                        />
                                        <div>
                                            <strong>{doc.title || doc.filename}</strong>
                                            {doc.tags && (
                                                <p>{doc.tags.join(', ')}</p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                                {availableDocs.length === 0 && <p className="muted small">No documents available.</p>}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
}

export default RagQuery;


