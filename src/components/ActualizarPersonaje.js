import React, { useState, useEffect } from 'react';
import { getPersonajeById, updatePersonaje } from '../api';

function ActualizarPersonaje() {
    const [idActualizar, setIdActualizar] = useState('');
    const [personaje, setPersonaje] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(null);

    const handleIdChange = (e) => {
        setIdActualizar(e.target.value);
        setPersonaje(null);
        setMensaje('');
        setError(null);
    };

    const handleInputChange = (e) => {
        setPersonaje({ ...personaje, [e.target.name]: e.target.value });
    };

    const buscarPersonaje = async () => {
        try {
            const data = await getPersonajeById(idActualizar);
            setPersonaje(data);
            setError(null);
        } catch (error) {
            setError(error.message);
            setPersonaje(null);
            setMensaje('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (personaje) {
            try {
                const response = await updatePersonaje(idActualizar, personaje);
                setMensaje(response.mensaje);
                setError(null);
            } catch (error) {
                setError(error.message);
                setMensaje('');
            }
        }
    };

    return (
        <div>
            <h2>Actualizar Personaje</h2>
            <div>
                <label>ID del Personaje a Actualizar:</label>
                <input type="number" value={idActualizar} onChange={handleIdChange} />
                <button onClick={buscarPersonaje}>Buscar</button>
            </div>

            {personaje && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nombre:</label>
                        <input type="text" name="name" value={personaje.name || ''} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={personaje.email || ''} onChange={handleInputChange} required />
                    </div>
                    <button type="submit">Actualizar Personaje</button>
                </form>
            )}

            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}

export default ActualizarPersonaje;