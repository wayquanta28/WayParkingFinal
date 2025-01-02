package com.example.p.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name="Sanfrancisco_Metadata")
public class MetaData {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	@Column(nullable = false,unique = true)
	private String guid;
    private String zoneName;
    private int zoneNumber;
    private String category;
    private int maxTimeLimit;
    private String streetName;
    private String city;
    private String state;
    private String centroid;
    private String country;
    private String zipcode;
    private String parkingHours;
    private String cleaning;
    private String riskLevel;
    private String safetyRank;
    private String availability;
  
	private String signpostUrl;
    private String imageUrl;
    private Double ratingValue;
    private int ratingCount;
    private String towAwayZoneHours;
    private String kerbColor;
    private String prices;
    private String streetviewUrl;
    private int totalSpaceCount;
    private int availableSpaceCount;
    private int adaAccessibleSpaces;
    private int evChargingSpaces; // Electric Vehicle Charging Spaces
    private String enforcementValidation;
    private String timeLimitException;
    private String shape;
    private LocalDateTime lastDataLoadedAt;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;
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
	public String getZoneName() {
		return zoneName;
	}
	public void setZoneName(String zoneName) {
		this.zoneName = zoneName;
	}
	public int getZoneNumber() {
		return zoneNumber;
	}
	public void setZoneNumber(int zoneNumber) {
		this.zoneNumber = zoneNumber;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public int getMaxTimeLimit() {
		return maxTimeLimit;
	}
	public void setMaxTimeLimit(int maxTimeLimit) {
		this.maxTimeLimit = maxTimeLimit;
	}
	public String getStreetName() {
		return streetName;
	}
	public void setStreetName(String streetName) {
		this.streetName = streetName;
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
	public String getCentroid() {
		return centroid;
	}
	public void setCentroid(String centroid) {
		this.centroid = centroid;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public String getZipcode() {
		return zipcode;
	}
	public void setZipcode(String zipcode) {
		this.zipcode = zipcode;
	}
	public String getParkingHours() {
		return parkingHours;
	}
	public void setParkingHours(String parkingHours) {
		this.parkingHours = parkingHours;
	}
	public String getCleaning() {
		return cleaning;
	}
	public void setCleaning(String cleaning) {
		this.cleaning = cleaning;
	}
	public String getRiskLevel() {
		return riskLevel;
	}
	public void setRiskLevel(String riskLevel) {
		this.riskLevel = riskLevel;
	}
	public String getSafetyRank() {
		return safetyRank;
	}
	public void setSafetyRank(String safetyRank) {
		this.safetyRank = safetyRank;
	}
	public String getAvailability() {
		return availability;
	}
	public void setAvailability(String availability) {
		this.availability = availability;
	}
	public String getSignpostUrl() {
		return signpostUrl;
	}
	public void setSignpostUrl(String signpostUrl) {
		this.signpostUrl = signpostUrl;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
	public Double getRatingValue() {
		return ratingValue;
	}
	public void setRatingValue(Double ratingValue) {
		this.ratingValue = ratingValue;
	}
	public int getRatingCount() {
		return ratingCount;
	}
	public void setRatingCount(int ratingCount) {
		this.ratingCount = ratingCount;
	}
	public String getTowAwayZoneHours() {
		return towAwayZoneHours;
	}
	public void setTowAwayZoneHours(String towAwayZoneHours) {
		this.towAwayZoneHours = towAwayZoneHours;
	}
	public String getKerbColor() {
		return kerbColor;
	}
	public void setKerbColor(String kerbColor) {
		this.kerbColor = kerbColor;
	}
	public String getPrices() {
		return prices;
	}
	public void setPrices(String prices) {
		this.prices = prices;
	}
	public String getStreetviewUrl() {
		return streetviewUrl;
	}
	public void setStreetviewUrl(String streetviewUrl) {
		this.streetviewUrl = streetviewUrl;
	}
	public int getTotalSpaceCount() {
		return totalSpaceCount;
	}
	public void setTotalSpaceCount(int totalSpaceCount) {
		this.totalSpaceCount = totalSpaceCount;
	}
	public int getAvailableSpaceCount() {
		return availableSpaceCount;
	}
	public void setAvailableSpaceCount(int availableSpaceCount) {
		this.availableSpaceCount = availableSpaceCount;
	}
	public int getAdaAccessibleSpaces() {
		return adaAccessibleSpaces;
	}
	public void setAdaAccessibleSpaces(int adaAccessibleSpaces) {
		this.adaAccessibleSpaces = adaAccessibleSpaces;
	}
	public int getEvChargingSpaces() {
		return evChargingSpaces;
	}
	public void setEvChargingSpaces(int evChargingSpaces) {
		this.evChargingSpaces = evChargingSpaces;
	}
	public String getEnforcementValidation() {
		return enforcementValidation;
	}
	public void setEnforcementValidation(String enforcementValidation) {
		this.enforcementValidation = enforcementValidation;
	}
	public String getTimeLimitException() {
		return timeLimitException;
	}
	public void setTimeLimitException(String timeLimitException) {
		this.timeLimitException = timeLimitException;
	}
	public String getShape() {
		return shape;
	}
	public void setShape(String shape) {
		this.shape = shape;
	}
	public LocalDateTime getLastDataLoadedAt() {
		return lastDataLoadedAt;
	}
	public void setLastDataLoadedAt(LocalDateTime lastDataLoadedAt) {
		this.lastDataLoadedAt = lastDataLoadedAt;
	}
	public LocalDateTime getLastModifiedAt() {
		return lastModifiedAt;
	}
	public void setLastModifiedAt(LocalDateTime lastModifiedAt) {
		this.lastModifiedAt = lastModifiedAt;
	}
	public String getLastModifiedBy() {
		return lastModifiedBy;
	}
	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}
	public MetaData(long id, String guid, String zoneName, int zoneNumber, String category, int maxTimeLimit,
			String streetName, String city, String state, String centroid, String country, String zipcode,
			String parkingHours, String cleaning, String riskLevel, String safetyRank, String availability,
			String signpostUrl, String imageUrl, Double ratingValue, int ratingCount, String towAwayZoneHours,
			String kerbColor, String prices, String streetviewUrl, int totalSpaceCount, int availableSpaceCount,
			int adaAccessibleSpaces, int evChargingSpaces, String enforcementValidation, String timeLimitException,
			String shape, LocalDateTime lastDataLoadedAt, LocalDateTime lastModifiedAt, String lastModifiedBy) {
		super();
		this.id = id;
		this.guid = guid;
		this.zoneName = zoneName;
		this.zoneNumber = zoneNumber;
		this.category = category;
		this.maxTimeLimit = maxTimeLimit;
		this.streetName = streetName;
		this.city = city;
		this.state = state;
		this.centroid = centroid;
		this.country = country;
		this.zipcode = zipcode;
		this.parkingHours = parkingHours;
		this.cleaning = cleaning;
		this.riskLevel = riskLevel;
		this.safetyRank = safetyRank;
		this.availability = availability;
		this.signpostUrl = signpostUrl;
		this.imageUrl = imageUrl;
		this.ratingValue = ratingValue;
		this.ratingCount = ratingCount;
		this.towAwayZoneHours = towAwayZoneHours;
		this.kerbColor = kerbColor;
		this.prices = prices;
		this.streetviewUrl = streetviewUrl;
		this.totalSpaceCount = totalSpaceCount;
		this.availableSpaceCount = availableSpaceCount;
		this.adaAccessibleSpaces = adaAccessibleSpaces;
		this.evChargingSpaces = evChargingSpaces;
		this.enforcementValidation = enforcementValidation;
		this.timeLimitException = timeLimitException;
		this.shape = shape;
		this.lastDataLoadedAt = lastDataLoadedAt;
		this.lastModifiedAt = lastModifiedAt;
		this.lastModifiedBy = lastModifiedBy;
	}
	public MetaData() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
		return "MetaData [id=" + id + ", guid=" + guid + ", zoneName=" + zoneName + ", zoneNumber=" + zoneNumber
				+ ", category=" + category + ", maxTimeLimit=" + maxTimeLimit + ", streetName=" + streetName + ", city="
				+ city + ", state=" + state + ", centroid=" + centroid + ", country=" + country + ", zipcode=" + zipcode
				+ ", parkingHours=" + parkingHours + ", cleaning=" + cleaning + ", riskLevel=" + riskLevel
				+ ", safetyRank=" + safetyRank + ", availability=" + availability + ", signpostUrl=" + signpostUrl
				+ ", imageUrl=" + imageUrl + ", ratingValue=" + ratingValue + ", ratingCount=" + ratingCount
				+ ", towAwayZoneHours=" + towAwayZoneHours + ", kerbColor=" + kerbColor + ", prices=" + prices
				+ ", streetviewUrl=" + streetviewUrl + ", totalSpaceCount=" + totalSpaceCount + ", availableSpaceCount="
				+ availableSpaceCount + ", adaAccessibleSpaces=" + adaAccessibleSpaces + ", evChargingSpaces="
				+ evChargingSpaces + ", enforcementValidation=" + enforcementValidation + ", timeLimitException="
				+ timeLimitException + ", shape=" + shape + ", lastDataLoadedAt=" + lastDataLoadedAt
				+ ", lastModifiedAt=" + lastModifiedAt + ", lastModifiedBy=" + lastModifiedBy + "]";
	}
    
   
}
