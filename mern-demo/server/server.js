const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Student = require('./Student');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối thành công với MongoDB'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// 1. API GET: Lấy danh sách sinh viên
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. API POST: Thêm sinh viên mới
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student({
      studentId: req.body.studentId,
      name: req.body.name,
      email: req.body.email
    });
    const savedStudent = await newStudent.save();
    res.json(savedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. API PUT: Cập nhật sinh viên theo ID
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        studentId: req.body.studentId,
        name: req.body.name,
        email: req.body.email
      },
      { new: true }
    );
    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API DELETE: Xóa sinh viên theo ID
app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sinh viên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});