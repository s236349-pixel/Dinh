require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Student = require('./Student');

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('Lỗi: MONGO_URI chưa được thiết lập trong file .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Khởi tạo kết nối MongoDB và chạy server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('Đã kết nối thành công với MongoDB');

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

    // 3. API PUT: Cập nhật thông tin sinh viên theo ID
    app.put('/api/students/:id', async (req, res) => {
      try {
        const updatedStudent = await Student.findByIdAndUpdate(
          req.params.id,
          {
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
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err);
  }
}

startServer();