import React, { useState } from 'react';
import { deletePersonaje } from '../api';

function EliminarPersonaje() {
    const [idEliminar, setIdEliminar] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setIdEliminar(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await deletePersonaje(idEliminar);
            setMensaje(response.message);
            setError(null);
            setIdEliminar('');
        } catch (error) {
            setError(error.message);
            setMensaje('');
        }
    };

    return (
        <div>
            <h2>Eliminar Personaje</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ID del Personaje a Eliminar:</label>
                    <input type="number" value={idEliminar} onChange={handleChange} required />
                </div>
                <button type="submit">Eliminar Personaje</button>
            </form>
            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}

export default EliminarPersonaje;