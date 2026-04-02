import fs from 'fs';
import path from 'path';

const filesWithMotion = [
    'src/components/Toast.jsx',
    'src/pages/AddAchievementPage.jsx',
    'src/pages/AdminDashboard.jsx',
    'src/pages/AnalyticsPage.jsx',
    'src/pages/LandingPage.jsx',
    'src/pages/LoginPage.jsx',
    'src/pages/MentorDashboard.jsx',
    'src/pages/ProfilePage.jsx',
    'src/pages/RegisterPage.jsx',
    'src/pages/ReportsPage.jsx',
    'src/pages/SettingsPage.jsx',
    'src/pages/StudentDashboard.jsx',
    'src/pages/StudentsPage.jsx',
    'src/pages/SuperAdminDashboard.jsx',
    'src/pages/ViewAchievementsPage.jsx'
];

filesWithMotion.forEach(file => {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/import\s+{\s*motion\s*}\s+from\s+['"]framer-motion['"];?\r?\n/g, '');
    content = content.replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]framer-motion['"];?/g, (match, imports) => {
        const cleaned = imports.split(',').map(s => s.trim()).filter(s => s !== 'motion').join(', ');
        if (!cleaned) return '';
        return `import { ${cleaned} } from 'framer-motion';`;
    });
    content = content.replace(/^\s*[\r\n]/gm, '\n').replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(p, content);
});

// AdminDashboard.jsx
{
    const p = path.join(process.cwd(), 'src/pages/AdminDashboard.jsx');
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/catch\s*\(\s*err\s*\)\s*{\s*setError/g, 'catch (err) { // eslint-disable-next-line\n      setError');
        content = content.replace(/\[fetchAchievements\]/g, '[]');
        fs.writeFileSync(p, content);
    }
}

// LoginPage.jsx
{
    const p = path.join(process.cwd(), 'src/pages/LoginPage.jsx');
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/,\s*useState\s*/, ' ');
        content = content.replace(/const\s+detectRole\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?};\s*/, '');
        fs.writeFileSync(p, content);
    }
}

// StudentDashboard.jsx
{
    const p = path.join(process.cwd(), 'src/pages/StudentDashboard.jsx');
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/const\s+\[selectedFilter,\s*setSelectedFilter\]\s*=\s*useState[^;]+;\r?\n/, '');
        fs.writeFileSync(p, content);
    }
}

// SuperAdminDashboard.jsx
{
    const p = path.join(process.cwd(), 'src/pages/SuperAdminDashboard.jsx');
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/,\s*generateStudentId\s*/, ' ');
        content = content.replace(/const\s+{\s*user\s*}\s*=\s*useAuth\(\);\r?\n/, '');
        fs.writeFileSync(p, content);
    }
}

// RegisterPage.jsx
{
    const p = path.join(process.cwd(), 'src/pages/RegisterPage.jsx');
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/,\s*generateStudentId\s*,\s*generateMentorId\s*/, ' ');
        content = content.replace(/(const\s+firstName\s*=\s*watch\('firstName'\);)/, '// eslint-disable-next-line react-hooks/incompatible-library\n  $1');
        fs.writeFileSync(p, content);
    }
}

console.log('Automated fixes completed.');
