package com.example.p.entity;


import org.locationtech.jts.geom.Geometry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="Sanfrancisco_PlotData")
public class PlotData {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	@Column(columnDefinition = "Geometry", nullable = true) 
	private Geometry geometry;
	
	@Column(nullable = false,unique = true)
	private String guid;
	
	private int capacity;
	
	private String centroid; 
	
	private int available;
	
	private String timing;
	
	private String regulation;
	
	private String cleaning;
	
	private String suspension;
	
	private String level;
	
	private String remark;
	
	private String place_name;
	
	private String alias;
	
	private String city;
	
	private String state;
	
	private String street;
	
	private String address;
	
	private String zipcode;
	
	private String imgpath;
	
	private String u_id;

	public String getU_id() {
		return u_id;
	}

	public void setU_id(String u_id) {
		this.u_id = u_id;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Geometry getGeometry() {
		return geometry;
	}

	public void setGeometry(Geometry geometry) {
		this.geometry = geometry;
	}

	public String getGuid() {
		return guid;
	}

	public void setGuid(String guid) {
		this.guid = guid;
	}

	public int getCapacity() {
		return capacity;
	}

	public void setCapacity(int capacity) {
		this.capacity = capacity;
	}

	public String getCentroid() {
		return centroid;
	}

	public void setCentroid(String centroid) {
		this.centroid = centroid;
	}

	public int getAvailable() {
		return available;
	}

	public void setAvailable(int available) {
		this.available = available;
	}

	public String getTiming() {
		return timing;
	}

	public void setTiming(String timing) {
		this.timing = timing;
	}

	public String getRegulation() {
		return regulation;
	}

	public void setRegulation(String regulation) {
		this.regulation = regulation;
	}

	public String getCleaning() {
		return cleaning;
	}

	public void setCleaning(String cleaning) {
		this.cleaning = cleaning;
	}

	public String getSuspension() {
		return suspension;
	}

	public void setSuspension(String suspension) {
		this.suspension = suspension;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getPlace_name() {
		return place_name;
	}

	public void setPlace_name(String place_name) {
		this.place_name = place_name;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getStreet() {
		return street;
	}

	public void setStreet(String street) {
		this.street = street;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getZipcode() {
		return zipcode;
	}

	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}

	public String getImgpath() {
		return imgpath;
	}

	public void setImgpath(String imgpath) {
		this.imgpath = imgpath;
	}

	public PlotData(long id, Geometry geometry, String guid, int capacity, String centroid, int available,
			String timing, String regulation, String cleaning, String suspension, String level, String remark,
			String place_name, String alias, String city, String state, String street, String address, String zipcode,
			String imgpath, String u_id) {
		super();
		this.id = id;
		this.geometry = geometry;
		this.guid = guid;
		this.capacity = capacity;
		this.centroid = centroid;
		this.available = available;
		this.timing = timing;
		this.regulation = regulation;
		this.cleaning = cleaning;
		this.suspension = suspension;
		this.level = level;
		this.remark = remark;
		this.place_name = place_name;
		this.alias = alias;
		this.city = city;
		this.state = state;
		this.street = street;
		this.address = address;
		this.zipcode = zipcode;
		this.imgpath = imgpath;
		this.u_id = u_id;
	}

	public PlotData() {
		super();
		// TODO Auto-generated constructor stub
	}

	@Override
	public String toString() {
		return "PlotData [id=" + id + ", geometry=" + geometry + ", guid=" + guid + ", capacity=" + capacity
				+ ", centroid=" + centroid + ", available=" + available + ", timing=" + timing + ", regulation="
				+ regulation + ", cleaning=" + cleaning + ", suspension=" + suspension + ", level=" + level
				+ ", remark=" + remark + ", place_name=" + place_name + ", alias=" + alias + ", city=" + city
				+ ", state=" + state + ", street=" + street + ", address=" + address + ", zipcode=" + zipcode
				+ ", imgpath=" + imgpath + ", u_id=" + u_id + "]";
	}
		
}
