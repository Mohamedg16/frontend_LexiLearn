// Mock Courses Data
export const mockCourses = [
    {
        id: 'course_1',
        title: 'Mathematics Fundamentals',
        description: 'Master the basics of algebra, geometry, and calculus',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
        category: 'Mathematics',
        totalLessons: 12,
        difficulty: 'Beginner',
        estimatedHours: 20
    },
    {
        id: 'course_2',
        title: 'Physics: Motion & Energy',
        description: 'Explore the laws of motion, energy, and thermodynamics',
        thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=250&fit=crop',
        category: 'Physics',
        totalLessons: 10,
        difficulty: 'Intermediate',
        estimatedHours: 18
    },
    {
        id: 'course_3',
        title: 'Computer Science Basics',
        description: 'Introduction to programming, algorithms, and data structures',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop',
        category: 'Computer Science',
        totalLessons: 15,
        difficulty: 'Beginner',
        estimatedHours: 25
    },
    {
        id: 'course_4',
        title: 'Chemistry: Atoms & Molecules',
        description: 'Understanding chemical reactions and molecular structures',
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=250&fit=crop',
        category: 'Chemistry',
        totalLessons: 11,
        difficulty: 'Intermediate',
        estimatedHours: 22
    },
    {
        id: 'course_5',
        title: 'English Literature',
        description: 'Analyze classic and modern literary works',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
        category: 'Literature',
        totalLessons: 8,
        difficulty: 'Beginner',
        estimatedHours: 15
    },
    {
        id: 'course_6',
        title: 'World History',
        description: 'Journey through major historical events and civilizations',
        thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=250&fit=crop',
        category: 'History',
        totalLessons: 14,
        difficulty: 'Intermediate',
        estimatedHours: 20
    }
];

