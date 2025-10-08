import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListResult } from '../types';

const ListView: React.FC = () => {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<'name' | 'id'>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
                const results: PokemonListResult[] = response.data.results;
                const pokemonDetails = await Promise.all(
                    results.map(p => axios.get(p.url).then(res => res.data))
                );
                setPokemonList(pokemonDetails);
            } catch (error) {
                console.error('Error fetching Pokémon:', error);
            }
        };
        fetchPokemon();
    }, []);

    const filteredAndSortedPokemon = useMemo(() => {
        return pokemonList
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                const aValue = a[sortKey];
                const bValue = b[sortKey];
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [pokemonList, searchTerm, sortKey, sortOrder]);

    return (
        <div>
            <input
                type="text"
                placeholder="Search Pokémon"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div>
                Sort by:
                <select onChange={e => setSortKey(e.target.value as 'name' | 'id')} value={sortKey}>
                    <option value="id">ID</option>
                    <option value="name">Name</option>
                </select>
                <select onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')} value={sortOrder}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>
            <ul>
                {filteredAndSortedPokemon.map(pokemon => (
                    <li key={pokemon.id}>
                        <Link to={`/pokemon/${pokemon.id}`}>
                            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListView;