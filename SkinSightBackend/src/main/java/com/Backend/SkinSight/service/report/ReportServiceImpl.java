package com.Backend.SkinSight.service.report;

import com.Backend.SkinSight.dto.response.ReportResponseDto;
import com.Backend.SkinSight.entity.*;
import com.Backend.SkinSight.enums.CaseStatus;
import com.Backend.SkinSight.exception.BadRequestException;
import com.Backend.SkinSight.exception.ConflictException;
import com.Backend.SkinSight.exception.ResourceNotFoundException;
import com.Backend.SkinSight.mapper.ReportMapper;
import com.Backend.SkinSight.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@Transactional
public class ReportServiceImpl implements ReportService{
    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private ReportMapper reportMapper;
    @Autowired
    private CaseRepository caseRepository;
    @Autowired
    private DoctorReviewRepository doctorReviewRepository;
    @Autowired
    private DiagnosisResultRepository diagnosisResultRepository;
    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.reports.dir}")
    private String reportsDir;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    private static final Color PRIMARY_BLUE =
            new Color(30, 86, 160);
    private static final Color LIGHT_BLUE =
            new Color(210, 228, 255);
    private static final Color DARK_GREY =
            new Color(60, 60, 60);
    private static final Color LIGHT_GREY =
            new Color(245, 245, 245);
    private static final Color WHITE =
            Color.WHITE;
    private static final Color RED =
            new Color(200, 30, 30);
    private static final Color ORANGE =
            new Color(210, 120, 0);
    private static final Color GREEN =
            new Color(30, 140, 30);

    private Font titleFont() {
        return FontFactory.getFont(
                FontFactory.HELVETICA_BOLD, 20,
                WHITE);
    }

    private Font headingFont(){
        return FontFactory.getFont(
                FontFactory.HELVETICA_BOLD,13,
                PRIMARY_BLUE
        );
    }

    private Font labelFont() {
        return FontFactory.getFont(
                FontFactory.HELVETICA_BOLD, 10,
                DARK_GREY);
    }
    private Font valueFont() {
        return FontFactory.getFont(
                FontFactory.HELVETICA, 10,
                DARK_GREY);
    }
    private Font smallFont() {
        return FontFactory.getFont(
                FontFactory.HELVETICA, 8,
                DARK_GREY);
    }

    @Override
    public ReportResponseDto generateReport(Long caseId,Long generatedByUserId) {

        Case skinCase = caseRepository.findById(caseId).orElseThrow(()->
                new ResourceNotFoundException( "Case not found: " + caseId));

        if (skinCase.getStatus()!= CaseStatus.RELEASED){
            throw new BadRequestException(
                    "Report can only be generated for" +
                    "RELEASED cases. Current Status :"+
                    skinCase.getStatus());
        }

        if (reportRepository.existsBySkinCaseId(caseId)){
            throw new ConflictException( "Report already exists for case: " + caseId);
        }

        User generatedBy = userRepository.findById(generatedByUserId).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: "
                                        + generatedByUserId));

        DiagnosisResult diagnosis =
                diagnosisResultRepository.findBySkinCaseId(caseId).orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Diagnosis not found "
                                                + "for case: " + caseId));

        DoctorReview review = doctorReviewRepository.findBySkinCaseId(caseId).orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Doctor review not found "
                                                + "for case: " + caseId));

        String filePath = buildPdfAndSave(
                skinCase, diagnosis, review);

        Report report = Report.builder()
                .skinCase(skinCase)
                .generatedBy(generatedBy)
                .filePath(filePath)
                .reportUrl(baseUrl + "/" + filePath)
                .generatedAt(LocalDateTime.now())
                .build();

        Report saved = reportRepository.save(report);

        log.info("Report generated for case {} by user {}",
                caseId, generatedByUserId);
        return reportMapper.toDto(saved);

    }

    @Override
    public ReportResponseDto getReportByCase(Long caseId) {
        Report report = reportRepository.findBySkinCaseId(caseId).orElseThrow(()->
                new ResourceNotFoundException("Report not found for case: " + caseId));

        return reportMapper.toDto(report);
    }

    @Override
    public ReportResponseDto getReportById(Long reportId) {

        Report report = reportRepository.findById(reportId).orElseThrow(()->
                new ResourceNotFoundException("Report not found: " + reportId));

        return reportMapper.toDto(report);

    }

    private String buildPdfAndSave(
            Case skinCase,
            DiagnosisResult diagnosis,
            DoctorReview review) {

        try {
            Files.createDirectories(
                    Paths.get(reportsDir));
        } catch (IOException e) {
            throw new BadRequestException(
                    "Cannot create reports directory: "
                            + e.getMessage());
        }

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter
                        .ofPattern("yyyyMMdd_HHmmss"));
        String fileName = "report_case_"
                + skinCase.getId()
                + "_" + timestamp + ".pdf";

        String workingDir = System.getProperty("user.dir");
        String fullPath = workingDir
                + File.separator
                + reportsDir.replace("/", File.separator)
                + fileName;

        String relative = "uploads/reports/" + fileName;
        log.info("Writing PDF to: {}", fullPath);


        Document document = new Document(
                PageSize.A4, 50, 50, 50, 50);

        try {
            Files.createDirectories(
                    Paths.get(workingDir
                            + File.separator
                            + reportsDir.replace(
                            "/", File.separator)));

            PdfWriter.getInstance(
                    document,
                    new FileOutputStream(fullPath));
            document.open();

            // ── 1. Header ─────────────────────────────────
            addHeader(document, skinCase.getId());

            // ── 2. Patient Information ────────────────────
            addSectionHeading(document,
                    "Patient Information");
            addInfoTable(document, new String[][]{
                    {"Patient Name",
                            skinCase.getPatient().getName()},
                    {"Patient Email",
                            skinCase.getPatient().getEmail()},
                    {"Case ID",
                            "#" + skinCase.getId()},
                    {"Submission Date",
                            formatDate(skinCase.getSubmittedAt())},
                    {"Report Generated",
                            formatDate(LocalDateTime.now())},
            });
            // ↑ This must use skinCase.getPatient()
            // not review data. Double check this section
            // is pulling from skinCase not review.

            // ── 3. Case Details ───────────────────────────
            addSectionHeading(document, "Case Details");
            addInfoTable(document, new String[][]{
                    {"Affected Body Area",
                            orNA(skinCase.getBodyArea())},
                    {"Patient Description",
                            orNA(skinCase.getDescription())},
                    {"Duration of Condition",
                            orNA(skinCase.getDuration())},
            });

            // ── 4. AI Diagnosis ───────────────────────────
            addSectionHeading(document,
                    "AI Diagnosis Result");
            addInfoTable(document, new String[][]{
                    {"Predicted Condition",
                            diagnosis.getPredictedClass()},
                    {"Severity Level",
                            diagnosis.getSeverityLevel().name()},
                    {"Severity Score",
                            String.format("%.4f",
                                    diagnosis.getSeverityScore())},
            });

            // ── 5. Confidence Scores ──────────────────────
//            addConfidenceTable(document,
//                    diagnosis.getConfidenceScores());

            document.newPage();

            addSectionHeading(document, "AI Attention Heatmap");

            document.add(new Paragraph(
                    "Red and yellow areas indicate regions "
                            + "the AI focused on most when making "
                            + "its prediction.",
                    smallFont()));
            document.add(new Paragraph(" "));

            // ── 6. Heatmap ────────────────────────────────
            addHeatmapImage(document,
                    diagnosis.getHeatMapUrl());

            // ── 7. Clinical Review ────────────────────────
            addSectionHeading(document,
                    "Clinical Review");

            // Determine final diagnosis
            String finalDiagnosis =
                    "OVERRIDDEN".equals(
                            review.getAction().name())
                            && review.getOverriddenClass() != null
                            ? review.getOverriddenClass()
                            : diagnosis.getPredictedClass();

            addInfoTable(document, new String[][]{
                    {"Reviewing Doctor",
                            review.getDoctor().getName()},
                    {"Review Action",
                            review.getAction().name()},
                    {"Final Diagnosis",
                            finalDiagnosis},
                    {"Clinical Notes",
                            orNA(review.getClinicalNotes())},
                    {"Override Reason",
                            orNA(review.getOverriddenClass())},
                    {"Review Date",
                            formatDate(review.getReviewedAt())},
            });

            // ── 8. Disclaimer ─────────────────────────────
            addDisclaimer(document);

            document.close();

        } catch (DocumentException | IOException e) {
            log.error("PDF generation failed: {}",
                    e.getMessage());
            // Clean up partial file
            new File(fullPath).delete();
            throw new BadRequestException(
                    "Failed to generate PDF: "
                            + e.getMessage());
        }

        return relative;
    }

    private void addHeader(Document doc, Long caseId) throws DocumentException {
        PdfPTable header = new PdfPTable(1);
        header.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(PRIMARY_BLUE);
        cell.setPadding(20);
        cell.setBorder(Rectangle.NO_BORDER);

        Paragraph title = new Paragraph(
                "SkinSight Medical Report",
                titleFont());
        title.setAlignment(Element.ALIGN_CENTER);

        Paragraph subtitle = new Paragraph(
                ":Skin Disease Screening and Clinical Review System",
                FontFactory.getFont(
                        FontFactory.HELVETICA, 11,
                        new Color(190, 210, 255)));
        subtitle.setAlignment(Element.ALIGN_CENTER);

        Paragraph caseInfo = new Paragraph(
                "Case Reference: #" + caseId,
                FontFactory.getFont(
                        FontFactory.HELVETICA, 10,
                        new Color(180, 200, 255)));
        caseInfo.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(title);
        cell.addElement(subtitle);
        cell.addElement(caseInfo);
        header.addCell(cell);

        doc.add(header);
        doc.add(new Paragraph(" "));
    }

    private void addSectionHeading(
            Document doc, String heading)
            throws DocumentException {

        doc.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell(
                new Phrase(heading, headingFont()));
        cell.setBackgroundColor(LIGHT_BLUE);
        cell.setPadding(8);
        cell.setBorderColor(PRIMARY_BLUE);
        cell.setBorderWidth(1.5f);

        table.addCell(cell);
        doc.add(table);
        doc.add(new Paragraph(" "));
    }

    private void addInfoTable(
            Document doc, String[][] rows)
            throws DocumentException {

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30f, 70f});

        boolean alternate = false;
        for (String[] row : rows) {
            Color bg = alternate
                    ? LIGHT_GREY : WHITE;

            PdfPCell labelCell = new PdfPCell(
                    new Phrase(row[0], labelFont()));
            labelCell.setBackgroundColor(bg);
            labelCell.setPadding(7);
            labelCell.setBorderColor(
                    new Color(200, 200, 200));

            PdfPCell valueCell = new PdfPCell(
                    new Phrase(row[1], valueFont()));
            valueCell.setBackgroundColor(bg);
            valueCell.setPadding(7);
            valueCell.setBorderColor(
                    new Color(200, 200, 200));

            table.addCell(labelCell);
            table.addCell(valueCell);

            alternate = !alternate;
        }

        doc.add(table);
    }

