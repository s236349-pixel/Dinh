import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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

  // Thêm sinh viên mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, name, email })
      });
      if (response.ok) {
        setStudentId('');
        setName('');
        setEmail('');
        fetchStudents();
      }
    } catch (err) {
      console.error('Lỗi khi thêm sinh viên:', err);
    }
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error('Lỗi khi xóa sinh viên:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Quản lý Sinh viên MERN Stack</h2>
      
      {/* Form thêm sinh viên */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
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
        <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Thêm sinh viên</button>
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