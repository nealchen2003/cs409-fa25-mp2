export interface Pokemon {
    id: number;
    name: string;
    sprites: {
        front_default: string;
    };
    types: {
        type: {
            name: string;
        }
    }[];
    height: number;
    weight: number;
}

export interface PokemonListResult {
    name: string;
    url: string;
}