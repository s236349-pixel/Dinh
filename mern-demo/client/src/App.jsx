import { useState, useEffect } from 'react';
import './App.css';

// URL Backend API đã deploy trên Render
const API_BASE = 'https://mern-backend-s236349-v1.onrender.com';

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);

  // 1. Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/students`);
      if (!response.ok) throw new Error('Không thể lấy danh sách sinh viên');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Xóa trắng form nhập liệu
  const resetForm = () => {
    setStudentId('');
    setName('');
    setEmail('');
    setEditingStudentId(null);
  };

  // 2. Xử lý Thêm mới hoặc Cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !name || !email) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      if (editingStudentId) {
        // Cập nhật (Sửa)
        const response = await fetch(`${API_BASE}/api/students/${editingStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, name, email }),
        });
        if (response.ok) alert('Cập nhật sinh viên thành công!');
      } else {
        // Thêm mới
        const response = await fetch(`${API_BASE}/api/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, name, email }),
        });
        if (response.ok) alert('Thêm sinh viên thành công!');
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error('Lỗi khi lưu dữ liệu:', err);
      alert('Đã xảy ra lỗi khi lưu!');
    }
  };

  // 3. Xóa sinh viên
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này không?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Xóa sinh viên thành công!');
        fetchStudents();
      }
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
      alert('Không thể xóa sinh viên!');
    }
  };

  // 4. Chọn sinh viên để sửa
  const handleEdit = (student) => {
    setEditingStudentId(student._id);
    setStudentId(student.studentId);
    setName(student.name);
    setEmail(student.email);
  };

  return (
    <div className="container">
      <h1>Quản lý Sinh viên MERN Stack</h1>

      {/* Form nhập dữ liệu */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="MSSV"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">
          {editingStudentId ? 'Cập nhật' : 'Thêm sinh viên'}
        </button>
        {editingStudentId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '8px', backgroundColor: '#6c757d' }}>
            Hủy
          </button>
        )}
      </form>

      {/* Bảng danh sách sinh viên */}
      <h2>Danh sách sinh viên</h2>
      <table>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students && students.length > 0 ? (
            students.map((st) => (
              <tr key={st._id}>
                <td>{st.studentId}</td>
                <td>{st.name}</td>
                <td>{st.email}</td>
                <td>
                  <button onClick={() => handleEdit(st)} style={{ marginRight: '6px' }}>Sửa</button>
                  <button onClick={() => handleDelete(st._id)} style={{ backgroundColor: '#dc3545' }}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Chưa có sinh viên nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
