import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListResult } from '../types';
import './GalleryView.css';

const GalleryView: React.FC = () => {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [allPokemonCache, setAllPokemonCache] = useState<PokemonListResult[]>([]);
    const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const limit = 20;

    const [allTypes, setAllTypes] = useState<string[]>([]);

    useEffect(() => {
        const fetchAllPokemonReferences = async () => {
            try {
                const countResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1');
                const count = countResponse.data.count;
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
                setAllPokemonCache(response.data.results);
            } catch (error) {
                console.error('Error fetching all pokemon references:', error);
            }
        };
        fetchAllPokemonReferences();

        const fetchAllTypes = async () => {
            try {
                const response = await axios.get('https://pokeapi.co/api/v2/type');
                const commonTypes = response.data.results
                    .map((t: { name: string }) => t.name)
                    .filter((t: string) => !['unknown', 'shadow'].includes(t));
                setAllTypes(commonTypes);
            } catch (error) {
                console.error('Error fetching all pokemon types:', error);
            }
        };
        fetchAllTypes();
    }, []);

    const fetchPokemon = async (currentOffset: number) => {
        if (isLoading || selectedTypes.length > 0) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`);
            const results: PokemonListResult[] = response.data.results;

            const pokemonDetails = await Promise.all(
                results.map(p => axios.get(p.url).then(res => res.data))
            );
            
            setPokemonList(prevList => {
                const existingIds = new Set(prevList.map(p => p.id));
                const newPokemon = pokemonDetails.filter(p => !existingIds.has(p.id));
                return [...prevList, ...newPokemon];
            });
            setOffset(currentOffset + limit);
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPokemon(0);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 100 || isLoading || selectedTypes.length > 0) {
                return;
            }
            fetchPokemon(offset);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [offset, isLoading, selectedTypes.length]);

    useEffect(() => {
        const abortController = new AbortController();

        const filterPokemon = async () => {
            if (selectedTypes.length === 0) {
                setFilteredPokemon(pokemonList);
                return;
            }

            setIsLoading(true);
            try {
                // Fetch details for all pokemon of the selected types
                const typePromises = selectedTypes.map(type => 
                    axios.get(`https://pokeapi.co/api/v2/type/${type}`, { signal: abortController.signal })
                );
                const typeResponses = await Promise.all(typePromises);
                
                // Find the intersection of pokemon from all selected types
                let pokemonNames = typeResponses.map(res => 
                    new Set(res.data.pokemon.map((p: { pokemon: { name: string } }) => p.pokemon.name))
                );
                
                if (pokemonNames.length === 0) {
                    setFilteredPokemon([]);
                    return;
                }

                let intersection = new Set(pokemonNames[0]);
                for (let i = 1; i < pokemonNames.length; i++) {
                    intersection = new Set(Array.from(intersection).filter(name => pokemonNames[i].has(name)));
                }

                const filteredResults = allPokemonCache.filter(p => intersection.has(p.name));

                const pokemonDetails = await Promise.all(
                    filteredResults.map(p => axios.get(p.url, { signal: abortController.signal }).then(res => res.data))
                );
                setFilteredPokemon(pokemonDetails);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request canceled:', error.message);
                } else {
                    console.error('Error fetching filtered Pokémon:', error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        filterPokemon();

        return () => {
            abortController.abort();
        };
    }, [selectedTypes, allPokemonCache, pokemonList]);

    const handleTypeChange = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <div className="gallery-view">
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