package com.example.p.dto;

public class CombinedDTO {
	
	private String guid;
    private int capacity;
    private String city;
    private String state;
    private String zipcode;
    private int available;
    private Boolean status;
    private String address;
    private String rejectionReason;
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
	public String getZipcode() {
		return zipcode;
	}
	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}
	public int getAvailable() {
		return available;
	}
	public void setAvailable(int available) {
		this.available = available;
	}
	public Boolean getStatus() {
		return status;
	}
	public void setStatus(Boolean status) {
		this.status = status;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getRejectionReason() {
		return rejectionReason;
	}
	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}
	public CombinedDTO(String guid, int capacity, String city, String state, String zipcode, int available,
			Boolean status, String address, String rejectionReason) {
		super();
		this.guid = guid;
		this.capacity = capacity;
		this.city = city;
		this.state = state;
		this.zipcode = zipcode;
		this.available = available;
		this.status = status;
		this.address = address;
		this.rejectionReason = rejectionReason;
	}
	public CombinedDTO() {
		super();
		// TODO Auto-generated constructor stub
	}
    



    
}
