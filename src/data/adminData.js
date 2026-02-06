// Admin-specific mock data and utilities

// Initialize admin user
export const initializeAdminUser = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if admin already exists
    const adminExists = users.some(u => u.role === 'admin');

    if (!adminExists) {
        const adminUser = {
            id: 'admin_1',
            name: 'Admin User',
            email: 'admin@lexilearn.com',
            password: 'admin123',
            role: 'admin',
            profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=EF4444',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
};

// Initialize platform settings
export const initializePlatformSettings = () => {
    const existingSettings = localStorage.getItem('platformSettings');

    if (!existingSettings) {
        const settings = {
            subscriptionPricing: {
                monthly: 29.99,
                quarterly: 79.99,
                yearly: 299.99
            },
            teacherHourlyRate: 50,
            currency: 'USD',
            timezone: 'UTC',
            platformName: 'LexiLearn',
            platformEmail: 'support@lexilearn.com'
        };

        localStorage.setItem('platformSettings', JSON.stringify(settings));
    }
};

// Initialize modules/content
export const initializeModules = () => {
    const existingModules = localStorage.getItem('modules');

    if (!existingModules) {
        const modules = [
            {
                id: 'module_1',
                title: 'Web Development Fundamentals',
                description: 'Learn HTML, CSS, and JavaScript basics',
                level: 'Beginner',
                assignedTeachers: ['teacher_1'],
                status: 'active',
                createdAt: new Date().toISOString(),
                lessons: [
                    { id: 'lesson_1_1', title: 'Introduction to HTML', duration: 45, videoUrl: 'https://youtube.com/watch?v=example1' },
                    { id: 'lesson_1_2', title: 'CSS Basics', duration: 60, videoUrl: 'https://youtube.com/watch?v=example2' },
                    { id: 'lesson_1_3', title: 'JavaScript Fundamentals', duration: 90, videoUrl: 'https://youtube.com/watch?v=example3' }
                ],
                resources: [
                    { id: 'res_1_1', title: 'HTML Cheat Sheet', type: 'pdf', url: '/resources/html-cheat-sheet.pdf' },
                    { id: 'res_1_2', title: 'CSS Reference Guide', type: 'link', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }
                ]
            },
            {
                id: 'module_2',
                title: 'Advanced React Development',
                description: 'Master React hooks, context, and advanced patterns',
                level: 'Advanced',
                assignedTeachers: ['teacher_1'],
                status: 'active',
                createdAt: new Date().toISOString(),
                lessons: [
                    { id: 'lesson_2_1', title: 'React Hooks Deep Dive', duration: 120, videoUrl: 'https://youtube.com/watch?v=example4' },
                    { id: 'lesson_2_2', title: 'Context API & State Management', duration: 90, videoUrl: 'https://youtube.com/watch?v=example5' }
                ],
                resources: [
                    { id: 'res_2_1', title: 'React Documentation', type: 'link', url: 'https://react.dev' }
                ]
            },
            {
                id: 'module_3',
                title: 'Data Structures & Algorithms',
                description: 'Essential CS concepts for interviews',
                level: 'Intermediate',
                assignedTeachers: [],
                status: 'active',
                createdAt: new Date().toISOString(),
                lessons: [
                    { id: 'lesson_3_1', title: 'Arrays and Strings', duration: 75, videoUrl: 'https://youtube.com/watch?v=example6' },
                    { id: 'lesson_3_2', title: 'Linked Lists', duration: 60, videoUrl: 'https://youtube.com/watch?v=example7' },
                    { id: 'lesson_3_3', title: 'Trees and Graphs', duration: 90, videoUrl: 'https://youtube.com/watch?v=example8' }
                ],
                resources: []
            }
        ];

        localStorage.setItem('modules', JSON.stringify(modules));
    }
};

// Initialize student subscriptions
export const initializeSubscriptions = () => {
    const existingSubscriptions = localStorage.getItem('subscriptions');

    if (!existingSubscriptions) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const students = users.filter(u => u.role === 'student');

        const subscriptions = students.map(student => ({
            studentId: student.id,
            plan: ['monthly', 'quarterly', 'yearly'][Math.floor(Math.random() * 3)],
            status: Math.random() > 0.2 ? 'active' : 'pending',
            startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            nextPaymentDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: [29.99, 79.99, 299.99][Math.floor(Math.random() * 3)]
        }));

        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    }
};

