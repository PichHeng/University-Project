export const demoAccounts = {
    admin: {
        username: "admin",
        password: "Admin@123",
        role: "admin",
        name: "Admin User",
    },
    teacher: {
        username: "teacher",
        password: "Teacher@123",
        role: "teacher",
        name: "Rithy Pov",
    },
    student: {
        username: "student",
        password: "Student@123",
        role: "student",
        name: "អាហុង-ចើម",
    },
};

export const dashboardStats = {
    admin: [
        { label: "Students", value: 128 },
        { label: "Teachers", value: 18 },
        { label: "Departments", value: 5 },
        { label: "Courses", value: 24 },
    ],
    teacher: [
        { label: "Courses", value: 4 },
        { label: "Students", value: 96 },
        { label: "Attendance Today", value: "82%" },
        { label: "Grades Recorded", value: 74 },
    ],
    student: [
        { label: "Enrolled Courses", value: 6 },
        { label: "Attendance Rate", value: "92%" },
        { label: "Latest Grade", value: "A" },
        { label: "Status", value: "Active" },
    ],
};

export const recentStudents = [
    {
        id: "STU-1001",
        name: "Ah Hong",
        gender: "Male",
        department: "Information Technology Engineering",
        phone: "012 345 678",
        status: "Active",
    },
    {
        id: "STU-1002",
        name: "Sok Dara",
        gender: "Male",
        department: "Computer Science",
        phone: "098 765 432",
        status: "Active",
    },
    {
        id: "STU-1003",
        name: "Long Sreymom",
        gender: "Female",
        department: "Software Engineering",
        phone: "077 888 222",
        status: "Inactive",
    },
];

export const studentsData = [
    {
        id: 1,
        studentCode: "STU-1001",
        firstName: "ឡុង",
        lastName: "សារ័ដ្ធ",
        gender: "Male",
        department: "Information Technology Engineering",
        yearLevel: "Year 3",
        phone: "012 345 678",
        email: "longsaroth@student.edu",
        status: "Active",
    },
    {
        id: 2,
        studentCode: "STU-1002",
        firstName: "Sok",
        lastName: "Dara",
        gender: "Male",
        department: "Computer Science",
        yearLevel: "Year 2",
        phone: "098 765 432",
        email: "dara@student.edu",
        status: "Active",
    },
    {
        id: 3,
        studentCode: "STU-1003",
        firstName: "Long",
        lastName: "Sreymom",
        gender: "Female",
        department: "Software Engineering",
        yearLevel: "Year 1",
        phone: "077 888 222",
        email: "sreymom@student.edu",
        status: "Inactive",
    },
    {
        id: 4,
        studentCode: "STU-1004",
        firstName: "Denny",
        lastName: "Dick",
        gender: "Male",
        department: "Sex Engineering",
        yearLevel: "Year 4",
        phone: "067 69 69 69",
        email: "dennydick@student.edu",
        status: "Active",
    },
];

export const teachersData = [
    {
        id: 1,
        teacherCode: "TCH-1001",
        firstName: "Rithy",
        lastName: "Pov",
        gender: "Male",
        department: "Information Technology Engineering",
        phone: "012 000 111",
        email: "rithy.teacher@school.edu",
        status: "Active",
    },
    {
        id: 2,
        teacherCode: "TCH-1002",
        firstName: "Channary",
        lastName: "Heng",
        gender: "Female",
        department: "Computer Science",
        phone: "012 000 222",
        email: "channary.teacher@school.edu",
        status: "Active",
    },
    {
        id: 3,
        teacherCode: "TCH-1003",
        firstName: "Bora",
        lastName: "Nou",
        gender: "Male",
        department: "Software Engineering",
        phone: "012 000 333",
        email: "bora.teacher@school.edu",
        status: "Inactive",
    },
];

export const departmentsData = [
    {
        id: 1,
        departmentCode: "ITE",
        departmentName: "Information Technology Engineering",
        description: "Department for software, networking, and IT engineering.",
        students: 45,
        teachers: 8,
        courses: 12,
        status: "Active",
    },
    {
        id: 2,
        departmentCode: "CS",
        departmentName: "Computer Science",
        description: "Department focused on programming, algorithms, and systems.",
        students: 38,
        teachers: 6,
        courses: 10,
        status: "Active",
    },
    {
        id: 3,
        departmentCode: "SE",
        departmentName: "Software Engineering",
        description: "Department focused on software design and development.",
        students: 32,
        teachers: 5,
        courses: 9,
        status: "Inactive",
    },
];

export const coursesData = [
    {
        id: 1,
        courseCode: "ITE-301",
        courseName: "Web Application Development",
        department: "Information Technology Engineering",
        teacher: "Rithy Pov",
        credit: 3,
        semester: "Semester 1",
        status: "Active",
    },
    {
        id: 2,
        courseCode: "CS-205",
        courseName: "Database Systems",
        department: "Computer Science",
        teacher: "Channary Heng",
        credit: 3,
        semester: "Semester 1",
        status: "Active",
    },
    {
        id: 3,
        courseCode: "SE-220",
        courseName: "Software Engineering Principles",
        department: "Software Engineering",
        teacher: "Bora Nou",
        credit: 4,
        semester: "Semester 2",
        status: "Inactive",
    },
];

export const enrollmentsData = [
    {
        id: 1,
        enrollmentCode: "ENR-1001",
        studentName: "Chea Pich Heng",
        studentCode: "STU-1001",
        courseName: "Web Application Development",
        courseCode: "ITE-301",
        department: "Information Technology Engineering",
        enrollmentDate: "2026-07-01",
        status: "Active",
    },
    {
        id: 2,
        enrollmentCode: "ENR-1002",
        studentName: "Sok Dara",
        studentCode: "STU-1002",
        courseName: "Database Systems",
        courseCode: "CS-205",
        department: "Computer Science",
        enrollmentDate: "2026-07-02",
        status: "Active",
    },
    {
        id: 3,
        enrollmentCode: "ENR-1003",
        studentName: "Long Sreymom",
        studentCode: "STU-1003",
        courseName: "Software Engineering Principles",
        courseCode: "SE-220",
        department: "Software Engineering",
        enrollmentDate: "2026-07-03",
        status: "Dropped",
    },
];

export const reportsData = [
    {
        id: 1,
        reportCode: "RPT-1001",
        reportTitle: "Student List Report",
        reportType: "Students",
        generatedBy: "Admin User",
        format: "PDF",
        generatedAt: "2026-07-05",
        status: "Ready",
    },
    {
        id: 2,
        reportCode: "RPT-1002",
        reportTitle: "Course Enrollment Report",
        reportType: "Enrollments",
        generatedBy: "Admin User",
        format: "Excel",
        generatedAt: "2026-07-06",
        status: "Ready",
    },
    {
        id: 3,
        reportCode: "RPT-1003",
        reportTitle: "Grade Summary Report",
        reportType: "Grades",
        generatedBy: "Admin User",
        format: "PDF",
        generatedAt: "2026-07-07",
        status: "Processing",
    },
];

export const reportStats = [
    {
        label: "Student Reports",
        value: 12,
    },
    {
        label: "Enrollment Reports",
        value: 8,
    },
    {
        label: "Grade Reports",
        value: 6,
    },
    {
        label: "Attendance Reports",
        value: 10,
    },
]; 