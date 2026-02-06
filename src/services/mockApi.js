// Mock API service for demo purposes
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize subjects and lessons data
const initializeSubjectData = () => {
    if (!localStorage.getItem('subjectLessons')) {
        const subjectLessons = {
            'Mathematics': [
                { _id: 'math_1', title: 'Algebra Basics', description: 'Introduction to algebraic concepts', videoUrl: 'https://youtube.com/watch?v=example1', thumbnailUrl: 'https://via.placeholder.com/400x250?text=Algebra', subject: 'Mathematics', createdAt: new Date().toISOString() },
                { _id: 'math_2', title: 'Geometry Fundamentals', description: 'Basic geometric shapes and formulas', videoUrl: 'https://youtube.com/watch?v=example2', thumbnailUrl: 'https://via.placeholder.com/400x250?text=Geometry', subject: 'Mathematics', createdAt: new Date().toISOString() }
            ],
            'Physics': [
                { _id: 'phys_1', title: 'Newton\'s Laws', description: 'Understanding motion and forces', videoUrl: 'https://youtube.com/watch?v=example3', thumbnailUrl: 'https://via.placeholder.com/400x250?text=Physics', subject: 'Physics', createdAt: new Date().toISOString() }
            ],
            'Computer Science': [
                { _id: 'cs_1', title: 'Programming Basics', description: 'Introduction to coding', videoUrl: 'https://youtube.com/watch?v=example4', thumbnailUrl: 'https://via.placeholder.com/400x250?text=Programming', subject: 'Computer Science', createdAt: new Date().toISOString() }
            ],
            'Chemistry': [],
            'English Literature': [],
            'History': [],
            'Biology': [],
            'Geography': []
        };
        localStorage.setItem('subjectLessons', JSON.stringify(subjectLessons));
    }
};

initializeSubjectData();

