// Initial in-memory data store for the full-stack Next.js Placement Portal

export const initialUsers = [
  {
    id: 'u-1',
    email: 'student@portal.com',
    fullName: 'Vamshi Krishna',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    usn: '1DS21CS108',
    cgpa: 8.85,
    graduationYear: 2026,
    phone: '+91 98765 43210'
  },
  {
    id: 'u-2',
    email: 'faculty@portal.com',
    fullName: 'Dr. Ramesh Kumar',
    role: 'FACULTY',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Dept Placement Lead',
    phone: '+91 91234 56789'
  },
  {
    id: 'u-3',
    email: 'admin@portal.com',
    fullName: 'Placement Director',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Central Training & Placement Cell',
    designation: 'Head of Placements & Corporate Relations',
    phone: '+91 90000 11111'
  },
  {
    id: 'u-4',
    email: 'priya.s@portal.com',
    fullName: 'Priya Sharma',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Information Science',
    usn: '1DS21IS045',
    cgpa: 9.1,
    graduationYear: 2026
  },
  {
    id: 'u-5',
    email: 'rohit.v@portal.com',
    fullName: 'Rohit Verma',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Electronics & Communication',
    usn: '1DS21EC082',
    cgpa: 7.9,
    graduationYear: 2026
  }
];

export const initialScores = {
  soft_skills: 82,
  aptitude: 76,
  coding: 91,
  readiness_score: 84
};

export const initialSkills = [
  { id: 'sk-1', name: 'Data Structures & Algorithms', level: 'Advanced', verified: true, score: 92 },
  { id: 'sk-2', name: 'React & Next.js', level: 'Advanced', verified: true, score: 90 },
  { id: 'sk-3', name: 'Node.js & Express', level: 'Intermediate', verified: true, score: 84 },
  { id: 'sk-4', name: 'SQL & Database Optimization', level: 'Intermediate', verified: true, score: 78 },
  { id: 'sk-5', name: 'System Design Fundamentals', level: 'Intermediate', verified: false, score: 70 },
  { id: 'sk-6', name: 'Docker & Cloud Deployment', level: 'Beginner', verified: false, score: 62 }
];

export const initialProjects = [
  {
    id: 'p-1',
    studentName: 'Vamshi Krishna',
    studentUsn: '1DS21CS108',
    title: 'Cloud-Based Placement Intelligence Engine',
    description: 'Developed an automated resume screening and candidate-job matching engine with real-time analytics.',
    techStack: 'Next.js, Tailwind CSS, Node.js, PostgreSQL',
    liveUrl: 'https://placement-portal-demo.vercel.app',
    githubUrl: 'https://github.com/vamsh/placement-engine',
    status: 'APPROVED',
    feedback: 'Excellent architecture and solid test coverage. Recommended for tier-1 recruiter showcases.'
  },
  {
    id: 'p-2',
    studentName: 'Vamshi Krishna',
    studentUsn: '1DS21CS108',
    title: 'Distributed Log Aggregator & Alerting Daemon',
    description: 'High-throughput log collector processing over 5,000 events/sec with anomaly alerting.',
    techStack: 'Go, Kafka, Redis, Docker',
    liveUrl: '',
    githubUrl: 'https://github.com/vamsh/distributed-log-daemon',
    status: 'PENDING',
    feedback: 'Under review by Faculty Coordinator.'
  },
  {
    id: 'p-3',
    studentName: 'Priya Sharma',
    studentUsn: '1DS21IS045',
    title: 'Decentralized Micro-Credential Verifier',
    description: 'Smart contract verified student certificates and academic transcripts.',
    techStack: 'Solidity, React, IPFS, Web3',
    liveUrl: 'https://credentials-verify.eth.limo',
    githubUrl: 'https://github.com/priya/credentials',
    status: 'PENDING',
    feedback: 'Submitted for blockchain elective project credit.'
  }
];

export const initialCertificates = [
  {
    id: 'c-1',
    studentName: 'Vamshi Krishna',
    studentUsn: '1DS21CS108',
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    issueDate: '2025-11-15',
    credentialId: 'AWS-SAA-839219',
    status: 'APPROVED',
    evidenceUrl: 'https://aws.amazon.com/verification'
  },
  {
    id: 'c-2',
    studentName: 'Vamshi Krishna',
    studentUsn: '1DS21CS108',
    name: 'Meta Front-End Developer Specialization',
    issuer: 'Coursera / Meta',
    issueDate: '2026-02-10',
    credentialId: 'COURSERA-META-7712',
    status: 'PENDING',
    evidenceUrl: 'https://coursera.org/verify/META-7712'
  },
  {
    id: 'c-3',
    studentName: 'Rohit Verma',
    studentUsn: '1DS21EC082',
    name: 'Embedded Systems with ARM Cortex-M',
    issuer: 'edX / Texas Instruments',
    issueDate: '2026-01-20',
    credentialId: 'EDX-ARM-9941',
    status: 'PENDING',
    evidenceUrl: 'https://edx.org/verify'
  }
];

