package com.example.p.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import com.example.p.entity.MetaData;

@Repository
public interface MetaRepository extends JpaRepository<MetaData, Long>{
}
