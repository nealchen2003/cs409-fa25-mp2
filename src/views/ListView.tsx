import React, { useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListResult } from '../types';
import { FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import './ListView.css';

interface ListViewProps {
    allPokemonRefs: PokemonListResult[];
    pokemonOnPage: Pokemon[];
    setPokemonOnPage: React.Dispatch<React.SetStateAction<Pokemon[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    sortKey: 'name' | 'id';
    setSortKey: React.Dispatch<React.SetStateAction<'name' | 'id'>>;
    sortOrder: 'asc' | 'desc';
    setSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const ListView: React.FC<ListViewProps> = ({
    allPokemonRefs,
    pokemonOnPage,
    setPokemonOnPage,
    isLoading,
    setIsLoading,
    searchTerm,
    setSearchTerm,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
}) => {
    const ITEMS_PER_PAGE = 50;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, setCurrentPage]);

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
            if (filteredAndSortedPokemonRefs.length === 0 && searchTerm) {
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

        if (allPokemonRefs.length > 0) {
            fetchPageDetails();
        }
    }, [filteredAndSortedPokemonRefs, currentPage, allPokemonRefs.length, setPokemonOnPage, setIsLoading, searchTerm]);

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