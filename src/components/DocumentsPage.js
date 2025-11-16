import React, { useContext, useEffect, useMemo, useState } from 'react';
import MenuSidebar from './MenuPage';
import { AuthContext } from '../contexts/AuthContext';

const initialDocuments = [
  {
    id: '1',
    name: 'Contrato-Proveedor.pdf',
    description: 'Se detectó la cláusula de incumplimiento',
    createdAt: 'Nov 15, 2025',
    createdBy: 'Juan Pérez',
    status: 'Inactivo',
    roles: ['Administrador', 'Legal']
  },
  {
    id: '2',
    name: 'Estado-Financiero.xlsx',
    description: 'Coincidencia con cuenta de resultados',
    createdAt: 'Nov 15, 2025',
    createdBy: 'María López',
    status: 'Inactivo',
    roles: ['Administrador', 'Finanzas']
  },
  {
    id: '3',
    name: 'Manual-Empleado.docx',
    description: 'Referencia al programa de capacitación',
    createdAt: 'Nov 15, 2025',
    createdBy: 'Carlos Ruiz',
    status: 'Inactivo',
    roles: ['Recursos Humanos']
  },
  {
    id: '4',
    name: 'Infografía 1_A01796607.pdf',
    description: 'test',
    createdAt: 'Nov 15, 2025',
    createdBy: 'sheva9sof@gmail.com',
    status: 'Activo',
    roles: []
  }
];

const StatusDot = ({ status }) => {
  let color = '#ef4444'; // Inactivo por defecto
  if (status === 'Activo') color = '#10b981';
  else if (status === 'Archivado') color = '#f59e0b';
  else if (status === 'Pendiente') color = '#3b82f6';
  const label = status;
  return (
  <span
    style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: color
    }}
    aria-label={label}
  />
);
};

const Pill = ({ children }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 999,
      background: '#eef2ff',
      color: '#4338ca',
      fontSize: 12,
      fontWeight: 600,
      marginRight: 6
    }}
  >
    {children}
  </span>
);

