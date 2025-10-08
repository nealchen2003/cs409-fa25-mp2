import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListResult } from '../types';
import { FaAngleLeft, FaAngleRight, FaSearch, FaTruckLoading } from 'react-icons/fa';
import './ListView.css';

const ListView: React.FC = () => {
    const [allPokemonRefs, setAllPokemonRefs] = useState<PokemonListResult[]>([]);
    const [pokemonOnPage, setPokemonOnPage] = useState<Pokemon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<'name' | 'id'>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    useEffect(() => {
        const fetchAllPokemonRefs = async () => {
            try {
                // First, get the count of all pokemon
                const countResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1');
                const count = countResponse.data.count;

                // Then, fetch the full list
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
                const results: PokemonListResult[] = response.data.results.map((p: any) => {
                    const urlParts = p.url.split('/');
                    const id = parseInt(urlParts[urlParts.length - 2]);
                    return {
                        name: p.name,
                        url: p.url,
                        id: id
                    };
                });
                setAllPokemonRefs(results);
            } catch (error) {
                console.error('Error fetching Pokémon list:', error);
            }
        };
        fetchAllPokemonRefs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSort = (key: 'name' | 'id') => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedPokemonRefs = useMemo(() => {
        return allPokemonRefs
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                const aValue = a[sortKey];
                const bValue = b[sortKey];
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [allPokemonRefs, searchTerm, sortKey, sortOrder]);

    useEffect(() => {
        const fetchPageDetails = async () => {
            if (filteredAndSortedPokemonRefs.length === 0) {
                setPokemonOnPage([]);
                return;
            };

            setIsLoading(true);
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const refsForPage = filteredAndSortedPokemonRefs.slice(startIndex, endIndex);

            try {
                const pokemonDetails = await Promise.all(
                    refsForPage.map(p => axios.get(p.url).then(res => res.data))
                );
                setPokemonOnPage(pokemonDetails);
            } catch (error) {
                console.error('Error fetching Pokémon details for page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPageDetails();
    }, [filteredAndSortedPokemonRefs, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedPokemonRefs.length / ITEMS_PER_PAGE);

    return (
        <div className="list-view">
            <div className="list-controls">
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search Pokémon"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="list-header">
                <div className="list-header-item id-column" onClick={() => handleSort('id')}>
                    ID {sortKey === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
                <div className="list-header-item name-column" onClick={() => handleSort('name')}>
                    Name {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
            </div>
            <div className="list-body">
                {isLoading && (
                    <div className="loading-indicator">
                        Loading Pokémon...
                    </div>
                )}
                <ul className="pokemon-list">
                    {pokemonOnPage.map(pokemon => (
                        <li key={pokemon.id} className="list-item">
                            <Link to={`/pokemon/${pokemon.id}`} className="list-item-link">
                                <span className="pokemon-id id-column">#{pokemon.id.toString().padStart(3, '0')}</span>
                                <span className="pokemon-name name-column">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="pagination-controls">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                >
                    <FaAngleLeft/>
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <FaAngleRight/>
                </button>
            </div>
        </div>
    );
};

export default ListView;