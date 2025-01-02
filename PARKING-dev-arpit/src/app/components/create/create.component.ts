import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  private baseGisUrl = environment.gisUrl;
  guid1 = uuidv4();
  metadataProperties: any = {
    guid: this.guid1,
    zone_name: '',
    zone_number: 0,
    category: '',
    max_time_limit: 0,
    street: '',
    address: '',
    alias: '',
    place_name: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    parking_hours: '',
    cleaning_hours: '',
    risk_level: '',
    safety_rank: '',
    availability: '',
    signpost_url: '',
    image_url: '',
    rating_value: (0).toFixed(1),
    rating_count: 0,
    tow_away_zone_hours: '',
    kerb_color: '',
    prices: '',
    streetview_url: '',
    total_space_count: 0,
    available_space_count: 0,
    ada_available_spaces: 0,
    ev_charging_spaces: 0,
    enforcement_validation: '',
    time_limit_exception: '',
    shape: '',
    last_data_loaded_at: new Date().toISOString(),
    last_modified_at: new Date().toISOString(),
    last_modified_by: '',
    capacity: 0,
    available: 0,
    timing: '',
    regulation: '',
    cleaning: '',
    suspension: '',
    level: '',
    remark: '',
    imgpath: '',
    geometry: null
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['geometry']) {
        const coordinates = JSON.parse(params['geometry']);
        this.metadataProperties.geometry = this.formatCoordinates(coordinates);
      }
    });
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  formatCoordinates(coordinates: Array<{ lat: number, lng: number }>): string {
    return coordinates.map(coord => `${coord.lng},${coord.lat}`).join(' ');
  }

  async onSubmit() {
    try {
      const plotTransaction = this.createWfsTransaction('sanfrancisco_plot_data');
      const gisTransaction = this.createWfsTransaction('sanfrancisco_gis_data');
      const metadataTransaction = this.createWfsTransaction('sanfrancisco_metadata');

      const plotResponse = await this.sendTransaction(plotTransaction);
      console.log('Plot Transaction Response:', plotResponse);

      const gisResponse = await this.sendTransaction(gisTransaction);
      console.log('GIS Transaction Response:', gisResponse);

      const metadataResponse = await this.sendTransaction(metadataTransaction);
      console.log('Metadata Transaction Response:', metadataResponse);

      if (plotResponse && gisResponse && metadataResponse) {
        console.log('All data insertion successful');
      } else {
        console.error('One or more transactions failed');
      }

      this.goBack();
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  }

  createWfsTransaction(layerName: string): string {
    let wfstRequest = `
    <wfs:Transaction service="WFS" version="1.1.0"
      xmlns:wfs="http://www.opengis.net/wfs"
      xmlns:gml="http://www.opengis.net/gml"
      xmlns:ne="http://gs.quantasip.com"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <wfs:Insert>
        <ne:${layerName}>
    `;

    for (const key in this.metadataProperties) {
      if (this.metadataProperties.hasOwnProperty(key) && key !== 'geometry') {
        const value = this.metadataProperties[key];
        wfstRequest += `
          <${key}>${value}</${key}>
        `;
      }
    }

    if (this.metadataProperties.geometry && layerName === 'sanfrancisco_plot_data') {
      wfstRequest += `
        <ne:geometry>
          <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
            <gml:lineStringMember>
              <gml:LineString>
                <gml:coordinates decimal="." cs="," ts=" ">${this.metadataProperties.geometry}</gml:coordinates>
              </gml:LineString>
            </gml:lineStringMember>
          </gml:MultiLineString>
        </ne:geometry>
      `;
    }

    wfstRequest += `
        </ne:${layerName}>
      </wfs:Insert>
    </wfs:Transaction>
    `;

    return wfstRequest;
  }

  sendTransaction(wfstRequest: string): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/xml');
    return this.http.post(`${this.baseGisUrl}/proxy/geoserver/ne/wfs`, wfstRequest, { headers, responseType: 'text' }).toPromise()
      .then(response => {
        console.log('Transaction successful:', response);
        return response;
      })
      .catch(error => {
        console.error('Transaction failed:', error);
        return null;
      });
  }

  goBack() {
    this.router.navigate([{ outlets: { popup: null } }]);
  }
}
