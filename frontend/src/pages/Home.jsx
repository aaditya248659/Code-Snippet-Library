import React, { useState, useEffect } from "react";
import { snippetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchFilter from '../components/SearchFilter';
import SnippetCard from '../components/SnippetCard';
import { toast } from 'react-toastify';

const Home = () => {
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ lang: '', tag: '', search: ''});
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchSnippets();
    }, [filters]);

    const fetchSnippets = async () => {
        setLoading(true);
        try {
            const response = await snippetsAPI.getAllSnippets(filters);
            setSnippets(response.data.snippets);
        } catch (error) {
            toast.error('Failed to fetch snippets');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchTerm) => {
        setFilters({ ...filters, search: searchTerm });
    };

    const handleFilter = ({ lang, tag }) => {
        setFilters({ ...filters, lang, tag });
    };

    const handleUpvote = async (snippetId) => {
        try {
            const response = await snippetsAPI.upvoteSnippet(snippetId);
            // Update the snippet in the list
            setSnippets(snippets.map(snippet => 
                snippet._id === snippetId
                ? { ...snippet, upvotes: response.data.upvotes }
                : snippet
            ));
            toast.success('Vote updated!');
        } catch (error) {
            toast.error('Failed to upvote snippet');
            console.error(error);
        }
    };

        const handleDelete = async (snippetId) => {
            try {
                await snippetsAPI.deleteSnippet(snippetId);
                setSnippets(snippets.filter(s => s._id !== snippetId));
                toast.success('Snippet deleted');
            } catch (error) {
                toast.error('Failed to delete snippet');
                console.error(error);
            }
        };

    return (
        <div className="container home-page">
            <div className="hero-section">
                <h1 className="hero-title">Code Snippet Library</h1>
                <p className="hero-subtitle">
                    A community-driven platform for simple, beginner-friendly code snippets
                </p>
            </div>

            <SearchFilter onSearch={handleSearch} onFilter={handleFilter}/>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading snippets...</p>
                </div>
            ) : snippets.length === 0 ? (
                <div className="no-results">
                    <h2>No snippets found</h2>
                    <p>Try adjusting your filters or be the first to submit one!</p>
                </div>
            ) : (
                <div className="snippets-grid">
                    {snippets.map((snippet) => (
                        <SnippetCard 
                            key={snippet._id}
                            snippet={snippet}
                            onUpvote={handleUpvote}
                                isAuthenticated={isAuthenticated}
                                onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;