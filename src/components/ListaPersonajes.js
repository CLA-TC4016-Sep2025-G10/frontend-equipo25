import React, { useState, useEffect } from 'react';
import { getAllPersonajes } from '../api';

function ListaPersonajes() {
    const [personajes, setPersonajes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPersonajes = async () => {
            try {
                const data = await getAllPersonajes();
                setPersonajes(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchPersonajes();
    }, []);

    if (loading) {
        return <p>Cargando personajes...</p>;
    }

    if (error) {
        return <p>Error al cargar personajes: {error}</p>;
    }

    return (
        <div>
            <h2>Lista de Personajes</h2>
            {personajes.length > 0 ? (
                <ul>
                    {personajes.map(personaje => (
                        <li key={personaje.id}>
                            ID: {personaje.id}, Nombre: {personaje.name}, Email: {personaje.email}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay personajes registrados.</p>
            )}
        </div>
    );
}

export default ListaPersonajes;