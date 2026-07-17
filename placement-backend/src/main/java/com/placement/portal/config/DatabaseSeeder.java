package com.placement.portal.config;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final LessonRepository lessonRepo;
    private final QuizQuestionRepository quizRepo;
    private final SkillRepository skillRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;
    private final StudentProfileRepository profileRepo;
    private final StudentSkillRepository studentSkillRepo;
    private final SkillEvidenceRepository evidenceRepo;
    private final StudentCourseProgressRepository progressRepo;

    public DatabaseSeeder(UserRepository userRepo,
                          CourseRepository courseRepo,
                          LessonRepository lessonRepo,
                          QuizQuestionRepository quizRepo,
                          SkillRepository skillRepo,
                          BCryptPasswordEncoder passwordEncoder,
                          CompanyRepository companyRepo,
                          CompanyRequirementRepository requirementRepo,
                          StudentProfileRepository profileRepo,
                          StudentSkillRepository studentSkillRepo,
                          SkillEvidenceRepository evidenceRepo,
                          StudentCourseProgressRepository progressRepo) {
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.lessonRepo = lessonRepo;
        this.quizRepo = quizRepo;
        this.skillRepo = skillRepo;
        this.passwordEncoder = passwordEncoder;
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.profileRepo = profileRepo;
        this.studentSkillRepo = studentSkillRepo;
        this.evidenceRepo = evidenceRepo;
        this.progressRepo = progressRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Default Accounts
        if (userRepo.count() == 0) {
            // Student
            User student = new User();
            student.setEmail("student@portal.com");
            student.setFullName("Default Student");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setCreatedAt(LocalDateTime.now());
            userRepo.save(student);

            // Faculty
            User faculty = new User();
            faculty.setEmail("faculty@portal.com");
            faculty.setFullName("Dr. Sarah Jenkins");
            faculty.setPassword(passwordEncoder.encode("faculty123"));
            faculty.setRole(Role.FACULTY);
            faculty.setCreatedAt(LocalDateTime.now());
            userRepo.save(faculty);

            // Admin
            User admin = new User();
            admin.setEmail("admin@portal.com");
            admin.setFullName("System Administrator");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepo.save(admin);

            System.out.println(">>> Database Seeder: Standard testing credentials loaded:");
            System.out.println("  Student: student@portal.com / student123");
            System.out.println("  Faculty: faculty@portal.com / faculty123");
            System.out.println("  Admin:   admin@portal.com / admin123");
        }

        // 2. Seed Courses, Lessons & Quizzes
        if (courseRepo.count() == 0) {
            // SQL Developer Course
            Course sqlCourse = new Course();
            sqlCourse.setId("sql_dev");
            sqlCourse.setTitle("SQL Developer Boot Camp");
            sqlCourse.setDescription("Learn production database querying, join optimizations, clustered vs non-clustered indexing and execution plan analyses.");
            sqlCourse.setBadgeName("SQL Expert Badge");
            sqlCourse.setBadgeIcon("M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806");
            courseRepo.save(sqlCourse);

            // Lessons for SQL
            Lesson sqlL1 = new Lesson();
            sqlL1.setId("sql_l1");
            sqlL1.setCourse(sqlCourse);
            sqlL1.setTitle("SQL Joins & Performance");
            sqlL1.setContent("### Database Joins & Scan Optimization\nUnderstanding how tables are linked physically inside relational database systems:\n\n* **INNER JOIN**: Selects rows that have matching values in both tables.\n* **LEFT JOIN**: Returns all rows from the left table, and the matched rows from the right table. Matches without partner elements output `NULL`.\n\nOptimizing queries requires avoiding full table scans by indexing foreign key mapping columns.");
            lessonRepo.save(sqlL1);

            Lesson sqlL2 = new Lesson();
            sqlL2.setId("sql_l2");
            sqlL2.setCourse(sqlCourse);
            sqlL2.setTitle("Clustered vs Non-Clustered Indexes");
            sqlL2.setContent("### Indexing Architecture\nIndexes speed up query execution plans by building binary search tree reference structures:\n\n1. **Clustered Index**: Physical sorting constraint. Only one clustered index can exist per table (physically sorts table rows).\n2. **Non-Clustered Index**: Logical pointer lists referencing physical records. It has a structure separate from data rows.");
            lessonRepo.save(sqlL2);

            // Quiz for SQL
            QuizQuestion sqlQ1 = new QuizQuestion();
            sqlQ1.setCourse(sqlCourse);
            sqlQ1.setQuestion("Which index physically sorts records inside a SQL table?");
            sqlQ1.setOptions("Non-Clustered Index,Clustered Index,Unique Hash Index,Reverse Index");
            sqlQ1.setAnswer(1); // Clustered Index (index 1)
            quizRepo.save(sqlQ1);

            QuizQuestion sqlQ2 = new QuizQuestion();
            sqlQ2.setCourse(sqlCourse);
            sqlQ2.setQuestion("Which SQL clause filters groups after GROUP BY?");
            sqlQ2.setOptions("WHERE,HAVING,ORDER BY,SELECT");
            sqlQ2.setAnswer(1); // HAVING (index 1)
            quizRepo.save(sqlQ2);


            // DSA Academy Course
            Course dsaCourse = new Course();
            dsaCourse.setId("dsa_basics");
            dsaCourse.setTitle("Data Structures & Algorithms Mastery");
            dsaCourse.setDescription("Ace technical programming evaluations. Study tree complexities, stacks and queues structures, and time efficiency constraints.");
            dsaCourse.setBadgeName("DSA Master Badge");
            dsaCourse.setBadgeIcon("M12 6.253v13m0-13C10.832 5.477 9.246 5");
            courseRepo.save(dsaCourse);

            // Lessons for DSA
            Lesson dsaL1 = new Lesson();
            dsaL1.setId("dsa_l1");
            dsaL1.setCourse(dsaCourse);
            dsaL1.setTitle("Trees & BST Complexity");
            dsaL1.setContent("### Binary Search Tree Complexity\nA Binary Search Tree (BST) stores elements such that left node values are smaller, and right node values are larger.\n\n* **Balanced Tree Search Complexity**: `O(log n)` worst case.\n* **Skewed Tree Search Complexity**: `O(n)` worst case, collapsing into linear lookup operations.");
            lessonRepo.save(dsaL1);

            Lesson dsaL2 = new Lesson();
            dsaL2.setId("dsa_l2");
            dsaL2.setCourse(dsaCourse);
            dsaL2.setTitle("Stacks & Queues operations");
            dsaL2.setContent("### Stack vs Queue Structures\n* **Stack**: LIFO (Last In, First Out) structure. Operations: `push` (adds to top), `pop` (removes from top) in `O(1)` time complexity.\n* **Queue**: FIFO (First In, First Out) structure. Elements are added at the rear (enqueue) and removed from the front (dequeue).");
            lessonRepo.save(dsaL2);

            // Quiz for DSA
            QuizQuestion dsaQ1 = new QuizQuestion();
            dsaQ1.setCourse(dsaCourse);
            dsaQ1.setQuestion("What is the worst-case search complexity in a balanced BST?");
            dsaQ1.setOptions("O(1),O(n),O(log n),O(n log n)");
            dsaQ1.setAnswer(2); // O(log n) (index 2)
            quizRepo.save(dsaQ1);

            QuizQuestion dsaQ2 = new QuizQuestion();
            dsaQ2.setCourse(dsaCourse);
            dsaQ2.setQuestion("Which data structure operates on a First-In-First-Out (FIFO) basis?");
            dsaQ2.setOptions("Stack,Queue,Binary Tree,Linked List");
            dsaQ2.setAnswer(1); // Queue (index 1)
            quizRepo.save(dsaQ2);

            System.out.println(">>> Database Seeder: Courses, Lessons, and Quizzes seeded successfully.");
        }

        // Seed Skills & Skill-based Questions
        seedSkillAndQuestions("Java", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("What is the parent class of all classes in Java?", "Class,Object,Interface,String", 1),
            new QData("Which of these is not a primitive type in Java?", "int,boolean,char,String", 3),
            new QData("What is garbage collection in Java?", "Manual memory clearing,Automatic memory management,Deleting empty files,System reboot", 1),
            new QData("Which keyword makes a variable constant in Java?", "constant,final,static,volatile", 1),
            new QData("Which method is the entry point of any Java program?", "main,start,run,init", 0)
        ));

        seedSkillAndQuestions("SQL", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("What does SQL stand for?", "Structured Query Language,Simple Query Logic,Sequential Query List,Standard Query Line", 0),
            new QData("Which SQL command is used to retrieve data?", "ADD,GET,SELECT,RETRIEVE", 2),
            new QData("Which keyword removes duplicate rows in SELECT?", "UNIQUE,DISTINCT,DIFFERENT,SINGLE", 1),
            new QData("What is a PRIMARY KEY?", "A unique identifier for each row,A password for the database,A foreign key reference,A logical index", 0),
            new QData("Which clause is used to filter records in SQL?", "HAVING,WHERE,GROUP BY,FILTER", 1)
        ));

        seedSkillAndQuestions("Python", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("How do you start a comment in Python?", "//,/*,#,--", 2),
            new QData("Which data type is mutable in Python?", "Tuple,String,List,Integer", 2),
            new QData("How do you define a function in Python?", "func,def,function,define", 1),
            new QData("What is the output of len([1, 2, 3])?", "1,2,3,4", 2),
            new QData("Which operator is used for exponentiation in Python?", "^,**,exp,pow", 1)
        ));

        seedSkillAndQuestions("React", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("What is a component in React?", "A CSS stylesheet,A reusable UI piece,A backend controller,A database schema", 1),
            new QData("Which hook is used to manage state in a functional component?", "useEffect,useContext,useState,useReducer", 2),
            new QData("Which hook is used to run side effects in React?", "useEffect,useCallback,useMemo,useState", 0),
            new QData("What is the virtual DOM?", "A lightweight copy of the real DOM,A physical browser window,An alternative to HTML,A server side database", 0),
            new QData("How are props passed to a component?", "Via URL query,As arguments to function,As HTML attributes,Through database tables", 2)
        ));

        seedSkillAndQuestions("JavaScript", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("Which keyword declares a block-scoped local variable?", "var,let,const,both let and const", 3),
            new QData("What is the correct syntax for an arrow function?", "() => {},function() {},arrow => {},() -> {}", 0),
            new QData("What does 'NaN' stand for in JS?", "Null and Nil,Not a Number,Number and Name,New and Null", 1),
            new QData("How do you write a conditional statement in JS?", "if,when,select,where", 0),
            new QData("Which method adds an element to the end of an array?", "push,pop,unshift,shift", 0)
        ));

        seedSkillAndQuestions("HTML/CSS", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("Which HTML tag is used for the largest heading?", "<h6>,<h1>,<heading>,<head>", 1),
            new QData("What is the default display property of a div?", "inline,inline-block,block,flex", 2),
            new QData("Which CSS property changes the text color?", "background-color,color,font-color,text-color", 1),
            new QData("What does HTML stand for?", "HyperText Markup Language,HomeTool Markup Language,Hyperlink Text Mark,HighText Machine Language", 0),
            new QData("Which CSS property controls the spacing outside an element?", "padding,margin,border,spacing", 1)
        ));

        seedSkillAndQuestions("Spring Boot", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("Which annotation marks a class as a Spring Boot application?", "@SpringBootApplication,@RestController,@Autowired,@Configuration", 0),
            new QData("What is dependency injection in Spring?", "Providing objects a class needs,Creating external databases,Injecting HTML to page,Running manual queries", 0),
            new QData("Which annotation defines a REST controller?", "@Controller,@RestController,@Service,@Component", 1),
            new QData("Which annotation maps HTTP GET requests?", "@GetMapping,@PostMapping,@RequestMapping,@GET", 0),
            new QData("What is the default embedded web server in Spring Boot?", "Tomcat,Jetty,Undertow,Nginx", 0)
        ));

        seedSkillAndQuestions("Node.js", SkillCategory.TECHNICAL, Arrays.asList(
            new QData("What is Node.js?", "A frontend library,A JavaScript runtime environment,A database system,A styling framework", 1),
            new QData("Which package manager is default for Node.js?", "pip,npm,maven,nuget", 1),
            new QData("Which module is used to handle file paths in Node.js?", "path,fs,http,url", 0),
            new QData("How do you import a module in Node.js using CommonJS?", "import,require,include,load", 1),
            new QData("What does npm stand for?", "Node Project Manager,Node Package Manager,New Project Machine,Network Protocol Manager", 1)
        ));

        // 3. Seed Companies and Placement Drives
        if (companyRepo.count() == 0) {
            seedCompanies();
        }

        // 4. Seed Top 10 Students for analytics
        if (userRepo.count() <= 3) {
            seedTop10Students();
        }
    }

    private void seedCompanies() {
        // 1. Google
        Company google = new Company();
        google.setName("Google");
        google.setRole("Software Engineer (SWE)");
        google.setMinCgpa(9.0);
        google.setVisitDate(LocalDate.now().plusDays(30));
        google.setDescription("Google is hiring MCA/PG students for software engineer roles. Focus areas: Data Structures & Algorithms, Systems, Java/C++, and scalable schemas.");
        companyRepo.save(google);

        // 2. Amazon
        Company amazon = new Company();
        amazon.setName("Amazon");
        amazon.setRole("Cloud Software Engineer");
        amazon.setMinCgpa(8.5);
        amazon.setVisitDate(LocalDate.now().plusDays(45));
        amazon.setDescription("Amazon Web Services (AWS) team is looking for cloud engineering roles. Primary requirements: SQL database optimization, systems design, and Python.");
        companyRepo.save(amazon);

        // 3. Microsoft
        Company microsoft = new Company();
        microsoft.setName("Microsoft");
        microsoft.setRole("Frontend Engineer");
        microsoft.setMinCgpa(8.0);
        microsoft.setVisitDate(LocalDate.now().plusDays(60));
        microsoft.setDescription("Microsoft Azure portal team is looking for Frontend developers experienced in modern web architecture, React, and CSS/HTML standards.");
        companyRepo.save(microsoft);

        // 4. TechCorp
        Company techcorp = new Company();
        techcorp.setName("TechCorp");
        techcorp.setRole("Fullstack Developer");
        techcorp.setMinCgpa(7.5);
        techcorp.setVisitDate(LocalDate.now().plusDays(15));
        techcorp.setDescription("TechCorp is a fast-growing SaaS startup. Hiring fullstack engineers with knowledge in Spring Boot, React, and PostgreSQL.");
        companyRepo.save(techcorp);

        // 5. Infosys
        Company infosys = new Company();
        infosys.setName("Infosys");
        infosys.setRole("Associate Consultant");
        infosys.setMinCgpa(6.0);
        infosys.setVisitDate(LocalDate.now().plusDays(10));
        infosys.setDescription("Infosys is hiring associate engineers for global consulting projects. Candidates will undergo onboarding training in Java, SQL, and Agile methodologies.");
        companyRepo.save(infosys);

        // Seed Requirements
        Skill java = skillRepo.findByName("Java").orElse(null);
        Skill sql = skillRepo.findByName("SQL").orElse(null);
        Skill react = skillRepo.findByName("React").orElse(null);
        Skill python = skillRepo.findByName("Python").orElse(null);
        Skill dsa = skillRepo.findByName("Core Coding").orElseGet(() -> {
            Skill s = new Skill();
            s.setName("Core Coding");
            s.setCategory(SkillCategory.TECHNICAL);
            return skillRepo.save(s);
        });

        if (java != null) {
            saveRequirement(google, java, 4.0, 40.0);
            saveRequirement(techcorp, java, 3.5, 30.0);
            saveRequirement(infosys, java, 3.0, 50.0);
        }
        if (dsa != null) {
            saveRequirement(google, dsa, 4.2, 60.0);
            saveRequirement(amazon, dsa, 3.8, 30.0);
        }
        if (sql != null) {
            saveRequirement(amazon, sql, 4.0, 40.0);
            saveRequirement(techcorp, sql, 3.0, 30.0);
            saveRequirement(infosys, sql, 2.5, 50.0);
        }
        if (react != null) {
            saveRequirement(microsoft, react, 4.0, 70.0);
            saveRequirement(techcorp, react, 3.5, 40.0);
        }
        if (python != null) {
            saveRequirement(amazon, python, 3.5, 30.0);
            saveRequirement(microsoft, python, 3.0, 30.0);
        }
        System.out.println(">>> Database Seeder: Companies and requirements loaded successfully.");
    }

    private void saveRequirement(Company company, Skill skill, double minRating, double weightage) {
        CompanyRequirement req = new CompanyRequirement();
        req.setCompany(company);
        req.setSkill(skill);
        req.setMinRating(minRating);
        req.setWeightage(weightage);
        requirementRepo.save(req);
    }

    private void seedTop10Students() {
        String[] names = {
            "Aravind Swamy", "Bhavana Reddy", "Chaitanya Kumar", "Divya N",
            "Eshwar Prasad", "Fathima Begum", "Ganesh Hegde", "Harish K",
            "Indu S", "Jayanth M"
        };
        double[] cgpas = { 9.6, 9.4, 9.1, 8.8, 8.4, 7.8, 7.2, 6.8, 6.2, 5.5 };
        
        Skill softSkill = getOrSeedSkill("Soft Skills", SkillCategory.SOFT_SKILL);
        Skill aptitude = getOrSeedSkill("Quantitative Aptitude", SkillCategory.APTITUDE);
        Skill coding = getOrSeedSkill("Core Coding", SkillCategory.TECHNICAL);
        
        Skill java = skillRepo.findByName("Java").orElse(null);
        Skill sql = skillRepo.findByName("SQL").orElse(null);
        Skill react = skillRepo.findByName("React").orElse(null);
        Skill python = skillRepo.findByName("Python").orElse(null);

        for (int i = 0; i < names.length; i++) {
            String name = names[i];
            double cgpa = cgpas[i];
            String email = name.toLowerCase().replace(" ", "") + "@portal.com";
            
            // Create user
            User student = new User();
            student.setEmail(email);
            student.setFullName(name);
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setCreatedAt(LocalDateTime.now());
            userRepo.save(student);
            
            // Create profile
            StudentProfile profile = new StudentProfile(student);
            profile.setHighestDegree("MCA");
            profile.setHighestYop(2026);
            profile.setDegreeCgpa(cgpa);
            profile.setDegreeName("MCA");
            profile.setDegreeStream("Computer Applications");
            profile.setDegreeCollege("Silicon Valley Institute of Technology");
            profile.setDegreeUniversity("Visvesvaraya Technological University");
            profile.setPhone("98765432" + i + i);
            profile.setGender(i % 2 == 0 ? "Male" : "Female");
            profile.setDob(LocalDate.of(2002, 1 + (i % 12), 15));
            profile.setTemporaryAddress("Bengaluru, Karnataka");
            profileRepo.save(profile);

            // Seed Core Evidence (scores for soft, aptitude, coding)
            double baseRating = 5.0 - (i * 0.4); // ranges from 5.0 down to ~1.4
            baseRating = Math.max(1.0, Math.min(5.0, baseRating));
            
            saveEvidence(student, softSkill, Math.round(baseRating * 10.0) / 10.0);
            saveEvidence(student, aptitude, Math.round((baseRating + 0.2) * 10.0) / 10.0);
            saveEvidence(student, coding, Math.round((baseRating - 0.2) * 10.0) / 10.0);

            // Add technical skills to StudentSkill
            if (java != null && i % 2 == 0) {
                saveStudentSkill(student, java, "EXPERT", Math.round(baseRating * 10.0) / 10.0);
            }
            if (sql != null && i % 3 == 0) {
                saveStudentSkill(student, sql, "INTERMEDIATE", Math.round((baseRating + 0.3) * 10.0) / 10.0);
            }
            if (react != null && i % 2 == 1) {
                saveStudentSkill(student, react, "INTERMEDIATE", Math.round(baseRating * 10.0) / 10.0);
            }
            if (python != null && i % 4 == 0) {
                saveStudentSkill(student, python, "BEGINNER", Math.round(baseRating * 10.0) / 10.0);
            }
        }
        System.out.println(">>> Database Seeder: Top 10 Student records and profiles created successfully.");
    }

    private Skill getOrSeedSkill(String name, SkillCategory cat) {
        return skillRepo.findByName(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory(cat);
                    return skillRepo.save(s);
                });
    }

    private void saveEvidence(User student, Skill skill, double rating) {
        SkillEvidence evidence = new SkillEvidence();
        evidence.setStudent(student);
        evidence.setSkill(skill);
        evidence.setType(EvidenceType.MOCK_TEST);
        evidence.setRawScore(rating * 20.0);
        evidence.setDerivedRating(rating);
        evidence.setComment("Seeded baseline assessment.");
        evidence.setCreatedAt(LocalDateTime.now().minusDays(5));
        evidenceRepo.save(evidence);
    }

    private void saveStudentSkill(User student, Skill skill, String level, double rating) {
        StudentSkill ss = new StudentSkill();
        ss.setStudent(student);
        ss.setSkill(skill);
        ss.setLevel(level);
        ss.setRating(rating);
        ss.setCertificateStatus("APPROVED");
        studentSkillRepo.save(ss);
    }

    private void seedSkillAndQuestions(String name, SkillCategory category, List<QData> questions) {
        Skill skill = skillRepo.findByName(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory(category);
                    return skillRepo.save(s);
                });

        for (QData q : questions) {
            if (quizRepo.findByQuestion(q.question).isEmpty()) {
                QuizQuestion question = new QuizQuestion(skill, q.question, q.options, q.answer);
                quizRepo.save(question);
            }
        }
    }

    private static class QData {
        String question;
        String options;
        int answer;
        QData(String question, String options, int answer) {
            this.question = question;
            this.options = options;
            this.answer = answer;
        }
    }
}
