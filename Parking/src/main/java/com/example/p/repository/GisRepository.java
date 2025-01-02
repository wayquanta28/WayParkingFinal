package com.example.p.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.p.entity.GisData;
import com.example.p.entity.MetaData;

@Repository
public interface GisRepository extends JpaRepository<GisData, Long>{
	
	void deleteByGuid(String guid);
	
	Optional<GisData> findByGuid(String guid);
	
	Long countByStatus(Boolean status);
	Long countByStatusIsNull();
	// User status methods 
	List<GisData> findByStatusIsNull(); // For pending record
		  
	List<GisData> findByStatus(Boolean status); 
	  
}