export const initialCompanies = [
  {
    companyId: 'comp-1',
    name: 'Google',
    role: 'Software Development Engineer - University Grad',
    logo: 'https://www.google.com/favicon.ico',
    ctc: '32.5 LPA',
    location: 'Bengaluru / Hyderabad',
    minCgpa: 8.0,
    requiredCodingScore: 85,
    deadline: '2026-10-15',
    status: 'OPEN',
    skills: ['DSA', 'System Design', 'Algorithms', 'Java/C++/Python'],
    eligibilityMatch: 95,
    applicationStatus: 'Eligible - Ready to Apply'
  },
  {
    companyId: 'comp-2',
    name: 'Microsoft',
    role: 'Software Engineer',
    logo: 'https://www.microsoft.com/favicon.ico',
    ctc: '26.8 LPA',
    location: 'Bengaluru / Noida',
    minCgpa: 7.5,
    requiredCodingScore: 78,
    deadline: '2026-10-22',
    status: 'OPEN',
    skills: ['Problem Solving', 'Data Structures', 'Operating Systems', 'OOP'],
    eligibilityMatch: 92,
    applicationStatus: 'Eligible - Application Submitted'
  },
  {
    companyId: 'comp-3',
    name: 'Amazon',
    role: 'SDE-1 (Graduate 2026)',
    logo: 'https://www.amazon.com/favicon.ico',
    ctc: '29.0 LPA',
    location: 'Bengaluru / Chennai',
    minCgpa: 7.5,
    requiredCodingScore: 80,
    deadline: '2026-11-05',
    status: 'OPEN',
    skills: ['Algorithms', 'Object-Oriented Design', 'Distributed Systems'],
    eligibilityMatch: 90,
    applicationStatus: 'Eligible - Ready to Apply'
  },
  {
    companyId: 'comp-4',
    name: 'Atlassian',
    role: 'Associate Software Engineer',
    logo: 'https://www.atlassian.com/favicon.ico',
    ctc: '34.0 LPA',
    location: 'Bengaluru (Remote/Hybrid)',
    minCgpa: 8.2,
    requiredCodingScore: 85,
    deadline: '2026-11-12',
    status: 'OPEN',
    skills: ['React', 'Java', 'Distributed Systems', 'CI/CD'],
    eligibilityMatch: 88,
    applicationStatus: 'Eligible - Ready to Apply'
  },
  {
    companyId: 'comp-5',
    name: 'Oracle',
    role: 'Member Technical Staff',
    logo: 'https://www.oracle.com/favicon.ico',
    ctc: '18.5 LPA',
    location: 'Bengaluru / Hyderabad',
    minCgpa: 7.0,
    requiredCodingScore: 70,
    deadline: '2026-10-30',
    status: 'OPEN',
    skills: ['Database Management', 'Java', 'Data Structures'],
    eligibilityMatch: 94,
    applicationStatus: 'Shortlisted for Round 1'
  }
];

