package com.placement.portal.service;

import com.placement.portal.model.*;
import com.placement.portal.repository.CompanyRepository;
import com.placement.portal.repository.CompanyRequirementRepository;
import com.placement.portal.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepo;
    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;

    @Value("${gemini.api-key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public ResumeService(ResumeRepository resumeRepo,
                         CompanyRepository companyRepo,
                         CompanyRequirementRepository requirementRepo) {
        this.resumeRepo = resumeRepo;
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
    }

    private String callGemini(String promptText) throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        
        part.put("text", promptText);
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
        }
        throw new RuntimeException("Gemini API returned status code " + response.statusCode());
    }

    public Map<String, Object> analyzeResume(User student, String resumeText, Long targetCompanyId) {
        String lowerText = resumeText.toLowerCase();
        
        // 1. Existing rule-based analysis for fallback
        List<String> sections = Arrays.asList("education", "experience", "project", "skills", "achievement", "contact");
        int sectionScore = 0;
        List<String> critique = new ArrayList<>();
        
        for (String sec : sections) {
            if (lowerText.contains(sec)) {
                sectionScore += 10;
            } else {
                critique.add("Consider adding a clear '" + sec.toUpperCase() + "' section.");
            }
        }

        List<String> skillKeywords = Arrays.asList(
            "javascript", "python", "java", "sql", "react", "node", "css", "html", 
            "mongodb", "git", "cloud", "agile", "c++", "data structures", "algorithms"
        );
        List<String> matchedSkills = new ArrayList<>();
        for (String skill : skillKeywords) {
            if (lowerText.contains(skill)) {
                matchedSkills.add(skill);
            }
        }
        
        int skillScore = Math.min(40, matchedSkills.size() * 5);
        int formatScore = 0;
        if (resumeText.length() > 200 && resumeText.length() < 5000) {
            formatScore += 10;
        }
        
        int fallbackAtsScore = sectionScore + skillScore + formatScore;
        List<String> fallbackCritique = new ArrayList<>(critique);
        List<String> fallbackMatchedSkills = new ArrayList<>(matchedSkills);

        if (targetCompanyId != null) {
            Company company = companyRepo.findById(targetCompanyId).orElse(null);
            if (company != null) {
                List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(targetCompanyId);
                List<String> requiredSkills = requirements.stream()
                        .map(r -> r.getSkill().getName().toLowerCase())
                        .collect(Collectors.toList());
                
                List<String> missingSkills = new ArrayList<>();
                for (String reqSkill : requiredSkills) {
                    boolean found = false;
                    for (String w : reqSkill.split(" ")) {
                        if (w.length() > 2 && lowerText.contains(w)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found && !lowerText.contains(reqSkill)) {
                        missingSkills.add(reqSkill);
                    }
                }

                if (!missingSkills.isEmpty()) {
                    fallbackAtsScore = Math.max(15, fallbackAtsScore - (missingSkills.size() * 15));
                    fallbackCritique.add(0, "CRITICAL: Resume is missing core role requirements for " + company.getName() + ": **" + String.join(", ", missingSkills) + "**.");
                } else {
                    fallbackAtsScore = Math.min(100, fallbackAtsScore + 10);
                    fallbackCritique.add(0, "Great alignment! Your resume covers the key technical requirements for " + company.getName() + ".");
                }
            }
        }

        if (fallbackAtsScore < 50) {
            fallbackCritique.add("Describe achievements using active verbs and specify measurable impact (e.g. 'improved latency by 30%').");
        }

        // 2. Gemini-based analysis
        int finalAtsScore = fallbackAtsScore;
        List<String> finalCritique = fallbackCritique;
        List<String> finalMatchedSkills = fallbackMatchedSkills;

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                Company company = null;
                List<String> requiredSkills = new ArrayList<>();
                if (targetCompanyId != null) {
                    company = companyRepo.findById(targetCompanyId).orElse(null);
                    if (company != null) {
                        List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(targetCompanyId);
                        requiredSkills = requirements.stream()
                                .map(r -> r.getSkill().getName())
                                .collect(Collectors.toList());
                    }
                }

                StringBuilder prompt = new StringBuilder();
                prompt.append("You are an expert Senior Technical Recruiter and ATS Specialist.\n");
                prompt.append("Analyze the student's resume text for technical placements.\n");
                if (company != null) {
                    prompt.append("Target Company: ").append(company.getName()).append("\n");
                    prompt.append("Target Job Role: ").append(company.getRole()).append("\n");
                    prompt.append("Required Skills: ").append(String.join(", ", requiredSkills)).append("\n");
                } else {
                    prompt.append("Target Job Role: General Technical/Software Engineer Role\n");
                }
                prompt.append("\nResume Text:\n").append(resumeText).append("\n\n");
                prompt.append("Please evaluate the resume and output exactly a valid JSON object (no other text, no markdown styling around the JSON like ```json, just the JSON string) containing:\n");
                prompt.append("1. \"atsScore\": an integer score between 0 and 100 based on keyword alignment, structural sections, and experience readability.\n");
                prompt.append("2. \"critique\": an array of strings representing actionable, industry-oriented feedback points (max 5 items) for improvement.\n");
                prompt.append("3. \"matchedSkills\": an array of strings listing technical skills found in the resume.\n");

                String reply = callGemini(prompt.toString());
                if (reply != null && !reply.trim().isEmpty()) {
                    String cleanJson = reply.trim();
                    if (cleanJson.contains("```json")) {
                        cleanJson = cleanJson.substring(cleanJson.indexOf("```json") + 7);
                        cleanJson = cleanJson.substring(0, cleanJson.lastIndexOf("```"));
                    } else if (cleanJson.contains("```")) {
                        cleanJson = cleanJson.substring(cleanJson.indexOf("```") + 3);
                        cleanJson = cleanJson.substring(0, cleanJson.lastIndexOf("```"));
                    }
                    cleanJson = cleanJson.trim();

                    JsonNode parsedNode = objectMapper.readTree(cleanJson);
                    if (parsedNode.has("atsScore")) {
                        finalAtsScore = parsedNode.get("atsScore").asInt();
                    }
                    if (parsedNode.has("critique")) {
                        finalCritique = new ArrayList<>();
                        for (JsonNode node : parsedNode.get("critique")) {
                            finalCritique.add(node.asText());
                        }
                    }
                    if (parsedNode.has("matchedSkills")) {
                        finalMatchedSkills = new ArrayList<>();
                        for (JsonNode node : parsedNode.get("matchedSkills")) {
                            finalMatchedSkills.add(node.asText());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini resume analysis failed, falling back to local analysis: " + e.getMessage());
            }
        }

        // 3. Save to repository
        Resume resume = resumeRepo.findByStudentId(student.getId()).orElse(null);
        String critiqueString = String.join("||", finalCritique);
        if (resume == null) {
            resume = new Resume(student, resumeText, finalAtsScore, critiqueString);
        } else {
            resume.setResumeText(resumeText);
            resume.setAtsScore(finalAtsScore);
            resume.setCritique(critiqueString);
            resume.setCreatedAt(LocalDateTime.now());
        }
        resumeRepo.save(resume);

        Map<String, Object> result = new HashMap<>();
        result.put("atsScore", finalAtsScore);
        result.put("critique", finalCritique);
        result.put("matchedSkills", finalMatchedSkills);
        return result;
    }

    public Resume getResumeByStudent(Long studentId) {
        return resumeRepo.findByStudentId(studentId).orElse(null);
    }

    public String parseResumeFile(org.springframework.web.multipart.MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null) return "";
        try {
            if (originalName.toLowerCase().endsWith(".pdf")) {
                try (PDDocument doc = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            } else if (originalName.toLowerCase().endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
                    XWPFWordExtractor extractor = new XWPFWordExtractor(doc);
                    return extractor.getText();
                }
            } else if (originalName.toLowerCase().endsWith(".txt")) {
                return new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            } else {
                throw new IllegalArgumentException("Unsupported file format. Please upload PDF, DOCX or TXT.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse resume file: " + e.getMessage(), e);
        }
    }

    public String generateResumeText(User student, StudentProfile profile, List<StudentSkill> skills, List<StudentProject> projects, List<StudentCertificate> certs) {
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append(student.getFullName().toUpperCase()).append("\n");
        if (profile.getPhone() != null) sb.append("Phone: ").append(profile.getPhone()).append(" | ");
        sb.append("Email: ").append(student.getEmail()).append("\n");
        if (profile.getTemporaryAddress() != null) sb.append("Address: ").append(profile.getTemporaryAddress()).append("\n");
        sb.append("=========================================\n\n");

        sb.append("EDUCATION\n");
        sb.append("-----------------------------------------\n");
        if (profile.getHasPg() != null && profile.getHasPg()) {
            sb.append("Post Graduate: ").append(profile.getPgDegree()).append(" in ").append(profile.getPgStream()).append("\n");
            sb.append("College: ").append(profile.getPgCollege()).append(" | University: ").append(profile.getPgUniversity()).append(" (YOP: ").append(profile.getPgYop()).append(")\n");
            List<String> pgSems = new ArrayList<>();
            if (profile.getPgSem1Cgpa() != null) pgSems.add("Sem 1: " + profile.getPgSem1Cgpa());
            if (profile.getPgSem2Cgpa() != null) pgSems.add("Sem 2: " + profile.getPgSem2Cgpa());
            if (profile.getPgSem3Cgpa() != null) pgSems.add("Sem 3: " + profile.getPgSem3Cgpa());
            if (profile.getPgSem4Cgpa() != null) pgSems.add("Sem 4: " + profile.getPgSem4Cgpa());
            if (profile.getPgSem5Cgpa() != null) pgSems.add("Sem 5: " + profile.getPgSem5Cgpa());
            if (profile.getPgSem6Cgpa() != null) pgSems.add("Sem 6: " + profile.getPgSem6Cgpa());
            if (!pgSems.isEmpty()) {
                sb.append("Semester CGPAs: ").append(String.join(", ", pgSems)).append("\n");
            }
            sb.append("\n");
        }

        if (profile.getDegreeName() != null) {
            sb.append("Undergraduate: ").append(profile.getDegreeName()).append(" in ").append(profile.getDegreeStream()).append("\n");
            sb.append("College: ").append(profile.getDegreeCollege()).append(" | University: ").append(profile.getDegreeUniversity()).append(" (YOP: ").append(profile.getDegreeYop()).append(")\n");
            if (profile.getDegreeCgpa() != null) sb.append("CGPA: ").append(profile.getDegreeCgpa()).append("\n\n");
        }

        if (profile.getPucPercentage() != null) {
            sb.append("Pre-University (PUC/12th): (YOP: ").append(profile.getPucYop()).append(")\n");
            sb.append("Percentage: ").append(profile.getPucPercentage()).append("%\n\n");
        }

        if (profile.getSslcPercentage() != null) {
            sb.append("Secondary School (SSLC/10th): (YOP: ").append(profile.getSslcYop()).append(")\n");
            sb.append("Percentage: ").append(profile.getSslcPercentage()).append("%\n\n");
        }

        if (!skills.isEmpty()) {
            sb.append("TECHNICAL SKILLS\n");
            sb.append("-----------------------------------------\n");
            List<String> skillStrings = new ArrayList<>();
            for (StudentSkill sk : skills) {
                skillStrings.add(sk.getSkill().getName() + " (" + sk.getLevel() + ")");
            }
            sb.append(String.join(", ", skillStrings)).append("\n\n");
        }

        if (!projects.isEmpty()) {
            sb.append("PROJECTS\n");
            sb.append("-----------------------------------------\n");
            for (StudentProject p : projects) {
                sb.append("* ").append(p.getTitle()).append("\n");
                sb.append("  Description: ").append(p.getDescription()).append("\n");
                if (p.getGitLink() != null && !p.getGitLink().isEmpty()) sb.append("  Git Link: ").append(p.getGitLink()).append("\n");
                if (p.getHostedLink() != null && !p.getHostedLink().isEmpty()) sb.append("  Hosted Link: ").append(p.getHostedLink()).append("\n");
                sb.append("\n");
            }
        }

        if (!certs.isEmpty()) {
            sb.append("CERTIFICATIONS\n");
            sb.append("-----------------------------------------\n");
            for (StudentCertificate c : certs) {
                sb.append("* ").append(c.getTitle()).append(" (Issued by: ").append(c.getIssuingAuthority()).append(")\n");
                if (c.getVerificationLink() != null && !c.getVerificationLink().isEmpty()) sb.append("  Verification: ").append(c.getVerificationLink()).append("\n");
            }
            sb.append("\n");
        }

        return sb.toString();
    }

    public byte[] generateResumePdf(String resumeText) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 10);
                contentStream.setLeading(14.5f);
                contentStream.newLineAtOffset(50, 750);

                String[] lines = resumeText.split("\n");
                for (String line : lines) {
                    String cleanLine = line.replace("\r", "").replace("\t", "    ");
                    
                    if (cleanLine.length() > 90) {
                        cleanLine = cleanLine.substring(0, 87) + "...";
                    }
                    contentStream.showText(cleanLine);
                    contentStream.newLine();
                }
                contentStream.endText();
            }

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF resume: " + e.getMessage(), e);
        }
    }

    public String tailorResume(String originalText, Long targetCompanyId) {
        Company company = companyRepo.findById(targetCompanyId).orElse(null);
        if (company == null) return originalText;

        List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(targetCompanyId);
        List<String> requiredSkills = requirements.stream()
                .map(r -> r.getSkill().getName())
                .collect(Collectors.toList());

        // Call Gemini if API Key is available
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                StringBuilder prompt = new StringBuilder();
                prompt.append("You are an expert Senior Technical Recruiter and ATS Specialist.\n");
                prompt.append("Please rewrite and optimize the following resume text to make it highly tailored for a placement drive at a specific company.\n");
                prompt.append("Target Company: ").append(company.getName()).append("\n");
                prompt.append("Target Job Role: ").append(company.getRole()).append("\n");
                prompt.append("Required Skills: ").append(String.join(", ", requiredSkills)).append("\n\n");
                
                prompt.append("Rules for tailoring:\n");
                prompt.append("1. Integrate the missing required skills naturally into the technical skills section, summary, or project bullet points where appropriate.\n");
                prompt.append("2. Enhance project bullet descriptions using active verbs and industry-standard patterns. Try to use metrics or indicate scaling/efficiency where possible.\n");
                prompt.append("3. Keep the overall contact info and education section accurate and untouched.\n");
                prompt.append("4. Keep the output professionally structured and clean.\n");
                prompt.append("5. DO NOT wrap the output in markdown code blocks or json. Return ONLY the plain text of the tailored resume directly so it can be formatted and downloaded as a PDF.\n\n");
                prompt.append("Original Resume Text:\n").append(originalText).append("\n");

                String reply = callGemini(prompt.toString());
                if (reply != null && !reply.trim().isEmpty()) {
                    return reply.trim();
                }
            } catch (Exception e) {
                System.err.println("Gemini resume tailoring failed, falling back to local tailoring: " + e.getMessage());
            }
        }

        // Fallback to local rule-based tailoring
        List<String> missingSkills = new ArrayList<>();
        String lowerResume = originalText.toLowerCase();
        for (String req : requiredSkills) {
            if (!lowerResume.contains(req.toLowerCase())) {
                missingSkills.add(req);
            }
        }

        if (missingSkills.isEmpty()) {
            return originalText + "\n\n/* ATS Tailored: Already fully compliant with all " + company.getName() + " requirements! */";
        }

        StringBuilder sb = new StringBuilder(originalText);
        
        int skillsIdx = sb.indexOf("TECHNICAL SKILLS");
        if (skillsIdx == -1) {
            skillsIdx = sb.indexOf("SKILLS");
        }

        if (skillsIdx != -1) {
            int lineEnd = sb.indexOf("\n", skillsIdx);
            if (lineEnd != -1) {
                int nextLine = sb.indexOf("\n", lineEnd + 1);
                if (nextLine != -1) {
                    sb.insert(nextLine + 1, "ATS Keywords (Tailored for " + company.getName() + "): " + String.join(", ", missingSkills) + "\n");
                }
            }
        } else {
            sb.append("\n\nTECHNICAL SKILLS (ATS Tailored for ").append(company.getName()).append(")\n");
            sb.append("-----------------------------------------\n");
            sb.append(String.join(", ", missingSkills)).append("\n");
        }

        sb.append("\n/* ATS Tailored Optimization Suggestions for ").append(company.getName()).append(" placement drive:\n");
        for (String ms : missingSkills) {
            sb.append("- We have integrated the '").append(ms).append("' skill keyword to align with your target role '").append(company.getRole()).append("'.\n");
            sb.append("- Recommendation: Update your project bullet points to describe how you utilized '").append(ms).append("' in your code implementation.\n");
        }
        sb.append("*/\n");

        return sb.toString();
    }
}