// Mock Lessons Data
export const mockLessons = {
    course_1: [
        { id: 'lesson_1_1', title: 'Introduction to Algebra', duration: 45, order: 1 },
        { id: 'lesson_1_2', title: 'Linear Equations', duration: 60, order: 2 },
        { id: 'lesson_1_3', title: 'Quadratic Equations', duration: 75, order: 3 },
        { id: 'lesson_1_4', title: 'Functions and Graphs', duration: 90, order: 4 },
        { id: 'lesson_1_5', title: 'Polynomials', duration: 60, order: 5 },
        { id: 'lesson_1_6', title: 'Geometry Basics', duration: 50, order: 6 },
        { id: 'lesson_1_7', title: 'Triangles and Angles', duration: 55, order: 7 },
        { id: 'lesson_1_8', title: 'Circles and Arcs', duration: 65, order: 8 },
        { id: 'lesson_1_9', title: 'Introduction to Calculus', duration: 80, order: 9 },
        { id: 'lesson_1_10', title: 'Derivatives', duration: 90, order: 10 },
        { id: 'lesson_1_11', title: 'Integrals', duration: 85, order: 11 },
        { id: 'lesson_1_12', title: 'Applications of Calculus', duration: 70, order: 12 }
    ],
    course_2: [
        { id: 'lesson_2_1', title: 'Newton\'s Laws of Motion', duration: 60, order: 1 },
        { id: 'lesson_2_2', title: 'Kinematics', duration: 55, order: 2 },
        { id: 'lesson_2_3', title: 'Force and Acceleration', duration: 65, order: 3 },
        { id: 'lesson_2_4', title: 'Work and Energy', duration: 70, order: 4 },
        { id: 'lesson_2_5', title: 'Power and Efficiency', duration: 50, order: 5 },
        { id: 'lesson_2_6', title: 'Thermodynamics Basics', duration: 75, order: 6 },
        { id: 'lesson_2_7', title: 'Heat Transfer', duration: 60, order: 7 },
        { id: 'lesson_2_8', title: 'Waves and Sound', duration: 65, order: 8 },
        { id: 'lesson_2_9', title: 'Light and Optics', duration: 70, order: 9 },
        { id: 'lesson_2_10', title: 'Electricity and Magnetism', duration: 80, order: 10 }
    ],
    course_3: [
        { id: 'lesson_3_1', title: 'Introduction to Programming', duration: 90, order: 1 },
        { id: 'lesson_3_2', title: 'Variables and Data Types', duration: 60, order: 2 },
        { id: 'lesson_3_3', title: 'Control Structures', duration: 75, order: 3 },
        { id: 'lesson_3_4', title: 'Functions and Methods', duration: 80, order: 4 },
        { id: 'lesson_3_5', title: 'Arrays and Lists', duration: 70, order: 5 },
        { id: 'lesson_3_6', title: 'Object-Oriented Programming', duration: 90, order: 6 },
        { id: 'lesson_3_7', title: 'Data Structures: Stacks & Queues', duration: 85, order: 7 },
        { id: 'lesson_3_8', title: 'Trees and Graphs', duration: 95, order: 8 },
        { id: 'lesson_3_9', title: 'Sorting Algorithms', duration: 80, order: 9 },
        { id: 'lesson_3_10', title: 'Searching Algorithms', duration: 75, order: 10 },
        { id: 'lesson_3_11', title: 'Recursion', duration: 70, order: 11 },
        { id: 'lesson_3_12', title: 'Algorithm Complexity', duration: 65, order: 12 },
        { id: 'lesson_3_13', title: 'Dynamic Programming', duration: 90, order: 13 },
        { id: 'lesson_3_14', title: 'Graph Algorithms', duration: 85, order: 14 },
        { id: 'lesson_3_15', title: 'Final Project', duration: 120, order: 15 }
    ],
    course_4: [
        { id: 'lesson_4_1', title: 'Atomic Structure', duration: 60, order: 1 },
        { id: 'lesson_4_2', title: 'Periodic Table', duration: 55, order: 2 },
        { id: 'lesson_4_3', title: 'Chemical Bonding', duration: 70, order: 3 },
        { id: 'lesson_4_4', title: 'Molecular Geometry', duration: 65, order: 4 },
        { id: 'lesson_4_5', title: 'Chemical Reactions', duration: 75, order: 5 },
        { id: 'lesson_4_6', title: 'Stoichiometry', duration: 80, order: 6 },
        { id: 'lesson_4_7', title: 'Acids and Bases', duration: 60, order: 7 },
        { id: 'lesson_4_8', title: 'Redox Reactions', duration: 70, order: 8 },
        { id: 'lesson_4_9', title: 'Organic Chemistry Basics', duration: 85, order: 9 },
        { id: 'lesson_4_10', title: 'Polymers', duration: 65, order: 10 },
        { id: 'lesson_4_11', title: 'Chemical Equilibrium', duration: 75, order: 11 }
    ],
    course_5: [
        { id: 'lesson_5_1', title: 'Introduction to Literature', duration: 50, order: 1 },
        { id: 'lesson_5_2', title: 'Poetry Analysis', duration: 60, order: 2 },
        { id: 'lesson_5_3', title: 'Shakespeare\'s Works', duration: 90, order: 3 },
        { id: 'lesson_5_4', title: 'Victorian Literature', duration: 75, order: 4 },
        { id: 'lesson_5_5', title: 'Modern Fiction', duration: 70, order: 5 },
        { id: 'lesson_5_6', title: 'Literary Criticism', duration: 65, order: 6 },
        { id: 'lesson_5_7', title: 'Narrative Techniques', duration: 60, order: 7 },
        { id: 'lesson_5_8', title: 'Comparative Literature', duration: 80, order: 8 }
    ],
    course_6: [
        { id: 'lesson_6_1', title: 'Ancient Civilizations', duration: 70, order: 1 },
        { id: 'lesson_6_2', title: 'Greek and Roman Empire', duration: 75, order: 2 },
        { id: 'lesson_6_3', title: 'Medieval Europe', duration: 65, order: 3 },
        { id: 'lesson_6_4', title: 'Renaissance Period', duration: 70, order: 4 },
        { id: 'lesson_6_5', title: 'Age of Exploration', duration: 60, order: 5 },
        { id: 'lesson_6_6', title: 'Industrial Revolution', duration: 75, order: 6 },
        { id: 'lesson_6_7', title: 'World War I', duration: 80, order: 7 },
        { id: 'lesson_6_8', title: 'World War II', duration: 85, order: 8 },
        { id: 'lesson_6_9', title: 'Cold War Era', duration: 70, order: 9 },
        { id: 'lesson_6_10', title: 'Modern History', duration: 65, order: 10 },
        { id: 'lesson_6_11', title: 'Asian History', duration: 75, order: 11 },
        { id: 'lesson_6_12', title: 'African History', duration: 70, order: 12 },
        { id: 'lesson_6_13', title: 'American History', duration: 80, order: 13 },
        { id: 'lesson_6_14', title: 'Contemporary Issues', duration: 60, order: 14 }
    ]
};

