
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  private baseGisUrl=environment.gisUrl;
  guid: string = '';
  feature_id: string = '';

  // Initialize properties with default values
  properties: any = {
    rating_value: 0,  // Initialize as an integer
  };
  // Initialize metadataProperties with default values
  metadataProperties: any = {
    rating_value: 0,  // Example integer property

  };
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Fetch the parameters from the route
    this.route.paramMap.subscribe(params => {
      this.guid = params.get('guid') || '';
      const propertiesParam = params.get('properties');
      this.feature_id = params.get('feature_id') || '';
      // Parse JSON string back to object
      this.properties = propertiesParam ? JSON.parse(decodeURIComponent(propertiesParam)) : this.properties;
      console.log('GUID:', this.guid);
      console.log('Properties:', this.properties);
      console.log('Feature_Id:', this.feature_id);
      // Fetch and process metadata
      this.fetchMetadataLayer().then(metadata => {
        this.extractMetadataProperties(metadata);

        // Handle null or N/A values for properties and metadataProperties
        this.handleNullAndNAValues();
      });
    });
  }
  getMetadataPropertyKeys() {
    const excludedKeys = ['guid', 'st', 'dt', 'ct', 'geom', 'geometry', 'centroid', 'u_id', 'last_dt_ld', 'last_data_loaded_at', 'last_modified_at', 'zip_code']; 
    return Object.keys(this.metadataProperties).filter(key => !excludedKeys.includes(key));
  }
  getPropertyKeys() {
    const excludedKeys = ['guid', 'st', 'dt', 'ct', 'geom', 'geometry', 'centroid', 'u_id', 'last_dt_ld', 'last_data_loaded_at', 'last_mo_at', 'zip_code', 'image_path']; // Add all keys you want to exclude here
    return Object.keys(this.properties).filter(key => !excludedKeys.includes(key));
  }

  async fetchMetadataLayer() {
    return this.http.get<any>(`${this.baseGisUrl}/api/metadata`).toPromise();

  }

  extractMetadataProperties(metadata: any) {
    const matchedFeatures = metadata.features.filter((feature: any) => {
      const featureId = feature.properties.guid;
      return this.properties.guid === featureId;
    });

    if (matchedFeatures.length > 0) {
      // Assume we take the first matched feature
      this.metadataProperties = { ...this.metadataProperties, ...matchedFeatures[0].properties };
      console.log('Matched Metadata Properties:', this.metadataProperties);
    } else {
      console.error('No matching metadata features found.');
    }
  }

  handleNullAndNAValues() {
    // Helper function to determine if a value is null or "N/A"
    const isNullOrNA = (value: any) => value === null || value === 'N/A';

    // Handle properties
    for (const key in this.properties) {
      if (this.properties.hasOwnProperty(key)) {
        if (isNullOrNA(this.properties[key])) {
          // Replace null or "N/A" with default values
          this.properties[key] = this.getDefaultValue(key);
        }
      }
    }

    // Handle metadataProperties
    for (const key in this.metadataProperties) {
      if (this.metadataProperties.hasOwnProperty(key)) {
        if (isNullOrNA(this.metadataProperties[key])) {
          // Replace null or "N/A" with default values
          this.metadataProperties[key] = this.getDefaultValue(key);
        }
      }
    }
    
    console.log('Updated Properties:', this.properties);
    console.log('Updated Metadata Properties:', this.metadataProperties);
  }

  // Function to get the default value based on the key or datatype
  getDefaultValue(key: string): any {
    const defaultValues: any = {
      rating_value: 0, // Integer default
      last_data_loaded_at: new Date().toISOString(), // String default
      last_dt_ld: new Date().toISOString(), // Example string property
      last_mo_at: new Date().toISOString(), // Example string (ISO date format)
    };

    return defaultValues[key] !== undefined ? defaultValues[key] : ''; // Default to empty string if key not found
  }

  onPropertyChange(key: string, value: any) {
    this.properties[key] = value;
    if (this.metadataProperties.hasOwnProperty(key)) {
      this.metadataProperties[key] = value; // Sync with metadataProperties
    }
  }

  // When a metadata property changes, sync it with properties if it's a shared key
  onMetadataPropertyChange(key: string, value: any) {
    this.metadataProperties[key] = value;
    if (this.properties.hasOwnProperty(key)) {
      this.properties[key] = value; // Sync with properties
    }
  }
  getCommonPropertyKeys() {
    const excludedKeys = ['guid', 'st', 'dt', 'ct', 'geom', 'geometry', 'centroid', 'u_id', 'last_dt_ld', 'last_data_loaded_at', 'last_mo_at', 'zip_code', 'image_path'];
    return Object.keys(this.properties).filter(key =>!excludedKeys.includes(key) && Object.keys(this.metadataProperties).includes(key));
  }
  
  getUniquePropertyKeys() {
    const excludedKeys = ['guid', 'st', 'dt', 'ct', 'geom', 'geometry', 'centroid', 'u_id', 'last_dt_ld', 'last_data_loaded_at', 'last_mo_at', 'zip_code', 'image_path'];
    return Object.keys(this.properties)
      .filter(key => !excludedKeys.includes(key) && !Object.keys(this.metadataProperties).includes(key));
  }
  
  getUniqueMetadataPropertyKeys() {
    const excludedKeys = ['guid', 'st', 'dt', 'ct', 'geom', 'geometry', 'centroid', 'u_id', 'last_dt_ld', 'last_data_loaded_at', 'last_modified_at', 'zip_code'];
    return Object.keys(this.metadataProperties)
      .filter(key => !excludedKeys.includes(key) && !Object.keys(this.properties).includes(key));
  }
  
  
  onSubmit() {
    try {
      // Ensure last_data_loaded_at is in ISO format
      if (this.metadataProperties.hasOwnProperty('last_data_loaded_at')) {
        this.metadataProperties['last_data_loaded_at'] = new Date().toISOString();
      }

      // Initialize the WFS-T XML request base
      let wfstRequest = `
      <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs
        http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
    `;
    wfstRequest += `
      <wfs:Update typeName="ne:sanfrancisco_metadata">
    `;
    for (const key in this.metadataProperties) {
      if (this.metadataProperties.hasOwnProperty(key)) {
        const value = key === 'zone_number' && Number.isInteger(this.metadataProperties[key]) 
          ? this.metadataProperties[key] 
          : String(this.metadataProperties[key]);
          
        wfstRequest += `
          <wfs:Property>
            <wfs:Name>${key}</wfs:Name>
            <wfs:Value>${value}</wfs:Value>
          </wfs:Property>
        `;
      }
    }
    
    // Close metadata update
    wfstRequest += `
      <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:PropertyName>guid</ogc:PropertyName>
              <ogc:Literal>${this.guid}</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
        </wfs:Update>
    `;
    
    // Update plot data layer
    wfstRequest += `
      <wfs:Update typeName="ne:sanfrancisco_plot_data">
    `;
    // Include properties for plot data
    for (const key in this.properties) {
      if (this.properties.hasOwnProperty(key)) {
        const value = key === 'rating_value' && Number.isInteger(this.properties[key]) 
          ? this.properties[key] 
          : String(this.properties[key]);

        wfstRequest += `
          <wfs:Property>
            <wfs:Name>${key}</wfs:Name>
            <wfs:Value>${value}</wfs:Value>
          </wfs:Property>
        `;
      }
    }
    wfstRequest += `
        <ogc:Filter>
          <ogc:PropertyIsEqualTo>
            <ogc:PropertyName>guid</ogc:PropertyName>
            <ogc:Literal>${this.guid}</ogc:Literal>
          </ogc:PropertyIsEqualTo>
        </ogc:Filter>
      </wfs:Update>
    `;
    const selectedProperties = ['address', 'alais', 'capacity', 'city', 'place_name', 'street', 'state', 'zipcode', 'status'];

    // Check if 'status' is present in the properties and remove it
    if (this.properties.hasOwnProperty('status')) {
      delete this.properties['status'];
    }
    wfstRequest += `
    <wfs:Update typeName="ne:sanfrancisco_gis_data">
  `;
  for (const key of selectedProperties) {
    if (this.properties.hasOwnProperty(key)) {
      const value = this.properties[key];
        wfstRequest += `
          <wfs:Property>
            <wfs:Name>${key}</wfs:Name>
            <wfs:Value>${value}</wfs:Value>
          </wfs:Property>
        `;
    }
  }
  wfstRequest += `
          <wfs:Property>
            <wfs:Name>status</wfs:Name>
            <wfs:Value xsi:nil="true" />
          </wfs:Property>
        `;
  
  // Add the filter for plot data updates
  wfstRequest += `
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>guid</ogc:PropertyName>
          <ogc:Literal>${this.guid}</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
    </wfs:Update>
  `;
  
    
    
    wfstRequest += `
      </wfs:Transaction>
    `;
    console.log(wfstRequest);

    // Use the proxy URL for the request
    const headers = new HttpHeaders().set('Content-Type', 'text/xml');
    this.http.post(`${this.baseGisUrl}/proxy/geoserver/ne/wfs`, wfstRequest, { headers, responseType: 'text' })
      .subscribe(response => {
        console.log('Update successful:', response);
        this.goBack(); // Navigate back or reset the form
      }, error => {
        console.error('Update failed:', error);
      });

    } catch (error) {
      console.error('Error in form submission:', error);
    }
  }

  goBack() {
    this.router.navigate([{ outlets: { popup: null } }]);
  }
}