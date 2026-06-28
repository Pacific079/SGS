const db = require('../db');

const mockStore = { students: [], idSeq: 1000 };

async function listStudents(req, res) {
  const pool = db.getPool();
  if (!pool) {
    return res.json(mockStore.students);
  }
  try {
     const [rows] = await pool.query(`
      SELECT id, reg_no, name, \`class\`, board, father_name, phone, email, 
             admission_number, admission_date, admission_year, category, section, 
             admission_type, rte_app_number, dob, gender, adhar_number, pen, 
             apaar_id, alternate_mobile, father_qualification, father_occupation, 
             father_adhar, mother_name, mother_qualification, mother_occupation, 
             mother_adhar, residential_area, house_number, ward_number, colony_area, 
             city_village, block, tehsil, district, state, pincode, previous_session, 
             previous_class, previous_scholar_number, previous_school_name, 
             previous_result, previous_grade, previous_attendance, vehicle_service, 
             vehicle_route, vehicle_period, vehicle_start_date, vehicle_end_date, 
             vehicle_months, vehicle_fee_total, vehicle_fee_discount, 
             vehicle_fee_payable, admission_fee, tuition_fee 
      FROM students 
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.warn('studentsController.list error:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

async function createStudent(req, res) {
  const {
    name,
    class: cls,
    board,
    father_name,
    phone,
    email,
    admission_number,
    admission_date,
    admission_year,
    category,
    section,
    reg_no,
    admission_type,
    rte_app_number,
    dob,
    gender,
    adhar_number,
    pen,
    apaar_id,
    alternate_mobile,
    father_qualification,
    father_occupation,
    father_adhar,
    mother_name,
    mother_qualification,
    mother_occupation,
    mother_adhar,
    residential_area,
    house_number,
    ward_number,
    colony_area,
    city_village,
    block,
    tehsil,
    district,
    state,
    pincode,
    previous_session,
    previous_class,
    previous_scholar_number,
    previous_school_name,
    previous_result,
    previous_grade,
    previous_attendance,
    vehicle_service,
    vehicle_route,
    vehicle_period,
    vehicle_start_date,
    vehicle_end_date,
    vehicle_months,
    vehicle_fee_total,
    vehicle_fee_discount,
    vehicle_fee_payable,
    admission_fee,
    tuition_fee,
  } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const pool = db.getPool();
  if (!pool) {
    mockStore.idSeq += 1;
    const id = mockStore.idSeq;
    const year = new Date().getFullYear();
    const seq = String(id).padStart(4, '0');
    const generated = reg_no || `REG${year}${seq}`;
    const rec = { id, reg_no: generated, name, class: cls, board, father_name, phone, email, admission_number, admission_date, admission_year, category, section };
    mockStore.students.push(rec);
    return res.status(201).json(rec);
  }

  try {
    // If client provided a reg_no, try inserting with it (ensure uniqueness)
    if (reg_no) {
      const [exists] = await pool.query('SELECT id FROM students WHERE reg_no = ? LIMIT 1', [reg_no]);
      if (exists.length) return res.status(409).json({ error: 'reg_no_exists' });
      const [result] = await pool.query(
        `INSERT INTO students (reg_no, name,
          "\`class\`, board, father_name, phone, email, admission_number, admission_date, admission_year, category, section, admission_type, rte_app_number, dob, gender, adhar_number, pen, apaar_id, alternate_mobile, father_qualification, father_occupation, father_adhar, mother_name, mother_qualification, mother_occupation, mother_adhar, residential_area, house_number, ward_number, colony_area, city_village, block, tehsil, district, state, pincode, previous_session, previous_class, previous_scholar_number, previous_school_name, previous_result, previous_grade, previous_attendance, vehicle_service, vehicle_route, vehicle_period, vehicle_start_date, vehicle_end_date, vehicle_months, vehicle_fee_total, vehicle_fee_discount, vehicle_fee_payable, admission_fee, tuition_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reg_no,
          name,
          cls || null,
          board || null,
          father_name || null,
          phone || null,
          email || null,
          admission_number || null,
          admission_date || null,
          admission_year || null,
          category || null,
          section || null,
          admission_type || null,
          rte_app_number || null,
          dob || null,
          gender || null,
          adhar_number || null,
          pen || null,
          apaar_id || null,
          alternate_mobile || null,
          father_qualification || null,
          father_occupation || null,
          father_adhar || null,
          mother_name || null,
          mother_qualification || null,
          mother_occupation || null,
          mother_adhar || null,
          residential_area || null,
          house_number || null,
          ward_number || null,
          colony_area || null,
          city_village || null,
          block || null,
          tehsil || null,
          district || null,
          state || null,
          pincode || null,
          previous_session || null,
          previous_class || null,
          previous_scholar_number || null,
          previous_school_name || null,
          previous_result || null,
          previous_grade || null,
          previous_attendance || null,
          vehicle_service || null,
          vehicle_route || null,
          vehicle_period || null,
          vehicle_start_date || null,
          vehicle_end_date || null,
          vehicle_months || null,
          vehicle_fee_total || 0,
          vehicle_fee_discount || 0,
          vehicle_fee_payable || 0,
          admission_fee || 0,
          tuition_fee || 0,
        ],
      );
      const id = result.insertId;
      const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
      return res.status(201).json(rows[0]);
    }

    const tempReg = `TMP-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const [result] = await pool.query(
      `INSERT INTO students (reg_no, name,
        "\`class\`, board, father_name, phone, email, admission_number, admission_date, admission_year, category, section, admission_type, rte_app_number, dob, gender, adhar_number, pen, apaar_id, alternate_mobile, father_qualification, father_occupation, father_adhar, mother_name, mother_qualification, mother_occupation, mother_adhar, residential_area, house_number, ward_number, colony_area, city_village, block, tehsil, district, state, pincode, previous_session, previous_class, previous_scholar_number, previous_school_name, previous_result, previous_grade, previous_attendance, vehicle_service, vehicle_route, vehicle_period, vehicle_start_date, vehicle_end_date, vehicle_months, vehicle_fee_total, vehicle_fee_discount, vehicle_fee_payable, admission_fee, tuition_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tempReg,
        name,
        cls || null,
        board || null,
        father_name || null,
        phone || null,
        email || null,
        admission_number || null,
        admission_date || null,
        admission_year || null,
        category || null,
        section || null,
        admission_type || null,
        rte_app_number || null,
        dob || null,
        gender || null,
        adhar_number || null,
        pen || null,
        apaar_id || null,
        alternate_mobile || null,
        father_qualification || null,
        father_occupation || null,
        father_adhar || null,
        mother_name || null,
        mother_qualification || null,
        mother_occupation || null,
        mother_adhar || null,
        residential_area || null,
        house_number || null,
        ward_number || null,
        colony_area || null,
        city_village || null,
        block || null,
        tehsil || null,
        district || null,
        state || null,
        pincode || null,
        previous_session || null,
        previous_class || null,
        previous_scholar_number || null,
        previous_school_name || null,
        previous_result || null,
        previous_grade || null,
        previous_attendance || null,
        vehicle_service || null,
        vehicle_route || null,
        vehicle_period || null,
        vehicle_start_date || null,
        vehicle_end_date || null,
        vehicle_months || null,
        vehicle_fee_total || 0,
        vehicle_fee_discount || 0,
        vehicle_fee_payable || 0,
        admission_fee || 0,
        tuition_fee || 0,
      ],
    );
    const id = result.insertId;
    const year = new Date().getFullYear();
    const seq = String(id).padStart(4, '0');
    const generated = `REG${year}${seq}`;
    await pool.query('UPDATE students SET reg_no = ? WHERE id = ?', [generated, id]);
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createStudent failed:', err.message);
    return res.status(500).json({ error: 'db' });
  }
}

async function getByRegNo(req, res) {
  const reg = req.params.reg_no;
  const pool = db.getPool();
  if (!pool) return res.status(404).json({ error: 'db_unavailable' });
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE reg_no = ? LIMIT 1', [reg]);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getByRegNo failed:', err.message);
    res.status(500).json({ error: 'db' });
  }
}

async function exportCsv(req, res) {
  const pool = db.getPool();
  if (!pool) return res.status(500).send('DB unavailable');
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    const header = Object.keys(rows[0] || {}).filter(Boolean);
    const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${(r[h]||'').toString().replace(/"/g,'""')}"`).join(','))).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  } catch (err) {
    console.error('exportCsv failed:', err.message);
    res.status(500).send('export_failed');
  }
}

module.exports = { listStudents, createStudent, getByRegNo, exportCsv };

