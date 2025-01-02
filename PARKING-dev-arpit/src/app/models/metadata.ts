export class Metadata {
    zoneName: string="";
    zoneNumber: number=0;
    category: string="";
    maxTimeLimit: number =0;
    streetName: string="";
    state: string="";
    centroid: string="";
    country: string="";
    city: string="";
    zipCode: string="";
    parkingHours: string="";
    cleaningHours: string="";
    riskLevel: string="";
    safetyRank: string="";
    availability: string="";
    signpostUrl: string="";
    imageUrl: string="";
    ratingValue: number =0;
    ratingCount: number =0;
    towAwayZoneHours: string="";
    kerbColor: string="";
    prices: string="";
    streetviewUrl: string="";
    totalSpaceCount: number =0;
    availableSpaceCount: number =0;
    adaAccessibleSpaces: number =0;
    evChargingSpaces: number =0;
    enforcementValidation: string="";
    timeLimitException: string="";
    shape: string="";
    lastDataLoadedAt: string="";
    lastModifiedAt: string="";
    lastModifiedBy: string="";
    street: string="";
    zipcode: string="";
    cleaning_hours: string="";
    suspension: string="";
    level: string="";
    place_name: string="";
    regulation: string="";
    remark: string="";
    geometry: string="";
    timing: string="";
    alias: string="";
    address: string="";
    available: number =0;
    capacity: number =0;
    imgpath: string=""
}

export class PendingRecord{
    guid: string="";         // Unique identifier for the record
    place_name: string="";    // Changed from place_name to placeName
    city: string="";
    state: string="";
    capacity: number=0;
    zipcode: string="";
    // Add any additional fields if necessary
}

export class  GISDataCount {
    Published: number=0;
    'Non Published': number;
    'Total Records': number;
    Pending: number=0;
  }
