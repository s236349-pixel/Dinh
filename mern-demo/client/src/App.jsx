import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Lấy danh sách sinh viên từ Backend API
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setStudentId('');
    setName('');
    setEmail('');
    setEditingStudentId(null);
  };

  // Thêm hoặc cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { studentId, name, email };
      const url = editingStudentId ? `/api/students/${editingStudentId}` : '/api/students';
      const method = editingStudentId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        resetForm();
        fetchStudents();
      }
    } catch (err) {
      console.error('Lỗi khi lưu sinh viên:', err);
    }
  };

  // Chỉnh sửa sinh viên
  const handleEdit = (student) => {
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);
    setEditingStudentId(student._id);
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
      if (editingStudentId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Lỗi khi xóa sinh viên:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Quản lý Sinh viên MERN Stack</h2>
      
      {/* Form thêm/sửa sinh viên */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Mã số sinh viên (MSSV)" 
          value={studentId} 
          onChange={(e) => setStudentId(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" 
          placeholder="Họ tên" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {editingStudentId ? 'Lưu thay đổi' : 'Thêm sinh viên'}
        </button>
        {editingStudentId && (
          <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>
            Hủy
          </button>
        )}
      </form>

      {/* Danh sách sinh viên */}
      <h3>Danh sách sinh viên</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>Chưa có sinh viên nào.</td>
            </tr>
          ) : (
            students.map((st) => (
              <tr key={st._id}>
                <td>{st.studentId}</td>
                <td>{st.name}</td>
                <td>{st.email}</td>
                <td>
                  <button onClick={() => handleEdit(st)} style={{ color: '#0d6efd', border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px' }}>Sửa</button>
                  <button onClick={() => handleDelete(st._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;