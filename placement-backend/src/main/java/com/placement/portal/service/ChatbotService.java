package com.placement.portal.service;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;
    private final ResumeRepository resumeRepo;
    private final StudentProfileRepository profileRepo;
    private final StudentSkillRepository studentSkillRepo;

    @Value("${gemini.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public ChatbotService(CompanyRepository companyRepo,
                          CompanyRequirementRepository requirementRepo,
                          ResumeRepository resumeRepo,
                          StudentProfileRepository profileRepo,
                          StudentSkillRepository studentSkillRepo) {
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.resumeRepo = resumeRepo;
        this.profileRepo = profileRepo;
        this.studentSkillRepo = studentSkillRepo;
    }

    public String getChatbotResponse(String message, User student, Long companyId) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "🤖 **AI Coach Configuration Notice**\n\n" +
                   "Real AI features are currently waiting to be activated. To connect me to Gemini:\n" +
                   "1. Add `GEMINI_API_KEY=your_gemini_api_key` to your `.env` file under the `placement-backend` directory.\n" +
                   "2. Restart the backend server.\n\n" +
                   "*(In the meantime, I can still reply with mock data for queries containing concepts like JOINs, stacks, Big O, or resume tips!)*\n\n" +
                   "--- \n\n" + 
                   getFallbackMockResponse(message, student, companyId);
        }

        try {
            String systemInstruction = buildSystemInstruction(student, companyId);
            
            // Build request payload
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> part = new HashMap<>();
            
            part.put("text", systemInstruction + "\n\nUser Message: " + message);
            parts.add(part);
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            String requestJson = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                String reply = rootNode.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();
                if (reply != null && !reply.trim().isEmpty()) {
                    return reply;
                }
            } else {
                return "🤖 **Gemini API Error (Status: " + response.statusCode() + ")**\n\n" +
                       "Failed to fetch response. Standard mock response fallback:\n\n" +
                       getFallbackMockResponse(message, student, companyId);
            }

        } catch (Exception e) {
            return "🤖 **AI Coach Error**\n\n" +
                   "Could not get response due to: " + e.getMessage() + "\n\n" +
                   getFallbackMockResponse(message, student, companyId);
        }

        return getFallbackMockResponse(message, student, companyId);
    }

    private String buildSystemInstruction(User student, Long companyId) {
        StringBuilder systemInstruction = new StringBuilder();
        systemInstruction.append("You are the Placement AI Coach for the ReadyBound placement portal.\n");
        systemInstruction.append("You help students prepare for campus placement drives, optimize their resumes, explain technical concepts (SQL, DSA, Java, etc.), and bridge skill gaps.\n\n");
        
        systemInstruction.append("Student Context:\n");
        systemInstruction.append("- Name: ").append(student.getFullName()).append("\n");
        systemInstruction.append("- Email: ").append(student.getEmail()).append("\n");
        
        if (profileRepo != null) {
            profileRepo.findByUserId(student.getId()).ifPresent(p -> {
                systemInstruction.append("- Highest Degree: ").append(p.getHighestDegree()).append("\n");
                systemInstruction.append("- Degree CGPA: ").append(p.getDegreeCgpa()).append("\n");
                systemInstruction.append("- Stream: ").append(p.getDegreeStream()).append("\n");
            });
        }
        
        if (studentSkillRepo != null) {
            List<StudentSkill> skills = studentSkillRepo.findByStudentId(student.getId());
            if (!skills.isEmpty()) {
                systemInstruction.append("- Technical Skills registered: ");
                String skillList = skills.stream()
                        .map(s -> s.getSkill().getName() + " (" + s.getLevel() + ", Rating: " + (s.getRating() != null ? s.getRating() : "Not evaluated") + ")")
                        .collect(Collectors.joining(", "));
                systemInstruction.append(skillList).append("\n");
            }
        }
        
        if (companyId != null) {
            companyRepo.findById(companyId).ifPresent(company -> {
                systemInstruction.append("\nTarget Company Context:\n");
                systemInstruction.append("- Company: ").append(company.getName()).append("\n");
                systemInstruction.append("- Role: ").append(company.getRole()).append("\n");
                systemInstruction.append("- Min CGPA Requirement: ").append(company.getMinCgpa()).append("\n");
                
                List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(companyId);
                if (!requirements.isEmpty()) {
                    systemInstruction.append("- Required Skills: ");
                    String reqList = requirements.stream()
                            .map(r -> r.getSkill().getName() + " (Min Rating: " + r.getMinRating() + ")")
                            .collect(Collectors.joining(", "));
                    systemInstruction.append(reqList).append("\n");
                }
            });
        }
        
        systemInstruction.append("\nFormat your response using Markdown style. Keep explanations professional, clear, and focused on helping the student succeed in their interviews.");
        return systemInstruction.toString();
    }

    private String getFallbackMockResponse(String message, User student, Long companyId) {
        String query = message.toLowerCase();
        
        // 1. Analyze resume tailoring request
        if (query.contains("resume") || query.contains("cv") || query.contains("ats")) {
            if (companyId != null) {
                Company company = companyRepo.findById(companyId).orElse(null);
                Resume resume = resumeRepo.findByStudentId(student.getId()).orElse(null);
                
                if (company != null) {
                    List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(companyId);
                    List<String> missing = new ArrayList<>();
                    
                    if (resume != null) {
                        String resumeText = resume.getResumeText().toLowerCase();
                        for (CompanyRequirement req : requirements) {
                            String skillName = req.getSkill().getName().toLowerCase();
                            if (!resumeText.contains(skillName)) {
                                missing.add(req.getSkill().getName());
                            }
                        }
                    } else {
                        requirements.forEach(r -> missing.add(r.getSkill().getName()));
                    }

                    if (!missing.isEmpty()) {
                        return "Here is a custom recommendation to tailor your resume for the **" + company.getName() + "** drive:\n\n" +
                               "Currently, your resume lacks keywords representing role requirements: **" + String.join(", ", missing) + "**.\n\n" +
                               "**Suggested Additions / Bullets:**\n" +
                               "1. Append standard technical skills: `" + String.join(", ", missing) + "` to your tech stack section.\n" +
                               "2. Under your project work, write: \n" +
                               "   * *\"Engineered high-throughput web queries utilizing **" + missing.get(0) + "**, incorporating indexing models to speed up load times by 40%..\"*\n\n" +
                               "Would you like me to quiz you on " + company.getName() + " questions?";
                    } else {
                        return "Great job! Your resume contains all technical requirements for the **" + company.getName() + "** role.\n\n" +
                               "**Refinement Tip:** Enhance your experiences using the STAR method:\n" +
                               "* \"Implemented database scripts utilizing " + (requirements.isEmpty() ? "SQL" : requirements.get(0).getSkill().getName()) + " that processed over 5,000 requests per minute, reducing connection leakages by 15%.\"";
                    }
                }
            }
            return "To compare and optimize your resume, please select a target company in the chatbot target dropdown below, or type your query detailing the target company name.";
        }

        // 2. Technical concepts
        if (query.contains("join") || query.contains("sql") || query.contains("index") || query.contains("select")) {
            return "**SQL Concept Guide:**\n\n" +
                   "* **INNER JOIN**: Returns only matching rows from both tables.\n" +
                   "* **LEFT JOIN**: Returns all rows from the left table, and the matched rows from the right table. Matches without a corresponding row fill with `NULL`.\n" +
                   "* **INDEXING**: Creates lookup structures (B-Trees) to avoid sequential scanning, accelerating data retrieval significantly.\n\n" +
                   "I recommend visiting the learning courses on your dashboard to test your knowledge!";
        }

        if (query.contains("big o") || query.contains("time complexity") || query.contains("dsa") || query.contains("stack") || query.contains("queue")) {
            return "**Data Structures & Complexity Guide:**\n\n" +
                   "* **Big O**: Denotes growth scalability. `O(1)` is instant, `O(log n)` is tree height, `O(n)` is linear scan.\n" +
                   "* **Stack**: LIFO (Last In First Out) structure. Elements are pushed and popped from the top.\n" +
                   "* **Queue**: FIFO (First In First Out) structure. Elements enter at the back and leave at the front.\n\n" +
                   "We have a deep-dive **DSA in Java** course available in the Learning catalog. Be sure to check it out!";
        }

        if (query.contains("amazon") || query.contains("google")) {
            return "**Corporate Preparation Tips:**\n\n" +
                   "* **Amazon**: Focuses heavily on relational schema query speed and soft skills behavioral questions.\n" +
                   "* **Google**: Tests deep Java data structures, recursion, and scaling patterns. Ensure your coding rating is at least 4.0.\n\n" +
                   "Check the drive eligibility cards under 'Placement Prep' to start taking preparation mock tests!";
        }

        return "Hello! I am your AI Coach. I can help you with:\n\n" +
               "1. **Explaining technical concepts** (SQL, JOINs, Stacks, Queues, Big O).\n" +
               "2. **Analyzing and tailoring your resume** for corporate drives (e.g. \"optimize resume\").\n" +
               "3. **Bridging skill gaps** by suggesting study routes.\n\n" +
               "What would you like to review?";
    }
}
