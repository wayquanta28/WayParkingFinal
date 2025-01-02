package com.example.p.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.hibernate.boot.Metadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.p.dto.CombinedDTO;
import com.example.p.entity.GisData;
import com.example.p.repository.GisRepository;
import com.example.p.repository.MetaRepository;
import com.example.p.service.DashboardService;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/gisdata")
public class DashboardController {
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private DashboardService dashboardservice;
    
    @Autowired
    private MetaRepository metaRepository;

    @Autowired
    private GisRepository gisRepository;

    // Endpoint to get counts of GIS data records by published status
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getGISDataCountByPublished() {
        try {
            Map<String, Long> response = new HashMap<>();
            long publishedCount = dashboardservice.getCountStatus(true);
            long nonPublishedCount = dashboardservice.getCountStatus(null);
            long pendingCount = dashboardservice.getCountStatus(false); // Count for null status
            long totalRecords = publishedCount + nonPublishedCount + pendingCount ; // Updated total calculation

            response.put("Published", publishedCount);
            response.put("Non Published", nonPublishedCount);
            response.put("Pending", pendingCount);
            response.put("Total Records", totalRecords);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error occurred while fetching GIS data counts: ", e);
            return ResponseEntity.status(500).body(null); // Returning a generic error message
        }
    }

    // Endpoint to fetch all pending GIS data records
    @GetMapping("/pending")
    public ResponseEntity<List<GisData>> getPendingRecords() {
        try {
            List<GisData> pendingRecords = dashboardservice.getPendingRecords();
            return ResponseEntity.ok(pendingRecords);
        } catch (Exception e) {
            logger.error("Error occurred while fetching pending GIS records: ", e);
            return ResponseEntity.status(500).body(null); // Returning a generic error message
        }
    }

    // Endpoint to update GIS data status
    @PutMapping("/status/{guid}")
    public ResponseEntity<String> updateGISDataStatus(@PathVariable String guid, @RequestParam Boolean status) {
        try {
            boolean isUpdated = dashboardservice.updateGISDataStatus(guid, status);
            if (isUpdated) {
                return ResponseEntity.ok("Status updated successfully");
            } else {
                return ResponseEntity.status(404).body("Record not found");
            }
        } catch (Exception e) {
            logger.error("Error occurred while updating GIS data status: ", e);
            return ResponseEntity.status(500).body("Error updating status");
        }
    }

    // Endpoint to fetch all GIS data with their status (Approved, Rejected, Pending)
    @GetMapping("/status/all")
    public ResponseEntity<List<Map<String, Object>>> getAllGISDataWithStatus() {
        try {
            List<GisData> allRecords = dashboardservice.getAllGISData(); // Assuming you have a method to fetch all GIS data
            List<Map<String, Object>> response = allRecords.stream().map(gisData -> {
                Map<String, Object> dataMap = new HashMap<>();
                dataMap.put("guid", gisData.getGuid());
                dataMap.put("placeName", gisData.getPlace_name()); // Add more fields as needed
                dataMap.put("status", gisData.getStatus() == null ? "Pending"
                                    : gisData.getStatus() ? "Approved" : "Rejected");
                return dataMap;
            }).toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error occurred while fetching all GIS data with status: ", e);
            return ResponseEntity.status(500).body(null); // Returning a generic error message
        }
    }

    // Endpoint to fetch approved GIS records
    @GetMapping("/status/approved")
    public ResponseEntity<List<GisData>> getApprovedRecords() {
        try {
            List<GisData> approvedRecords = dashboardservice.getGISDataByStatus(true);
            return ResponseEntity.ok(approvedRecords);
        } catch (Exception e) {
            logger.error("Error occurred while fetching approved GIS records: ", e);
            return ResponseEntity.status(500).body(null); // Returning a generic error message
        }
    }
    // Endpoint to fetch rejected GIS records
    @GetMapping("/status/rejected")
    public ResponseEntity<List<GisData>> getRejectedRecords() {
        try {
            List<GisData> rejectedRecords = dashboardservice.getGISDataByStatus(false);
            return ResponseEntity.ok(rejectedRecords);
        } catch (Exception e) {
            logger.error("Error occurred while fetching rejected GIS records: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // Endpoint to fetch pending GIS records
    @GetMapping("/status/pending")
    public ResponseEntity<List<GisData>> getPendingStatusRecords() {
        try {
            List<GisData> pendingRecords = dashboardservice.getGISDataByStatus(null);
            return ResponseEntity.ok(pendingRecords);
        } catch (Exception e) {
            logger.error("Error occurred while fetching pending GIS records: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Endpoint to reject a record with a reason
    @PostMapping("/rejection-reason")
    public ResponseEntity<String> rejectRecord(@RequestBody CombinedDTO rejectionRequest) {
        try {
            String guid = rejectionRequest.getGuid();
            String reason = rejectionRequest.getRejectionReason();
                
            dashboardservice.rejectRecord(guid, reason);
            return ResponseEntity.ok("Record rejected successfully.");
        } catch (Exception e) {
            logger.error("Error occurred while rejecting GIS record: ", e);
            return ResponseEntity.status(500).body("Error rejecting record");
        }
    }
 // Endpoint to update rejection reason for a record
    @PutMapping("/rejection-reason/{guid}")
    public ResponseEntity<String> updateRejectionReason(@PathVariable String guid, @PathVariable String reason) {
        try {
            dashboardservice.updateRejectionReason(guid, reason);
            return ResponseEntity.ok("Rejection reason updated successfully");
        } catch (Exception e) {
            logger.error("Error occurred while updating rejection reason: ", e);
            return ResponseEntity.status(500).body("Error updating rejection reason");
        }
    }
 // GET mapping to retrieve the rejection reason
    @GetMapping("/rejection-reason/{guid}")
    public ResponseEntity<Map<String, String>> getRejectionReason(@PathVariable String guid) {
        try {
            Optional<GisData> gisDataOptional = dashboardservice.getRejectionReasonByGuid(guid);
            if (gisDataOptional.isPresent()) {
                String rejectionReason = gisDataOptional.get().getFeedback();
                if (rejectionReason == null || rejectionReason.isEmpty()) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "No rejection reason found for the provided GUID");
                    return ResponseEntity.status(404).body(response);
                }
                Map<String, String> response = new HashMap<>();
                response.put("feedback", rejectionReason);  // Changed to "feedback"
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", "No record found for the provided GUID");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            logger.error("Error occurred while retrieving rejection reason: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error retrieving rejection reason");
            return ResponseEntity.status(500).body(response);
        }
    }
    // Endpoint to fetch rejection reasons for all records
    @GetMapping("/rejection-reasons")
    public ResponseEntity<List<GisData>> getRejectionReasons() {
        try {
            // Call the method to get only rejected records
            List<GisData> rejectionReasons = dashboardservice.getRejectedRecordsWithReasons();
            return ResponseEntity.ok(rejectionReasons);
        } catch (Exception e) {
            logger.error("Error occurred while fetching rejection reasons: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }
    
    @PostMapping("/updateStatus")
    public ResponseEntity<List<GisData>> updateRecordStatus(@RequestBody CombinedDTO request) {
        List<GisData> updateRecord = dashboardservice.updateRecordStatus(request.getGuid(), request.getStatus(), request.getRejectionReason());
        return ResponseEntity.ok(updateRecord);
    }
}