// Initialize teacher payments
export const initializeTeacherPayments = () => {
    const existingPayments = localStorage.getItem('teacherPayments');

    if (!existingPayments) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const teachers = users.filter(u => u.role === 'teacher');

        const payments = teachers.map(teacher => ({
            teacherId: teacher.id,
            totalHours: Math.floor(Math.random() * 100) + 20,
            hourlyRate: 50,
            totalAmount: 0, // Will be calculated
            paidAmount: 0,
            pendingAmount: 0,
            status: ['paid', 'pending', 'overdue'][Math.floor(Math.random() * 3)],
            lastPaymentDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            paymentHistory: []
        }));

        // Calculate amounts
        payments.forEach(payment => {
            payment.totalAmount = payment.totalHours * payment.hourlyRate;
            payment.paidAmount = Math.floor(payment.totalAmount * (Math.random() * 0.5 + 0.3));
            payment.pendingAmount = payment.totalAmount - payment.paidAmount;

            // Generate payment history
            const numPayments = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < numPayments; i++) {
                payment.paymentHistory.push({
                    id: `payment_${payment.teacherId}_${i}`,
                    amount: Math.floor(Math.random() * 1000) + 500,
                    date: new Date(Date.now() - (numPayments - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    method: ['Bank Transfer', 'PayPal', 'Check'][Math.floor(Math.random() * 3)],
                    status: 'completed'
                });
            }
        });

        localStorage.setItem('teacherPayments', JSON.stringify(payments));
    }
};

// Initialize student levels
export const initializeStudentLevels = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.role === 'student');

    const studentLevels = JSON.parse(localStorage.getItem('studentLevels') || '{}');

    students.forEach(student => {
        if (!studentLevels[student.id]) {
            studentLevels[student.id] = {
                level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
                enrolledModules: Math.floor(Math.random() * 3) + 1
            };
        }
    });

    localStorage.setItem('studentLevels', JSON.stringify(studentLevels));
};

// Initialize all admin data
export const initializeAdminData = () => {
    initializeAdminUser();
    initializePlatformSettings();
    initializeModules();
    initializeSubscriptions();
    initializeTeacherPayments();
    initializeStudentLevels();
};

// Helper functions for admin operations
export const getAdminStats = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const modules = JSON.parse(localStorage.getItem('modules') || '[]');
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
    const teacherPayments = JSON.parse(localStorage.getItem('teacherPayments') || '[]');

    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');

    const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const pendingPayments = subscriptions.filter(sub => sub.status === 'pending').length;

    const activeToday = users.filter(u => {
        const lastActive = new Date(u.lastActive);
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
    }).length;

    return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalModules: modules.length,
        totalRevenue,
        pendingPayments,
        activeToday
    };
};

export const searchUsers = (searchTerm, filters = {}) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const studentLevels = JSON.parse(localStorage.getItem('studentLevels') || '{}');
    const modules = JSON.parse(localStorage.getItem('modules') || '[]');

    let filtered = users.filter(u => u.role !== 'admin');

    // Search by name or email
    if (searchTerm) {
        filtered = filtered.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Filter by role
    if (filters.role && filters.role !== 'all') {
        filtered = filtered.filter(u => u.role === filters.role);
    }

    // Filter by student level
    if (filters.level && filters.level !== 'all') {
        filtered = filtered.filter(u => {
            if (u.role !== 'student') return false;
            return studentLevels[u.id]?.level === filters.level;
        });
    }

    // Filter by teacher module
    if (filters.module && filters.module !== 'all') {
        filtered = filtered.filter(u => {
            if (u.role !== 'teacher') return false;
            const module = modules.find(m => m.id === filters.module);
            return module?.assignedTeachers?.includes(u.id);
        });
    }

    return filtered;
};