// Initialize mock data in localStorage
export const initializeMockData = () => {
    // Check if already initialized
    if (localStorage.getItem('dataInitialized')) {
        return;
    }

    // Create mock students with progress
    const mockStudents = [
        {
            id: 'student_1',
            name: 'Alice Johnson',
            email: 'alice@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=4F46E5',
            joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'student_2',
            name: 'Bob Smith',
            email: 'bob@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=Bob+Smith&background=9333EA',
            joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'student_3',
            name: 'Carol Williams',
            email: 'carol@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=Carol+Williams&background=EC4899',
            joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'student_4',
            name: 'David Brown',
            email: 'david@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=David+Brown&background=10B981',
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date().toISOString(),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'student_5',
            name: 'Emma Davis',
            email: 'emma@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=Emma+Davis&background=F59E0B',
            joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'student_6',
            name: 'Frank Miller',
            email: 'frank@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=Frank+Miller&background=EF4444',
            joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'student_7',
            name: 'Grace Lee',
            email: 'grace@student.com',
            password: 'password123',
            role: 'student',
            profilePicture: 'https://ui-avatars.com/api/?name=Grace+Lee&background=8B5CF6',
            joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Create mock teacher
    const mockTeacher = {
        id: 'teacher_1',
        name: 'Dr. Sarah Anderson',
        email: 'teacher@school.com',
        password: 'password123',
        role: 'teacher',
        subject: 'Mathematics',
        profilePicture: 'https://ui-avatars.com/api/?name=Sarah+Anderson&background=6366F1',
        joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Create mock admin
    const mockAdmin = {
        id: 'admin_1',
        name: 'Admin User',
        email: 'admin@school.com',
        password: 'password123',
        role: 'admin',
        profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=DC2626',
        joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    const allUsers = [...mockStudents, mockTeacher, mockAdmin];
    localStorage.setItem('users', JSON.stringify(allUsers));

    // Create detailed student progress
    const studentProgress = {};

    mockStudents.forEach((student, index) => {
        const progressLevel = [0.85, 0.65, 0.45, 0.75, 0.90, 0.35, 0.55][index];
        const enrolledCourses = mockCourses.slice(0, Math.floor(Math.random() * 3) + 2);

        studentProgress[student.id] = {
            studentId: student.id,
            courses: enrolledCourses.map((course, courseIndex) => {
                const lessons = mockLessons[course.id];
                const completedCount = Math.floor(lessons.length * (progressLevel + (Math.random() * 0.2 - 0.1)));
                const completedLessons = lessons.slice(0, completedCount).map(lesson => ({
                    lessonId: lesson.id,
                    lessonName: lesson.title,
                    completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    timeSpent: lesson.duration + Math.floor(Math.random() * 20 - 10)
                }));

                return {
                    courseId: course.id,
                    courseName: course.title,
                    enrollDate: new Date(Date.now() - (60 - courseIndex * 15) * 24 * 60 * 60 * 1000).toISOString(),
                    progress: Math.round((completedCount / lessons.length) * 100),
                    lessonsCompleted: completedLessons,
                    totalStudyHours: parseFloat((completedLessons.reduce((sum, l) => sum + l.timeSpent, 0) / 60).toFixed(1)),
                    status: completedCount === lessons.length ? 'completed' : 'in-progress',
                    lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                };
            }),
            totalStudyHours: 0,
            totalLessonsCompleted: 0,
            currentStreak: Math.floor(Math.random() * 15) + 1,
            achievements: [],
            studyLogs: []
        };

        // Calculate totals
        studentProgress[student.id].totalLessonsCompleted = studentProgress[student.id].courses.reduce(
            (sum, course) => sum + course.lessonsCompleted.length, 0
        );
        studentProgress[student.id].totalStudyHours = parseFloat(
            studentProgress[student.id].courses.reduce((sum, course) => sum + course.totalStudyHours, 0).toFixed(1)
        );

        // Add achievements based on progress
        const achievements = [];
        if (studentProgress[student.id].totalLessonsCompleted >= 1) achievements.push('first_lesson');
        if (studentProgress[student.id].totalStudyHours >= 10) achievements.push('10_hours');
        if (studentProgress[student.id].totalStudyHours >= 50) achievements.push('50_hours');
        if (studentProgress[student.id].currentStreak >= 7) achievements.push('week_streak');
        if (studentProgress[student.id].courses.some(c => c.status === 'completed')) achievements.push('course_complete');
        studentProgress[student.id].achievements = achievements;

        // Generate study logs for the past 30 days
        const studyLogs = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const hoursStudied = Math.random() > 0.3 ? parseFloat((Math.random() * 4).toFixed(1)) : 0;
            studyLogs.push({
                date: date.toISOString().split('T')[0],
                hours: hoursStudied,
                lessonsCompleted: hoursStudied > 0 ? Math.floor(Math.random() * 3) : 0
            });
        }
        studentProgress[student.id].studyLogs = studyLogs.reverse();
    });

    localStorage.setItem('studentProgress', JSON.stringify(studentProgress));
    localStorage.setItem('dataInitialized', 'true');
};