export const initialCourses = [
  {
    id: 'course-1',
    title: 'DSA & High-Frequency Interview Patterns',
    category: 'Technical',
    instructor: 'Prof. Ananya Sen & FAANG Mentors',
    totalLessons: 18,
    completedLessons: 14,
    progress: 78,
    badge: 'Trending',
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc157b85641?w=400&auto=format&fit=crop&q=80',
    description: 'Master binary search variations, two pointers, graphs, sliding window, and dynamic programming patterns.',
    lessons: [
      { id: 'l1', title: 'Two Pointers & Sliding Window Mastery', duration: '32m', completed: true },
      { id: 'l2', title: 'Binary Search Over Solution Space', duration: '45m', completed: true },
      { id: 'l3', title: 'Graphs: BFS/DFS & Topological Sort', duration: '50m', completed: true },
      { id: 'l4', title: 'Dynamic Programming: 0/1 Knapsack & Grid DP', duration: '65m', completed: false },
      { id: 'l5', title: 'Tries & Disjoint Set Union (DSU)', duration: '40m', completed: false }
    ]
  },
  {
    id: 'course-2',
    title: 'Full-Stack System Design & Microservices',
    category: 'System Design',
    instructor: 'Arunav Roy (Staff Architect)',
    totalLessons: 12,
    completedLessons: 5,
    progress: 42,
    badge: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    description: 'Learn scalable caching, rate limiting, message queues, sharding, and resilience patterns.',
    lessons: [
      { id: 'l2-1', title: 'Horizontal Scaling vs Vertical Scaling', duration: '28m', completed: true },
      { id: 'l2-2', title: 'Cache Aside & Redis Clustering', duration: '42m', completed: true },
      { id: 'l2-3', title: 'Message Brokers: RabbitMQ vs Kafka', duration: '55m', completed: false },
      { id: 'l2-4', title: 'Database Sharding & Consistent Hashing', duration: '48m', completed: false }
    ]
  },
  {
    id: 'course-3',
    title: 'Aptitude, Quants & Logical Reasoning Crash Course',
    category: 'Aptitude',
    instructor: 'Kavitha M. (Lead Trainer)',
    totalLessons: 10,
    completedLessons: 9,
    progress: 90,
    badge: 'Core Prep',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
    description: 'Speed math, probability, permutations, syllogisms, and data interpretation shortcuts.',
    lessons: [
      { id: 'l3-1', title: 'Time, Speed & Distance Shortcuts', duration: '25m', completed: true },
      { id: 'l3-2', title: 'Permutations & Probability Matrix', duration: '35m', completed: true },
      { id: 'l3-3', title: 'Data Interpretation Charts & Tables', duration: '40m', completed: true }
    ]
  },
  {
    id: 'course-4',
    title: 'Corporate Behavioral Interviews (STAR Method)',
    category: 'Soft Skills',
    instructor: 'Sarah Jenkins (HR Partner)',
    totalLessons: 6,
    completedLessons: 6,
    progress: 100,
    badge: 'Completed',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
    description: 'Crafting compelling leadership stories, conflict resolution examples, and salary negotiation tactics.',
    lessons: [
      { id: 'l4-1', title: 'Deconstructing the STAR Framework', duration: '20m', completed: true },
      { id: 'l4-2', title: 'Answering: Tell Me About a Time You Failed', duration: '30m', completed: true },
      { id: 'l4-3', title: 'Questions to Ask Your Interviewer at the End', duration: '18m', completed: true }
    ]
  }
];

export const initialStudyMaterials = [
  {
    id: 'mat-1',
    title: 'FAANG Top 75 DSA Interview Blueprint (Curated Solutions)',
    category: 'Coding & Algorithms',
    format: 'PDF (2.4 MB)',
    author: 'Faculty Placement Cell',
    downloads: 412,
    dateAdded: '2026-03-01'
  },
  {
    id: 'mat-2',
    title: 'Core Operating Systems, DBMS & Computer Networks Rapid Review',
    category: 'Core Engineering',
    format: 'PDF (1.8 MB)',
    author: 'Dr. Ramesh Kumar',
    downloads: 380,
    dateAdded: '2026-02-18'
  },
  {
    id: 'mat-3',
    title: 'Amazon 16 Leadership Principles Case Interview Handbook',
    category: 'Behavioral & Leadership',
    format: 'DOCX (850 KB)',
    author: 'Training & Development Dept',
    downloads: 295,
    dateAdded: '2026-03-10'
  },
  {
    id: 'mat-4',
    title: 'Quantitative Aptitude Formula Cheat Sheet (2026 Edition)',
    category: 'Aptitude',
    format: 'PDF (1.1 MB)',
    author: 'Aptitude Cell',
    downloads: 520,
    dateAdded: '2026-01-25'
  }
];

export const initialAdminStats = {
  totalStudents: 480,
  placedStudents: 396,
  placementRate: '82.5%',
  averageCtc: '9.4 LPA',
  highestCtc: '44.0 LPA',
  activeDrives: 14,
  participatingCompanies: 68,
  departmentBreakdown: [
    { dept: 'CSE', placed: 165, total: 180, rate: '91.6%' },
    { dept: 'ISE', placed: 110, total: 120, rate: '91.6%' },
    { dept: 'ECE', placed: 85, total: 110, rate: '77.2%' },
    { dept: 'MECH / CIVIL', placed: 36, total: 70, rate: '51.4%' }
  ]
};
