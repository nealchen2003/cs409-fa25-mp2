import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Pokemon } from '../types';

const DetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const pokemonId = parseInt(id!, 10);

    useEffect(() => {
        if (isNaN(pokemonId)) return;
        const fetchPokemon = async () => {
            try {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                setPokemon(response.data);
            } catch (error) {
                console.error('Error fetching Pokémon details:', error);
                setPokemon(null);
            }
        };
        fetchPokemon();
    }, [pokemonId]);

    const goToPokemon = (newId: number) => {
        if (newId > 0 && newId <= 151) {
            navigate(`/pokemon/${newId}`);
        }
    };

    if (!pokemon) {
        return <div>Loading... or Pokémon not found</div>;
    }

    return (
        <div className="detail-view">
            <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <p>Height: {pokemon.height}</p>
            <p>Weight: {pokemon.weight}</p>
            <p>Types: {pokemon.types.map(t => t.type.name).join(', ')}</p>
            <div>
                <button onClick={() => goToPokemon(pokemonId - 1)} disabled={pokemonId <= 1}>Previous</button>
                <button onClick={() => goToPokemon(pokemonId + 1)} disabled={pokemonId >= 151}>Next</button>
            </div>
        </div>
    );
};

export default DetailView;