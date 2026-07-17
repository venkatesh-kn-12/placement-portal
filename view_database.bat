@echo off
title Placement Portal Database Inspector
color 0B

:menu
cls
echo =================================================================
echo       🚀 PLACEMENT PORTAL - DATABASE INSPECTOR UTILITY 🚀
echo =================================================================
echo.
echo [1] Show Database Overview (Tables and Row Counts)
echo [2] View Registered Users (Name, Email, Roles)
echo [3] View Student Profiles (Academic Qualifications and CGPA)
echo [4] View Courses & Lessons (Learning Content Setup)
echo [5] View Companies & Requirements (Hiring Partners & Minimum Ratings)
echo [6] Open Interactive PostgreSQL SQL Shell (psql CLI)
echo [7] Exit
echo.
echo =================================================================
set /p opt="Select an option (1-7): "

if "%opt%"=="1" goto overview
if "%opt%"=="2" goto users
if "%opt%"=="3" goto students
if "%opt%"=="4" goto courses
if "%opt%"=="5" goto companies
if "%opt%"=="6" goto shell
if "%opt%"=="7" goto end

echo.
echo [!] Invalid option. Please select between 1 and 7.
pause
goto menu

:overview
cls
echo =================================================================
echo               DATABASE TABLES & CURRENT ROW COUNTS
echo =================================================================
echo.
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT 'users' as table_name, count(*) as row_count FROM users UNION ALL SELECT 'student_profiles', count(*) FROM student_profiles UNION ALL SELECT 'company', count(*) FROM company UNION ALL SELECT 'company_requirement', count(*) FROM company_requirement UNION ALL SELECT 'courses', count(*) FROM courses UNION ALL SELECT 'lessons', count(*) FROM lessons UNION ALL SELECT 'materials', count(*) FROM materials UNION ALL SELECT 'quiz_questions', count(*) FROM quiz_questions UNION ALL SELECT 'resumes', count(*) FROM resumes UNION ALL SELECT 'skill', count(*) FROM skill UNION ALL SELECT 'skill_evidence', count(*) FROM skill_evidence UNION ALL SELECT 'student_certificates', count(*) FROM student_certificates UNION ALL SELECT 'student_projects', count(*) FROM student_projects UNION ALL SELECT 'student_skills', count(*) FROM student_skills UNION ALL SELECT 'student_course_progress', count(*) FROM student_course_progress ORDER BY row_count DESC;"
echo.
pause
goto menu

:users
cls
echo =================================================================
echo                     REGISTERED USERS LIST
echo =================================================================
echo.
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT id, email, role, full_name, created_at FROM users ORDER BY id ASC;"
echo.
pause
goto menu

:students
cls
echo =================================================================
echo              STUDENT ACADEMIC & QUALIFICATION PROFILES
echo =================================================================
echo.
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT sp.id, sp.user_id, u.full_name, u.email, sp.degree_name as degree, sp.degree_stream as stream, sp.degree_cgpa as cgpa, sp.phone FROM student_profiles sp JOIN users u ON sp.user_id = u.id ORDER BY sp.id ASC;"
echo.
pause
goto menu

:courses
cls
echo =================================================================
echo                  COURSES AND LESSONS OVERVIEW
echo =================================================================
echo.
echo --- Available Courses ---
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT id, title, category, badge_name FROM courses;"
echo.
echo --- Syllabus & Lessons ---
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT id, title, course_id FROM lessons ORDER BY course_id, id;"
echo.
pause
goto menu

:companies
cls
echo =================================================================
echo                   COMPANIES & RECRUITMENT CRITERIA
echo =================================================================
echo.
echo --- Visisting Companies ---
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT id, name, min_cgpa, role, visit_date FROM company;"
echo.
echo --- Skill Requirements ---
docker exec placement_postgres psql -U placement_user -d placement_db -c "SELECT cr.id, c.name as company_name, s.name as skill_name, cr.min_rating as required_rating, cr.weightage FROM company_requirement cr JOIN company c ON cr.company_id = c.id JOIN skill s ON cr.skill_id = s.id ORDER BY c.name, s.name;"
echo.
pause
goto menu

:shell
cls
echo =================================================================
echo                 INTERACTIVE POSTGRESQL SHELL (PSQL)
echo =================================================================
echo.
echo Type your SQL queries here. Enter '\q' to exit the SQL shell.
echo.
docker exec -it placement_postgres psql -U placement_user -d placement_db
goto menu

:end
cls
echo Thank you for using the Placement Portal Database Inspector.
echo Goodbye!
pause
exit
