require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - cấu hình CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Origin không được phép bởi CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Schema sinh viên thống nhất với Frontend
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student ||
  mongoose.model('Student', studentSchema);


 // Kiểm tra Backend
app.get('/', (req, res) => {
  res.send('Server MERN Backend đang chạy thành công!');
});

// API kiểm tra Backend theo yêu cầu đề
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Backend đang hoạt động!'
  });
});


// GET: Lấy danh sách sinh viên
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách sinh viên',
      error: error.message
    });
  }
});

// POST: Thêm sinh viên
app.post('/api/students', async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    if (
      !studentId?.trim() ||
      !name?.trim() ||
      !email?.trim()
    ) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ MSSV, họ tên và email.'
      });
    }

    const newStudent = new Student({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim()
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'MSSV đã tồn tại. Vui lòng nhập MSSV khác.'
      });
    }

    res.status(400).json({
      message: 'Lỗi khi thêm sinh viên',
      error: error.message
    });
  }
});

// PUT: Cập nhật sinh viên
app.put('/api/students/:id', async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        studentId,
        name,
        email
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: 'Không tìm thấy sinh viên.'
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'MSSV đã tồn tại.'
      });
    }

    res.status(400).json({
      message: 'Lỗi khi cập nhật sinh viên',
      error: error.message
    });
  }
});

// DELETE: Xóa sinh viên
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!deletedStudent) {
      return res.status(404).json({
        message: 'Không tìm thấy sinh viên.'
      });
    }

    res.json({
      message: 'Đã xóa sinh viên thành công!'
    });
  } catch (error) {
    res.status(400).json({
      message: 'Lỗi khi xóa sinh viên',
      error: error.message
    });
  }
});

// Kết nối MongoDB rồi khởi chạy server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
     throw new Error('Chưa cấu hình biến môi trường MONGODB_URI.');
    }

await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối MongoDB thành công.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động Backend:', error.message);
    process.exit(1);
  }
}

startServer();