const mockApi = {
    // Get teacher dashboard stats
    get: async (url) => {
        await delay(300); // Simulate network delay
        
        if (url === '/teachers/dashboard') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const completionLog = JSON.parse(localStorage.getItem('completionLog') || '[]');
            const subjectLessons = JSON.parse(localStorage.getItem('subjectLessons') || '{}');
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            const teacherSubject = currentUser.subject;
            const subjectCompletions = completionLog.filter(log => log.subject === teacherSubject);
            const today = new Date().toDateString();
            const completionsToday = subjectCompletions.filter(log => 
                new Date(log.completedAt).toDateString() === today
            ).length;
            
            const uniqueStudents = new Set(subjectCompletions.map(log => log.studentId)).size;
            const subjectLessonsCount = subjectLessons[teacherSubject]?.length || 0;
            
            return {
                data: {
                    success: true,
                    data: {
                        stats: {
                            studentsCount: users.filter(u => u.role === 'student').length,
                            subjectLessonsCount,
                            completionsToday,
                            activeStudents: uniqueStudents
                        }
                    }
                }
            };
        }
        
        if (url === '/teachers/students') {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const students = users.filter(user => user.role === 'student');
            return {
                data: {
                    success: true,
                    data: students
                }
            };
        }
        
        if (url === '/teachers/modules') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            
            if (teacherSubject) {
                const module = {
                    _id: `mod_${teacherSubject.toLowerCase().replace(/\s+/g, '_')}`,
                    title: teacherSubject,
                    level: 'All Levels',
                    lessons: []
                };
                return { data: { success: true, data: [module] } };
            }
            return { data: { success: true, data: [] } };
        }
        
        // Get lessons for a module
        if (url.includes('/modules/') && url.includes('/lessons')) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectLessons = JSON.parse(localStorage.getItem('subjectLessons') || '{}');
            const lessons = subjectLessons[teacherSubject] || [];
            return { data: { success: true, data: lessons } };
        }
        
        // Get resources for a module
        if (url.includes('/modules/') && url.includes('/resources')) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectResources = JSON.parse(localStorage.getItem('subjectResources') || '{}');
            const resources = subjectResources[teacherSubject] || [];
            return { data: { success: true, data: resources } };
        }
        
        // Get student progress
        if (url.includes('/teachers/students/') && url.includes('/progress')) {
            const studentId = url.split('/')[3];
            const progress = JSON.parse(localStorage.getItem('studentProgress') || '{}');
            return { data: { success: true, data: progress[studentId]?.courses || [] } };
        }
        
        // Admin endpoints
        if (url === '/admin/statistics/overview') {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const subjectLessons = JSON.parse(localStorage.getItem('subjectLessons') || '{}');
            const completionLog = JSON.parse(localStorage.getItem('completionLog') || '[]');
            const payments = JSON.parse(localStorage.getItem('studentPayments') || '{}');
            
            const totalStudents = users.filter(u => u.role === 'student').length;
            const totalTeachers = users.filter(u => u.role === 'teacher').length;
            const totalLessons = Object.values(subjectLessons).reduce((sum, lessons) => sum + lessons.length, 0);
            const totalModules = Object.keys(subjectLessons).length;
            const totalRevenue = Object.values(payments).filter(p => p.status === 'paid').length * 29.99;
            const today = new Date().toDateString();
            const activeToday = completionLog.filter(log => new Date(log.completedAt).toDateString() === today).length;
            
            return {
                data: {
                    success: true,
                    data: {
                        totalStudents,
                        totalTeachers,
                        totalModules,
                        totalRevenue,
                        totalLessons,
                        activeToday
                    }
                }
            };
        }
        
        if (url.startsWith('/admin/users')) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            return { data: { success: true, data: users } };
        }
        
        throw new Error('Endpoint not found');
    },
    
    // Create new items
    post: async (url, data) => {
        await delay(300);
        
        if (url === '/lessons') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectLessons = JSON.parse(localStorage.getItem('subjectLessons') || '{}');
            
            if (!subjectLessons[teacherSubject]) {
                subjectLessons[teacherSubject] = [];
            }
            
            const newLesson = {
                _id: 'lesson_' + Date.now(),
                ...data,
                subject: teacherSubject,
                createdAt: new Date().toISOString()
            };
            
            subjectLessons[teacherSubject].push(newLesson);
            localStorage.setItem('subjectLessons', JSON.stringify(subjectLessons));
            return { data: { success: true, data: newLesson } };
        }
        
        if (url === '/resources') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectResources = JSON.parse(localStorage.getItem('subjectResources') || '{}');
            
            if (!subjectResources[teacherSubject]) {
                subjectResources[teacherSubject] = [];
            }
            
            const newResource = {
                _id: 'resource_' + Date.now(),
                ...data,
                subject: teacherSubject,
                createdAt: new Date().toISOString()
            };
            
            subjectResources[teacherSubject].push(newResource);
            localStorage.setItem('subjectResources', JSON.stringify(subjectResources));
            return { data: { success: true, data: newResource } };
        }
        
        if (url === '/upload') {
            // Mock file upload - return a fake URL
            return {
                data: {
                    success: true,
                    data: {
                        url: 'https://via.placeholder.com/400x250?text=Uploaded+Image'
                    }
                }
            };
        }
        
        throw new Error('Endpoint not found');
    },
    
    // Update items
    put: async (url, data) => {
        await delay(300);
        
        if (url.includes('/lessons/')) {
            const lessonId = url.split('/')[2];
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectLessons = JSON.parse(localStorage.getItem('subjectLessons') || '{}');
            
            if (subjectLessons[teacherSubject]) {
                const index = subjectLessons[teacherSubject].findIndex(lesson => lesson._id === lessonId);
                if (index !== -1) {
                    subjectLessons[teacherSubject][index] = { 
                        ...subjectLessons[teacherSubject][index], 
                        ...data, 
                        updatedAt: new Date().toISOString() 
                    };
                    localStorage.setItem('subjectLessons', JSON.stringify(subjectLessons));
                    return { data: { success: true, data: subjectLessons[teacherSubject][index] } };
                }
            }
        }
        
        if (url.includes('/resources/')) {
            const resourceId = url.split('/')[2];
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectResources = JSON.parse(localStorage.getItem('subjectResources') || '{}');
            
            if (subjectResources[teacherSubject]) {
                const index = subjectResources[teacherSubject].findIndex(resource => resource._id === resourceId);
                if (index !== -1) {
                    subjectResources[teacherSubject][index] = { 
                        ...subjectResources[teacherSubject][index], 
                        ...data, 
                        updatedAt: new Date().toISOString() 
                    };
                    localStorage.setItem('subjectResources', JSON.stringify(subjectResources));
                    return { data: { success: true, data: subjectResources[teacherSubject][index] } };
                }
            }
        }
        
        throw new Error('Item not found');
    },
    
    // Delete items
    delete: async (url) => {
        await delay(300);
        
        if (url.includes('/lessons/')) {
            const lessonId = url.split('/')[2];
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectLessons = JSON.parse(localStorage.getItem('subjectLessons') || '{}');
            
            if (subjectLessons[teacherSubject]) {
                subjectLessons[teacherSubject] = subjectLessons[teacherSubject].filter(lesson => lesson._id !== lessonId);
                localStorage.setItem('subjectLessons', JSON.stringify(subjectLessons));
            }
            return { data: { success: true } };
        }
        
        if (url.includes('/resources/')) {
            const resourceId = url.split('/')[2];
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const teacherSubject = currentUser.subject;
            const subjectResources = JSON.parse(localStorage.getItem('subjectResources') || '{}');
            
            if (subjectResources[teacherSubject]) {
                subjectResources[teacherSubject] = subjectResources[teacherSubject].filter(resource => resource._id !== resourceId);
                localStorage.setItem('subjectResources', JSON.stringify(subjectResources));
            }
            return { data: { success: true } };
        }
        
        throw new Error('Item not found');
    }
};

export default mockApi;