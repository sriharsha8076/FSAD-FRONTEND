const bcrypt = require('bcryptjs');

const hash = bcrypt.hashSync('Harsha@0821', 10);

const { execSync } = require('child_process');
const mysql = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe"`;

// Delete all existing admins
execSync(`${mysql} -u root -pHarsha@0821 fsad_db -e "DELETE FROM users WHERE role IN ('SUPER_ADMIN','UNIVERSITY_ADMIN');"`, { stdio: 'inherit' });

// Insert new super admin
const sql = `INSERT INTO users (name, email, password, role, dob, mobile_no, unique_id) VALUES ('Admin21', 'admin21@saams.com', '${hash}', 'SUPER_ADMIN', '2000-01-01', '9999999999', 'ADM000001');`;
execSync(`${mysql} -u root -pHarsha@0821 fsad_db -e "${sql}"`, { stdio: 'inherit' });

console.log('Done! Admin created: email=admin21@saams.com, password=Harsha@0821');
console.log('Hash used:', hash);
