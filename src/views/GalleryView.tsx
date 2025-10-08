import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListResult } from '../types';

const GalleryView: React.FC = () => {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const allTypes = useMemo(() => {
        const types = new Set<string>();
        pokemonList.forEach(p => p.types.forEach(t => types.add(t.type.name)));
        return Array.from(types);
    }, [pokemonList]);

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

    const handleTypeChange = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const filteredPokemon = useMemo(() => {
        if (selectedTypes.length === 0) {
            return pokemonList;
        }
        return pokemonList.filter(p =>
            selectedTypes.every(st => p.types.some(pt => pt.type.name === st))
        );
    }, [pokemonList, selectedTypes]);

    return (
        <div>
            <div>
                {allTypes.map(type => (
                    <label key={type}>
                        <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => handleTypeChange(type)}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                ))}
            </div>
            <div className="gallery">
                {filteredPokemon.map(pokemon => (
                    <Link to={`/pokemon/${pokemon.id}`} key={pokemon.id} className="gallery-item">
                        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                        <p>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default GalleryView;