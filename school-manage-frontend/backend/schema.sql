-- Schema for school-manage
CREATE DATABASE IF NOT EXISTS school_manage;
USE school_manage;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reg_no VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  `class` VARCHAR(50),
  board VARCHAR(100),
  father_name VARCHAR(200),
  phone VARCHAR(50),
  email VARCHAR(150),
  admission_number VARCHAR(100),
  admission_date DATE,
  admission_year VARCHAR(20),
  category VARCHAR(50),
  section VARCHAR(50),
  bus_no VARCHAR(50),
  bus_route VARCHAR(150),
  pickup_point VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS fee_heads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  UNIQUE KEY ux_fee_head_name (name)
);

CREATE TABLE IF NOT EXISTS receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- seed
INSERT INTO fee_heads (name, amount) VALUES
('Tuition', 5000.00),
('Transport', 800.00),
('Library', 200.00)
ON DUPLICATE KEY UPDATE name=name;

-- Payments table with receipt numbers and payment mode
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(100) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  registration_fee DECIMAL(12,2) DEFAULT 0,
  tuition_fee DECIMAL(12,2) DEFAULT 0,
  bus_fee DECIMAL(12,2) DEFAULT 0,
  misc_fee DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_mode VARCHAR(50),
  bank_name VARCHAR(150),
  branch_name VARCHAR(150),
  dd_cheque_no VARCHAR(100),
  dd_cheque_date DATE,
  dues_fees DECIMAL(12,2) DEFAULT 0,
  utr_number VARCHAR(150),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Fee matrix for class-board combinations
CREATE TABLE IF NOT EXISTS fee_matrix (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class INT NOT NULL,
  board VARCHAR(100) NOT NULL,
  tuition_fee DECIMAL(10,2) DEFAULT 0,
  exam_fee DECIMAL(10,2) DEFAULT 0,
  library_fee DECIMAL(10,2) DEFAULT 0,
  sports_fee DECIMAL(10,2) DEFAULT 0,
  total_fee DECIMAL(10,2) DEFAULT 0,
  UNIQUE KEY ux_class_board (class, board)
);
