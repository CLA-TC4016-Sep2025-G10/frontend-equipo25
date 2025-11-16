import React, { useContext, useEffect, useMemo, useState } from 'react';
import MenuSidebar from './MenuPage';
import { AuthContext } from '../contexts/AuthContext';

const roleOptions = ['Administrador', 'Legal', 'Finanzas', 'Recursos Humanos'];

const UsersPage = () => {
  const { token } = useContext(AuthContext) || {};
  const usersApiBase = process.env.REACT_APP_USERS_API_BASE_URL || process.env.REACT_APP_DOCS_API_BASE_URL || 'http://localhost:5001';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editRole, setEditRole] = useState(roleOptions[0]);
  const [editStatus, setEditStatus] = useState(1);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [search, setSearch] = useState('');

  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createNombre, setCreateNombre] = useState('');
  const [createRole, setCreateRole] = useState(roleOptions[0]);
  const [createUsername, setCreateUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState(0);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getUserId = (u) => u?.id ?? u?._id ?? u?.userId ?? u?.uuid ?? u?.uid ?? null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch(`${usersApiBase}/usuarios`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!resp.ok) {
          const t = await resp.text().catch(() => '');
          throw new Error(t || 'Error al cargar usuarios');
        }
        const data = await resp.json();
        const isObj = data && typeof data === 'object' && !Array.isArray(data);
        const statusField = isObj ? data.status : undefined;
        const statusOk = statusField === undefined ? true : (statusField === 1 || statusField === true || statusField === 'ok' || statusField === 'success');
        if (!statusOk) {
          throw new Error((isObj && (data.message || data.detail)) || 'Servicio devolvió estado no exitoso');
        }
        const container = isObj ? (data.data || data.items || data.results || data.usuarios) : null;
        const list = Array.isArray(data) ? data : (Array.isArray(container) ? container : []);
        const normalized = list.map((u) => ({
          id: u.id ?? u._id ?? u.userId ?? u.uuid ?? u.uid,
          nombre: u.nombre,
          role: u.role,
          username: u.username,
          status: u.status ?? u.estatus
          // contrasena NO se usa
        }));
        if (!cancelled) setUsers(normalized);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar usuarios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [usersApiBase, token]);

  const openEdit = (user) => {
    setEditingUser(user);
    setEditNombre(user.nombre || '');
    setEditRole(user.role || roleOptions[0]);
    setEditStatus(user.status ? 1 : 0);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setEditNombre('');
    setEditRole(roleOptions[0]);
    setEditStatus(1);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    const id = getUserId(editingUser);
    if (!id) return window.alert('Id de usuario inválido');
    setSaving(true);
    try {
      const resp = await fetch(`${usersApiBase}/usuarios/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nombre: editNombre,
          role: editRole,
          status: editStatus
        })
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        throw new Error(t || 'Error al actualizar usuario');
      }
      setUsers((prev) => prev.map((u) => getUserId(u) === id ? { ...u, nombre: editNombre, role: editRole, status: editStatus } : u));
      setToastMsg('Usuario actualizado correctamente.');
      setTimeout(() => setToastMsg(''), 3000);
      closeModal();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setCreateNombre('');
    setCreateRole(roleOptions[0]);
    setCreateUsername('');
    setCreateStatus(0);
    setIsCreateOpen(true);
  };
  const closeCreate = () => {
    setIsCreateOpen(false);
    setCreating(false);
  };
  const saveCreate = async () => {
    if (!createNombre || !createUsername) {
      return window.alert('Nombre y usuario son obligatorios.');
    }
    setCreating(true);
    try {
      const resp = await fetch(`${usersApiBase}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          nombre: createNombre,
          role: createRole,
          username: createUsername,
          status: createStatus
        })
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        throw new Error(t || 'Error al crear usuario');
      }
      const createdResp = await resp.json().catch(() => null);
      const created = createdResp && typeof createdResp === 'object' && !Array.isArray(createdResp)
        ? (createdResp.data || createdResp.user || createdResp.usuario || createdResp)
        : createdResp;
      const id = getUserId(created) || created?.id || Date.now();
      const newUser = { id, nombre: createNombre, role: createRole, username: createUsername, status: createStatus };
      setUsers((prev) => [newUser, ...prev]);
      setToastMsg('Usuario creado correctamente.');
      setTimeout(() => setToastMsg(''), 3000);
      closeCreate();
    } catch (e) {
      window.alert(e.message);
      setCreating(false);
    }
  };

  const openDelete = (user) => {
    setDeletingUser(user);
    setIsDeleteOpen(true);
  };
  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeleting(false);
    setDeletingUser(null);
  };
  const confirmDelete = async () => {
    if (!deletingUser) return;
    const id = getUserId(deletingUser);
    if (!id) return window.alert('Id de usuario inválido');
    setDeleting(true);
    try {
      const resp = await fetch(`${usersApiBase}/usuarios/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        throw new Error(t || 'Error al eliminar usuario');
      }
      setUsers((prev) => prev.filter((u) => getUserId(u) !== id));
      setToastMsg('Usuario eliminado correctamente.');
      setTimeout(() => setToastMsg(''), 3000);
      closeDelete();
    } catch (e) {
      window.alert(e.message);
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="page-with-sidebar fixed-page">
      <MenuSidebar />
      <section className="main-content">
        <h1>Usuarios</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o rol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="select-control"
            style={{ width: '66%', maxWidth: 'none' }}
          />
          <button className="btn-primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>Nuevo usuario</button>
        </div>
        {loading && <div className="callout">Cargando usuarios…</div>}
        {error && <div className="callout error">No se pudo cargar: {error}</div>}
        {toastMsg && (
          <div className="toast-container">
            <div className="toast success">{toastMsg}</div>
          </div>
        )}
        <div className="table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={getUserId(u) || u.username}>
                  <td>{u.nombre}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: u.status ? '#10b981' : '#ef4444'
                        }}
                        aria-label={u.status ? 'Activo' : 'Inactivo'}
                      />
                      <span className="muted">{u.status ? 'Activo' : 'Inactivo'}</span>
                    </span>
                  </td>
                  <td className="table-actions">
                    <button type="button" onClick={() => openEdit(u)} style={{ marginRight: 8 }}>✏️</button>
                    <button type="button" onClick={() => openDelete(u)} style={{ color: '#ef4444' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Editar usuario</h2>
                <button className="modal-close" onClick={closeModal} aria-label="Cerrar">✖</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <label>Nombre</label>
                  <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Rol</label>
                  <select
                    className="select-control"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>Status</label>
                  <select
                    className="select-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(Number(e.target.value))}
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Usuario (solo lectura)</label>
                  <input type="text" value={editingUser?.username || ''} disabled />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancelar</button>
                <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isCreateOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Nuevo usuario</h2>
                <button className="modal-close" onClick={closeCreate} aria-label="Cerrar">✖</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <label>Nombre</label>
                  <input type="text" value={createNombre} onChange={(e) => setCreateNombre(e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Usuario</label>
                  <input type="text" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Rol</label>
                  <select
                    className="select-control"
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                  >
                    {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>Status</label>
                  <select
                    className="select-control"
                    value={createStatus}
                    onChange={(e) => setCreateStatus(Number(e.target.value))}
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeCreate} disabled={creating}>Cancelar</button>
                <button className="btn-primary" onClick={saveCreate} disabled={creating}>
                  {creating ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Eliminar usuario</h2>
                <button className="modal-close" onClick={closeDelete} aria-label="Cerrar">✖</button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar “{deletingUser?.nombre}” ({deletingUser?.username})?</p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={closeDelete} disabled={deleting}>Cancelar</button>
                <button className="btn-primary" onClick={confirmDelete} disabled={deleting} style={{ background: '#ef4444', color: '#fff' }}>
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UsersPage;


