package com.example.p.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.p.entity.GisData;
import com.example.p.repository.GisRepository;

import jakarta.transaction.Transactional;

@Service
public class DashboardService {

	@Autowired
	private GisRepository gisRepository;
	
	// Method to get the count based on status
	public Long getCountStatus(Boolean status) {
		if(status == null) {
			return gisRepository.countByStatusIsNull();
		}
		return gisRepository.countByStatus(status);
	}
	
	 // Method to fetch all records with pending status (i.e., status is null)
	public List<GisData> getPendingRecords(){
		return gisRepository.findByStatus(null);
	}
	// Method to update the status field of a GISData entry
	public boolean updateGISDataStatus(String guid, Boolean status) {
		Optional<GisData> gisDataOptional = gisRepository.findByGuid(guid);
		if(gisDataOptional.isPresent()) {
			GisData gisData = gisDataOptional.get();
			gisData.setStatus(status);
			gisRepository.save(gisData);
			return true;
		}
		return false;
	}
	public List<GisData> getAllGISData() {
	    return gisRepository.findAll(); // Replace this with your actual repository call
	}
	@Transactional
    public boolean rejectRecord(String guid, String reason) {
        Optional<GisData> recordOptional = gisRepository.findByGuid(guid);

        if (recordOptional.isPresent()) {
            GisData record = recordOptional.get(); // Get the actual GisData object
            record.setStatus(false); // Set status to rejected
            record.getFeedback(); // Set the rejection reason
            System.out.println("Updating record: " + record); // Print the record before saving
            gisRepository.save(record); // Save the updated record
            return true;
        }
        System.out.println("Record not found for GUID: " + guid); // Log if the record is not found
        return false; // Return false if the record was not found
    }

    // Method to fetch a record and get its rejection reason by GUID
    public Optional<GisData> getRejectionReasonByGuid(String guid) {
        return gisRepository.findByGuid(guid); // Adjust the method name as per your repository
    }

    // Method to update the rejection reason for a record
    public boolean updateRejectionReason(String guid, String reason) {
        Optional<GisData> gisDataOptional = gisRepository.findByGuid(guid);
        if (gisDataOptional.isPresent()) {
            GisData gisData = gisDataOptional.get();
            gisData.setFeedback(reason);
            gisRepository.save(gisData);
            return true;
        }
        System.out.println("Record not found for GUID: " + guid); // Log if the record is not found
        return false;
    }

    public List<GisData> getRejectedRecordsWithReasons() {
        // Fetch all records and filter out those with null rejection reasons
        return gisRepository.findAll()
                .stream()
                .filter(gisData -> gisData.getFeedback() != null)
                .collect(Collectors.toList());
    }
    
    public List<GisData> getGISDataByStatus(Boolean status) {
        if (status == null) {
            return gisRepository.findByStatusIsNull(); // Fetch pending records
        } else {
            return gisRepository.findByStatus(status); // Fetch approved or rejected records
        }
    }
    
    public List<GisData> updateRecordStatus(String guid, Boolean status, String rejectionReason) {
        // Create a list to hold the result
        List<GisData> updatedGisDataList = new ArrayList<>();

        // Retrieve the GisData record by GUID
        Optional<GisData> optionalGisData = gisRepository.findByGuid(guid);

        // Check if the GisData record exists
        if (optionalGisData.isPresent()) {
            GisData gisData = optionalGisData.get();

            // Update the status
            gisData.setStatus(status);

            // Handle rejection reason logic only if status is false or null
            if (Boolean.FALSE.equals(status) || status == null) {
                if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                    throw new IllegalArgumentException("Rejection reason must be provided when status is false or null.");
                }
                gisData.setFeedback(rejectionReason); // Set rejection reason
            } else if (Boolean.TRUE.equals(status)) {
                // Clear rejection reason if status is true
                gisData.setFeedback(rejectionReason);
            }

            // Save the updated record
            gisRepository.save(gisData);

            // Add to the result list
            updatedGisDataList.add(gisData);
        }

        // Return the updated list (could be empty if no record was found)
        return updatedGisDataList;
    }



}