//    private void addConfidenceTable(
//            Document doc, String confidenceJson)
//            throws DocumentException {
//
//        doc.add(new Paragraph(
//                "Confidence Scores:",
//                labelFont()));
//        doc.add(new Paragraph(" "));
//
//        // Parse the JSON string manually
//        // Format: {"Melanoma": 0.3819, "Nevi": 0.261, ...}
//        PdfPTable table = new PdfPTable(2);
//        table.setWidthPercentage(80);
//        table.setWidths(new float[]{60f, 40f});
//        table.setHorizontalAlignment(
//                Element.ALIGN_LEFT);
//
//        // Header row
//        PdfPCell h1 = new PdfPCell(
//                new Phrase("Disease Class", labelFont()));
//        PdfPCell h2 = new PdfPCell(
//                new Phrase("Confidence", labelFont()));
//        h1.setBackgroundColor(PRIMARY_BLUE);
//        h2.setBackgroundColor(PRIMARY_BLUE);
//        h1.getPhrase().getFont().setColor(WHITE);
//        h2.getPhrase().getFont().setColor(WHITE);
//        h1.setPadding(6);
//        h2.setPadding(6);
//        table.addCell(h1);
//        table.addCell(h2);
//
//        // Parse and add each class score
//        try {
//            String cleaned = confidenceJson
//                    .replace("{", "")
//                    .replace("}", "")
//                    .replace("\"", "");
//            // e.g. "Melanoma: 0.3819, Nevi: 0.261"
//
//            String[] entries = cleaned.split(",");
//            boolean alt = false;
//            for (String entry : entries) {
//                String[] parts = entry
//                        .trim().split(":");
//                if (parts.length == 2) {
//                    String cls  = parts[0].trim();
//                    String conf = parts[1].trim();
//                    double val  = Double.parseDouble(conf);
//                    String pct  = String.format(
//                            "%.2f%%", val * 100);
//
//                    Color bg = alt ? LIGHT_GREY : WHITE;
//                    PdfPCell c1 = new PdfPCell(
//                            new Phrase(cls, valueFont()));
//                    PdfPCell c2 = new PdfPCell(
//                            new Phrase(pct, valueFont()));
//                    c1.setBackgroundColor(bg);
//                    c2.setBackgroundColor(bg);
//                    c1.setPadding(5);
//                    c2.setPadding(5);
//                    table.addCell(c1);
//                    table.addCell(c2);
//                    alt = !alt;
//                }
//            }
//        } catch (Exception e) {
//            // If parsing fails just skip the table
//            log.warn("Could not parse confidence scores"
//                    + " for PDF: {}", e.getMessage());
//        }
//
//        doc.add(table);
//    }

    private void addHeatmapImage(
            Document doc, String heatmapUrl)
            throws DocumentException {

        if (heatmapUrl == null
                || heatmapUrl.isBlank()) {
            try {
                doc.add(new Paragraph(
                        "Heatmap image not available.",
                        smallFont()));
            } catch (Exception ignored) {}
            return;
        }

        try {
            String workingDir =
                    System.getProperty("user.dir");
            String absolutePath = workingDir
                    + File.separator
                    + heatmapUrl.replace(
                    "/", File.separator);

            File heatmapFile = new File(absolutePath);

            if (!heatmapFile.exists()) {
                log.warn("Heatmap not found: {}",
                        absolutePath);
                doc.add(new Paragraph(
                        "Heatmap image not found on server.",
                        smallFont()));
                return;
            }

            Image heatmap = Image.getInstance(
                    absolutePath);
            heatmap.scaleToFit(350, 350);
            // Slightly larger now since it has
            // the full page to itself.
            heatmap.setAlignment(Element.ALIGN_CENTER);
            doc.add(heatmap);

            log.info("Heatmap embedded successfully.");

        } catch (IOException e) {
            log.warn("Could not embed heatmap: {}",
                    e.getMessage());
            try {
                doc.add(new Paragraph(
                        "Heatmap image could not be loaded.",
                        smallFont()));
            } catch (DocumentException de) {
                log.error("PDF write error: {}",
                        de.getMessage());
            }
        }
    }

    private void addDisclaimer(Document doc)
            throws DocumentException {

        doc.add(new Paragraph(" "));
        doc.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(255, 250, 220));
        cell.setPadding(12);
        cell.setBorderColor(new Color(200, 170, 0));

        Paragraph heading = new Paragraph(
                "⚠  Medical Disclaimer",
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        10, DARK_GREY));

        Paragraph text = new Paragraph(
                "This report is generated by an "
                        + "AI-assisted diagnostic system and "
                        + "has been reviewed by a licensed "
                        + "medical professional. It is intended "
                        + "for informational purposes only and "
                        + "does not constitute a definitive "
                        + "medical diagnosis. Please consult "
                        + "your healthcare provider for proper "
                        + "diagnosis and treatment.",
                smallFont());
        text.setSpacingBefore(4);

        cell.addElement(heading);
        cell.addElement(text);
        table.addCell(cell);
        doc.add(table);

        // Footer
        doc.add(new Paragraph(" "));
        Paragraph footer = new Paragraph(
                "Generated by SkinSight — "
                        + ":Skin Disease Screening and Clinical Review System  |  "
                        + formatDate(LocalDateTime.now()),
                smallFont());
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }


    private String formatDate(LocalDateTime dt) {
        if (dt == null) return "N/A";
        return dt.format(DateTimeFormatter
                .ofPattern("dd MMM yyyy, HH:mm"));
    }

    private String orNA(String value) {
        return (value == null || value.isBlank())
                ? "N/A" : value;
    }



}
