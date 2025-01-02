package com.example.p.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="Sanfrancisco_GisData")
public class GisData {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	 @Column(nullable = false,unique = true)
	private String guid;
	
	private String place_name;
	
	private String alias;
	
	private String city;
	
	private String state;
	
	private String street;
	
	private int capacity;
	
	private String address;
	
	private String zipcode;
	
	private Boolean status;
	
	@Column(name="feedback")
	private String feedback;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getGuid() {
		return guid;
	}

	public void setGuid(String guid) {
		this.guid = guid;
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

	public int getCapacity() {
		return capacity;
	}

	public void setCapacity(int capacity) {
		this.capacity = capacity;
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

	public Boolean getStatus() {
		return status;
	}

	public void setStatus(Boolean status) {
		this.status = status;
	}



	public String getFeedback() {
		return feedback;
	}

	public void setFeedback(String feedback) {
		this.feedback = feedback;
	}

	@Override
	public String toString() {
		return "GisData [id=" + id + ", guid=" + guid + ", place_name=" + place_name + ", alias=" + alias + ", city="
				+ city + ", state=" + state + ", street=" + street + ", capacity=" + capacity + ", address=" + address
				+ ", zipcode=" + zipcode + ", status=" + status + ", rejectionReason=" + feedback + "]";
	}

	public GisData(long id, String guid, String place_name, String alias, String city, String state, String street,
			int capacity, String address, String zipcode, Boolean status, String feedback) {
		super();
		this.id = id;
		this.guid = guid;
		this.place_name = place_name;
		this.alias = alias;
		this.city = city;
		this.state = state;
		this.street = street;
		this.capacity = capacity;
		this.address = address;
		this.zipcode = zipcode;
		this.status = status;
		this.feedback = feedback;
	}

	public GisData() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	

		
	
	
}
