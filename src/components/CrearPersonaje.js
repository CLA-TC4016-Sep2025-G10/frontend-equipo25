import React, { useState } from 'react';
import { createPersonaje } from '../api';

function CrearPersonaje() {
    const [nuevoPersonaje, setNuevoPersonaje] = useState({ id: '', name: '', email: '' });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setNuevoPersonaje({ ...nuevoPersonaje, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createPersonaje(nuevoPersonaje);
            setMensaje(response.mensaje);
            setError(null);
            setNuevoPersonaje({ id: '', name: '', email: '' }); // Limpiar el formulario
        } catch (error) {
            setError(error.message);
            setMensaje('');
        }
    };

    return (
        <div>
            <h2>Crear Nuevo Personaje</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ID:</label>
                    <input type="number" name="id" value={nuevoPersonaje.id} onChange={handleChange} required />
                </div>
                <div>
                    <label>Nombre:</label>
                    <input type="text" name="name" value={nuevoPersonaje.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={nuevoPersonaje.email} onChange={handleChange} required />
                </div>
                <button type="submit">Crear Personaje</button>
            </form>
            {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}

export default CrearPersonaje;