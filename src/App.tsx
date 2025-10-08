import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import ListView from './views/ListView';
import GalleryView from './views/GalleryView';
import DetailView from './views/DetailView';
import Header from './components/Header';
import { Pokemon, PokemonListResult } from './types';
import './App.css';

function App() {
  // State for GalleryView
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [allPokemonCache, setAllPokemonCache] = useState<PokemonListResult[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  // State for ListView
  const [allPokemonRefs, setAllPokemonRefs] = useState<PokemonListResult[]>([]);
  const [pokemonOnPage, setPokemonOnPage] = useState<Pokemon[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const countResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1');
            const count = countResponse.data.count;
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${count}`);
            const results: PokemonListResult[] = response.data.results.map((p: any) => {
                const urlParts = p.url.split('/');
                const id = parseInt(urlParts[urlParts.length - 2]);
                return { name: p.name, url: p.url, id: id };
            });
            setAllPokemonCache(results);
            setAllPokemonRefs(results);

            const typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
            const commonTypes = typesResponse.data.results
                .map((t: { name: string }) => t.name)
                .filter((t: string) => !['unknown', 'shadow'].includes(t));
            setAllTypes(commonTypes);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };
    fetchInitialData();
  }, []);

  return (
    <BrowserRouter basename="cs409-fa25-mp2">
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={
              <ListView 
                allPokemonRefs={allPokemonRefs}
                pokemonOnPage={pokemonOnPage}
                setPokemonOnPage={setPokemonOnPage}
                isLoading={isListLoading}
                setIsLoading={setIsListLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortKey={sortKey}
                setSortKey={setSortKey}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            } />
            <Route path="/gallery" element={
              <GalleryView 
                pokemonList={pokemonList}
                setPokemonList={setPokemonList}
                allPokemonCache={allPokemonCache}
                filteredPokemon={filteredPokemon}
                setFilteredPokemon={setFilteredPokemon}
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                offset={offset}
                setOffset={setOffset}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                allTypes={allTypes}
              />
            } />
            <Route path="/pokemon/:id" element={<DetailView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
