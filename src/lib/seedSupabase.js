const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kemetwenttjawedzquqh.supabase.co';
const supabaseKey = 'sb_publishable_whx2NpETLD2LNVuVW1z2LQ_OtJzQGt3';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting Supabase database seed...');

  // 1. Companies
  const companies = [
    {
      id: 'comp-1',
      name: 'Google',
      role: 'Software Development Engineer - University Grad',
      ctc: '32.5 LPA',
      location: 'Bengaluru / Hyderabad',
      min_cgpa: 8.0,
      required_coding_score: 85,
      deadline: '2026-10-15',
      status: 'OPEN',
      skills: ['DSA', 'System Design', 'Algorithms', 'Java/C++/Python']
    },
    {
      id: 'comp-2',
      name: 'Microsoft',
      role: 'Software Engineer',
      ctc: '26.8 LPA',
      location: 'Bengaluru / Noida',
      min_cgpa: 7.5,
      required_coding_score: 78,
      deadline: '2026-10-22',
      status: 'OPEN',
      skills: ['Problem Solving', 'Data Structures', 'Operating Systems']
    },
    {
      id: 'comp-3',
      name: 'Amazon',
      role: 'SDE-1 (Graduate 2026)',
      ctc: '29.0 LPA',
      location: 'Bengaluru / Chennai',
      min_cgpa: 7.5,
      required_coding_score: 80,
      deadline: '2026-11-05',
      status: 'OPEN',
      skills: ['Algorithms', 'Object-Oriented Design', 'Distributed Systems']
    },
    {
      id: 'comp-4',
      name: 'Atlassian',
      role: 'Associate Software Engineer',
      ctc: '34.0 LPA',
      location: 'Bengaluru',
      min_cgpa: 8.2,
      required_coding_score: 85,
      deadline: '2026-11-12',
      status: 'OPEN',
      skills: ['React', 'Java', 'Distributed Systems', 'CI/CD']
    }
  ];

  const compRes = await supabase.from('companies').upsert(companies);
  console.log('Companies seeded:', compRes.status);

  // 2. Projects
  const projects = [
    {
      id: 'p-1',
      student_name: 'Vamshi Krishna',
      student_usn: '1DS21CS108',
      title: 'Cloud-Based Placement Intelligence Engine',
      description: 'Automated resume screening and candidate-job matching engine with real-time analytics.',
      tech_stack: 'Next.js, Tailwind CSS, Node.js, PostgreSQL',
      live_url: 'https://placement-portal-demo.vercel.app',
      github_url: 'https://github.com/vamsh/placement-engine',
      status: 'APPROVED',
      feedback: 'Excellent architecture and solid test coverage. Recommended for tier-1 recruiter showcases.'
    },
    {
      id: 'p-2',
      student_name: 'Vamshi Krishna',
      student_usn: '1DS21CS108',
      title: 'Distributed Log Aggregator & Alerting Daemon',
      description: 'High-throughput log collector processing over 5,000 events/sec with anomaly alerting.',
      tech_stack: 'Go, Kafka, Redis, Docker',
      live_url: '',
      github_url: 'https://github.com/vamsh/distributed-log-daemon',
      status: 'PENDING',
      feedback: 'Under review by Faculty Coordinator.'
    }
  ];

  const projRes = await supabase.from('projects').upsert(projects);
  console.log('Projects seeded:', projRes.status);

  // 3. Certificates
  const certificates = [
    {
      id: 'c-1',
      student_name: 'Vamshi Krishna',
      student_usn: '1DS21CS108',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issue_date: '2025-11-15',
      credential_id: 'AWS-SAA-839219',
      status: 'APPROVED',
      evidence_url: 'https://aws.amazon.com/verification'
    }
  ];

  const certRes = await supabase.from('certificates').upsert(certificates);
  console.log('Certificates seeded:', certRes.status);

  // 4. Study Materials
  const materials = [
    {
      id: 'mat-1',
      title: 'FAANG Top 75 DSA Interview Blueprint (Curated Solutions)',
      category: 'Coding & Algorithms',
      format: 'PDF',
      author: 'Faculty Placement Cell',
      downloads: 412
    },
    {
      id: 'mat-2',
      title: 'Core Operating Systems, DBMS & Computer Networks Rapid Review',
      category: 'Core Engineering',
      format: 'PDF',
      author: 'Dr. Ramesh Kumar',
      downloads: 380
    }
  ];

  const matRes = await supabase.from('study_materials').upsert(materials);
  console.log('Materials seeded:', matRes.status);

  console.log('Database seeding finished successfully!');
}

seed().catch(console.error);
