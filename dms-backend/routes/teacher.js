// Teacher Dashboard ke liye naya route
app.get('/api/teacher/students', async (req, res) => {
    try {
        const { department, semester } = req.query;

        // Filter object jo sirf selected department aur semester ka data layega
        let teacherFilter = { role: 'student' };

        if (department) {
            // Regex isliye taake database mein CAPITAL ho ya Small, match ho jaye
            teacherFilter.department = { $regex: new RegExp("^" + department.trim() + "$", "i") };
        }

        if (semester) {
            teacherFilter.semester = String(semester).trim();
        }

        console.log("Teacher is searching for:", teacherFilter);

        const students = await User.find(teacherFilter);
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});