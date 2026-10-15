import { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_BASE = 'https://mern-backend-s236349-v1.onrender.com';

function App() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Đọc phản hồi từ Backend, kể cả khi Backend trả về HTML hoặc JSON lỗi
  const readResponse = async (response) => {
    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        text?.slice(0, 200) ||
        `HTTP ${response.status}`;

      throw new Error(`Lỗi ${response.status}: ${message}`);
    }

    if (text && data === null) {
      throw new Error('Backend không trả về JSON hợp lệ.');
    }

    return data;
  };

  // 1. Lấy danh sách sinh viên
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/students`);
      const data = await readResponse(response);

      if (!Array.isArray(data)) {
        throw new Error('API danh sách sinh viên không trả về mảng dữ liệu.');
      }

      setStudents(data);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
      setError(
        `${err.message}. Vui lòng kiểm tra Backend và kết nối mạng.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 2. Xóa trắng biểu mẫu
  const resetForm = () => {
    setStudentId('');
    setName('');
    setEmail('');
    setEditingStudentId(null);
  };

  // 3. Thêm mới hoặc cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanStudentId = studentId.trim();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanStudentId || !cleanName || !cleanEmail) {
      alert('Vui lòng điền đầy đủ MSSV, họ tên và email!');
      return;
    }

    setSaving(true);

    try {
      const isEditing = Boolean(editingStudentId);
      const url = isEditing
        ? `${API_BASE}/api/students/${editingStudentId}`
        : `${API_BASE}/api/students`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: cleanStudentId,
          name: cleanName,
          email: cleanEmail,
        }),
      });

      await readResponse(response);

      alert(
        isEditing
          ? 'Cập nhật sinh viên thành công!'
          : 'Thêm sinh viên thành công!'
      );

      resetForm();
      await fetchStudents();
    } catch (err) {
      console.error('Lỗi lưu sinh viên:', err);
      alert(`Không thể lưu sinh viên: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 4. Chọn sinh viên để sửa
  const handleEdit = (student) => {
    setEditingStudentId(student._id);
    setStudentId(student.studentId || '');
    setName(student.name || '');
    setEmail(student.email || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Xóa sinh viên
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa sinh viên này không?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE}/api/students/${id}`, {
        method: 'DELETE',
      });

      await readResponse(response);

      alert('Xóa sinh viên thành công!');
      await fetchStudents();
    } catch (err) {
      console.error('Lỗi xóa sinh viên:', err);
      alert(`Không thể xóa sinh viên: ${err.message}`);
    }
  };

  return (
    <main className="container">
      <h1>Quản lý Sinh viên MERN Stack</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="MSSV"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={saving}>
          {saving
            ? 'Đang lưu...'
            : editingStudentId
              ? 'Cập nhật sinh viên'
              : 'Thêm sinh viên'}
        </button>

        {editingStudentId && (
          <button type="button" onClick={resetForm}>
            Hủy sửa
          </button>
        )}
      </form>

      <h2>Danh sách sinh viên</h2>

      {error && (
        <div role="alert" className="error-message">
          {error}
          <button type="button" onClick={fetchStudents}>
            Thử lại
          </button>
        </div>
      )}

      {loading && <p>Đang tải danh sách sinh viên...</p>}

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
          {!loading && students.length === 0 ? (
            <tr>
              <td colSpan="4">
                {error
                  ? 'Không tải được dữ liệu sinh viên.'
                  : 'Chưa có sinh viên nào.'}
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student._id}>
                <td>{student.studentId}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEdit(student)}
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(student._id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}

export default App;
