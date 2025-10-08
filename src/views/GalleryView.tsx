import React, { useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListResult } from '../types';
import './GalleryView.css';

interface GalleryViewProps {
    pokemonList: Pokemon[];
    setPokemonList: React.Dispatch<React.SetStateAction<Pokemon[]>>;
    allPokemonCache: PokemonListResult[];
    filteredPokemon: Pokemon[];
    setFilteredPokemon: React.Dispatch<React.SetStateAction<Pokemon[]>>;
    selectedTypes: string[];
    setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
    offset: number;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    allTypes: string[];
}

const GalleryView: React.FC<GalleryViewProps> = ({
    pokemonList,
    setPokemonList,
    allPokemonCache,
    filteredPokemon,
    setFilteredPokemon,
    selectedTypes,
    setSelectedTypes,
    offset,
    setOffset,
    isLoading,
    setIsLoading,
    allTypes,
}) => {
    const limit = 20;

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
        if (pokemonList.length === 0 && selectedTypes.length === 0) {
            fetchPokemon(0);
        }
    }, [pokemonList.length, selectedTypes.length]);

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
    }, [selectedTypes, allPokemonCache, pokemonList, setFilteredPokemon, setIsLoading]);

    const handleTypeChange = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const displayList = selectedTypes.length > 0 ? filteredPokemon : pokemonList;

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
                {displayList.map(pokemon => (
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