const DocumentsPage = () => {
  const [documents, setDocuments] = useState(initialDocuments);
  const roleOptions = useMemo(
    () => ['Administrador', 'Legal', 'Finanzas', 'Recursos Humanos'],
    []
  );
  const getDocId = (d) => d?.id ?? d?._id ?? d?.documentId ?? d?.uuid ?? d?.uid ?? null;
  const { token } = useContext(AuthContext) || {};
  const docsApiBase = process.env.REACT_APP_DOCS_API_BASE_URL || 'http://127.0.0.1:5001';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editRoles, setEditRoles] = useState([]);
  const [editStatus, setEditStatus] = useState('Activo');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load documents from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await fetch(`${docsApiBase}/documentos`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!response.ok) {
          const text = await response.text().catch(() => '');
          throw new Error(text || 'Error al cargar documentos');
        }
        const data = await response.json();
        if (!cancelled) {
          // Soporte de envolturas con status 1/0 o 'ok'/'error'
          const isObj = data && typeof data === 'object' && !Array.isArray(data);
          const statusField = isObj ? data.status : undefined;
          const statusOk = statusField === undefined ? true : (statusField === 1 || statusField === true || statusField === 'ok' || statusField === 'success');
          if (!statusOk) {
            throw new Error((isObj && (data.message || data.detail)) || 'Servicio devolvió estado no exitoso');
          }
          // Esperamos un arreglo con campos del backend
          const container = isObj ? (data.data || data.items || data.results || data.documentos) : null;
          const list = Array.isArray(data) ? data : (Array.isArray(container) ? container : []);
          const normalized = list.map((item) => ({
            id: item.id ?? item._id ?? item.documentId ?? item.uuid ?? item.uid,
            name: item.nombre_archivo,
            description: item.descripcion,
            createdAt: item.fecha_creacion,
            createdBy: item.creado_por,
            status: item.estatus,
            roles: item.roles_permitidos || []
          }));
          setDocuments(normalized.length ? normalized : initialDocuments);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Error al cargar documentos');
          // keep mock data as fallback
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [docsApiBase, token]);

  const openEdit = (doc) => {
    setEditingDoc(doc);
    setEditDescription(doc.description || '');
    setEditRoles(doc.roles || []);
    setEditStatus(doc.status || 'Activo');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoc(null);
    setEditDescription('');
    setEditRoles([]);
    setEditStatus('Activo');
  };

  const toggleRole = (role) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveEdit = async () => {
    if (!editingDoc) return;
    const docId = getDocId(editingDoc);
    if (!docId) {
      window.alert('No se encontró un identificador válido del documento.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${docsApiBase}/documentos/${encodeURIComponent(docId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          descripcion: editDescription,
          roles_permitidos: editRoles,
          estatus: editStatus
        })
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Error al guardar cambios');
      }
      setDocuments((prev) =>
        prev.map((d) =>
          getDocId(d) === docId ? { ...d, description: editDescription, roles: editRoles, status: editStatus } : d
        )
      );
      setSaveSuccess('Documento actualizado correctamente.');
      setTimeout(() => setSaveSuccess(''), 3000);
      closeModal();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (doc) => {
    setDeletingDoc(doc);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setIsDeleteOpen(false);
    setDeletingDoc(null);
    setDeleting(false);
  };

  const confirmDelete = async () => {
    if (!deletingDoc) return;
    const docId = getDocId(deletingDoc);
    if (!docId) {
      window.alert('No se encontró un identificador válido del documento.');
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`${docsApiBase}/documentos/${encodeURIComponent(docId)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Error al eliminar documento');
      }
      setDocuments((prev) => prev.filter((d) => getDocId(d) !== docId));
      setSaveSuccess('Documento eliminado correctamente.');
      setTimeout(() => setSaveSuccess(''), 3000);
      closeDelete();
    } catch (err) {
      window.alert(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="page-with-sidebar fixed-page">
      <MenuSidebar />
      <section className="main-content">
        <h1>Documentos</h1>
        {loading && <div className="callout">Cargando documentos…</div>}
        {loadError && <div className="callout error">No se pudo cargar: {loadError}</div>}
        {saveSuccess && (
          <div className="toast-container">
            <div className="toast success">{saveSuccess}</div>
          </div>
        )}
        <div className="table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Nombre de archivo</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Creado por</th>
                <th>Estatus</th>
                <th>Roles permitidos</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={getDocId(doc) || doc.name}>
                  <td>{doc.name}</td>
                  <td>{doc.description}</td>
                  <td>
                    <span role="img" aria-label="calendar">📅</span> {doc.createdAt}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#eef2ff',
                      color: '#4338ca',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      <span role="img" aria-label="user">👤</span>
                      {doc.createdBy}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <StatusDot status={doc.status} />
                      <span className="muted">{doc.status}</span>
                    </div>
                  </td>
                  <td>
                    {doc.roles.length ? doc.roles.map((r) => <Pill key={r}>{r}</Pill>) : <span style={{ color: '#6b7280' }}>Sin roles asignados</span>}
                  </td>
                  <td className="table-actions">
                    <button
                      type="button"
                      style={{ marginRight: 8 }}
                      onClick={() => openEdit(doc)}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(doc)}
                      style={{ color: '#ef4444' }}
                    >
                      🗑️
                    </button>
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
                <h2>Editar documento</h2>
                <button className="modal-close" onClick={closeModal} aria-label="Cerrar">✖</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <label>Nombre</label>
                  <input type="text" value={editingDoc?.name || ''} disabled />
                </div>
                <div className="form-row">
                  <label>Descripción</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <label>Estatus</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="select-control"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Archivado">Archivado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Roles permitidos</label>
                  <div className="roles-grid">
                    {roleOptions.map((role) => (
                      <label key={role} className={`role-chip ${editRoles.includes(role) ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={editRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
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

        {isDeleteOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Eliminar documento</h2>
                <button className="modal-close" onClick={closeDelete} aria-label="Cerrar">✖</button>
              </div>
              <div className="modal-body">
                <p>¿Seguro que deseas eliminar “{deletingDoc?.name}”?</p>
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

export default DocumentsPage;


