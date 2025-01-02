export interface GISDataCount {
    Published: number;
    'Non Published': number;
    'Total Records': number;
    Pending: number;
  }
  
  export interface PendingRecord {
    guid: string;         // Unique identifier for the record
    place_name: string;    // Changed from place_name to placeName
    city: string;
    state: string;
    capacity: number;
    zipcode: string;
    status: boolean | null;
    feedback?:string;
    // Add any additional fields if necessary
  }
  
  // Define the RejectedRecord interface
  export interface RejectedRecord {
    guid: string;
    place_name: string;
    city: string;
    state: string;
    capacity: number;
    zipcode: string;
    status: boolean | null; 
    feedback:string;
  }
  
  // Define the Approved interface
  export interface ApprovedRecord {
    guid: string;
    place_name: string;
    city: string;
    state: string;
    capacity: number;
    zipcode: string;
    status: boolean | null; 
    feedback?:string;
  }
  export interface AllRecords{
    guid: string;
    place_name: string;
    city: string;
    state: string;
    capacity: number;
    zipcode: string;
    status: boolean | null;
    feedback?:string;
  }