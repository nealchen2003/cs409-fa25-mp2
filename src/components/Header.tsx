import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, matchPath } from 'react-router-dom';
import { FaList, FaTh } from 'react-icons/fa';
import axios from 'axios';
import './Header.css';

const Header: React.FC = () => {
    const [top, setTop] = useState(true);
    const [title, setTitle] = useState('Pokémon');
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setTop(window.scrollY <= 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (window.innerWidth < 768) {
            setTitle('Pokémon');
            return;
        }
        const match = matchPath('/pokemon/:id', location.pathname);
        if (match) {
            const pokemonId = match.params.id;
            axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
                .then(response => {
                    const pokemonName = response.data.name;
                    setTitle(`Pokémon - ${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}`);
                })
                .catch(error => {
                    console.error('Error fetching Pokémon name:', error);
                    setTitle('Pokémon');
                });
        } else if (location.pathname === '/gallery') {
            setTitle('Pokémon Gallery');
        } else if (location.pathname === '/') {
            setTitle('Pokémon List');
        } else {
            setTitle('Pokémon');
        }
    }, [location]);

    return (
        <header className={`app-header ${top ? 'top' : ''}`}>
            <span className="header-content">
                <Link to="/" title="Homepage" className="app-title">
                    <h1>{title}</h1>
                </Link>
                <nav>
                    <NavLink to="/" title="List View" className="nav-icon">
                        <FaList />
                        <span className="nav-text">List</span>
                    </NavLink>
                    <NavLink to="/gallery" title="Gallery View" className="nav-icon">
                        <FaTh />
                        <span className="nav-text">Gallery</span>
                    </NavLink>
                </nav>
            </span>
        </header>
    );
};

export default Header;
