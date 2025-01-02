import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID function
import Papa from 'papaparse';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bulk-feedback',
  templateUrl: './bulk-feedback.component.html',
  styleUrls: ['./bulk-feedback.component.css']
})
export class BulkFeedbackComponent {
  baseGisUrl: string = environment.gisUrl; // Replace with your actual Geoserver URL
  feedbackDataEntries: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}
  

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processBulkFeedbackCSV(file);
    }
  }
  goBack(): void {
    this.router.navigate([{ outlets: { popup: null } }]);
  }
  submitAllTransactions(): void {
    const promises = this.feedbackDataEntries.map((data) => {
      const layerType = this.getLayerType(data.geometryType);
      return this.sendToWMSLayer(data, layerType);
    });

    Promise.all(promises)
      .then(() => {
        console.log("All transactions submitted successfully.");
        this.goBack();
      })
      .catch((error) => {
        console.error("Error submitting transactions:", error);
      });
  }
  getLayerType(geometryType: string): string {
    switch (geometryType.toLowerCase()) {
      case 'polygon': return 'ne:Polygon';
      case 'polyline': return 'ne:Line';
      case 'point': return 'ne:Points';
      default: console.error("Unknown geometry type:", geometryType); return '';
    }
  }
  processBulkFeedbackCSV(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = reader.result as string;

      Papa.parse(fileContent, {
        complete: (result) => {
          const rows: string[][] = result.data as string[][];

          if (rows.length === 0) {
            console.error("CSV is empty.");
            return;
          }

          const headers = rows[0].map((header: string) => header.trim());

          const geometryIndex = headers.indexOf('geometry');
          const geometryTypeIndex = headers.indexOf('geometry type');

          if (geometryIndex === -1 || geometryTypeIndex === -1) {
            console.error("CSV is missing required columns: 'geometry' or 'geometry type'.");
            return;
          }

          rows.slice(1).forEach((row: string[]) => {
            const geometryType = row[geometryTypeIndex].trim();
            let geometryData;
            try {
              geometryData = JSON.parse(row[geometryIndex].trim().replace(/'/g, '"'));
            } catch (error) {
              console.error("Invalid JSON in geometry data:", row[geometryIndex]);
              return;
            }

            const feedbackData: any = { geometryData };
            headers.forEach((header, index) => {
              if (header !== 'geometry' && header !== 'geometry type') {
                feedbackData[header] = row[index].trim();
              }
            });

            feedbackData['guid'] = feedbackData['guid'] || uuidv4();
            feedbackData['geometryType'] = geometryType;

            this.feedbackDataEntries.push(feedbackData);
          });
        },
        error: (error: { message: any; }) => {
          console.error("Error parsing CSV:", error.message);
        }
      });
    };
    reader.readAsText(file);
  }
  

  verifyHeaders(headers: string[], expectedHeaders: string[]): boolean {
    return headers.length === expectedHeaders.length && headers.every((header, index) => header === expectedHeaders[index]);
  }

  sendToWMSLayer(data: any, layer: string): Promise<any> {
    let geometryGML = '';
    const srsName = "http://www.opengis.net/gml/srs/epsg.xml#4326";
  
    switch (layer) {
      case 'ne:Points':
        // Directly use the coordinates for point geometry, split by a comma
        const coordinates = data.geometryData;  // Split and clean the coordinates
        geometryGML = `
          <ne:geom>
            <gml:Point srsName="${srsName}">
              <gml:coordinates decimal="." cs="," ts=" ">${coordinates.join(',')}</gml:coordinates>
            </gml:Point>
          </ne:geom>`;
        break;
  
      case 'ne:Line':
        geometryGML = `
          <ne:geom>
            <gml:MultiLineString srsName="${srsName}">
              <gml:lineStringMember>
                <gml:LineString>
                  <gml:coordinates decimal="." cs="," ts=" ">${data.geometryData.map((coord: any[]) => coord.join(",")).join(" ")}</gml:coordinates>
                </gml:LineString>
              </gml:lineStringMember>
            </gml:MultiLineString>
          </ne:geom>`;
        break;
  
      case 'ne:Polygon':
        
        geometryGML = `
          <ne:geom>
            <gml:MultiPolygon srsName="${srsName}">
              <gml:polygonMember>
                <gml:Polygon>
                  <gml:outerBoundaryIs>
                      <gml:coordinates decimal="." cs="," ts=" ">
                      ${data.geometryData.map((coord: any[]) => coord.join(",")).join(" ").trim()}
                      </gml:coordinates>
                  </gml:outerBoundaryIs>
                </gml:Polygon>
              </gml:polygonMember>
            </gml:MultiPolygon>
          </ne:geom>`;
          console.log(data.geometryData.map((coord: any[]) => coord.join(",")).join(" "));
        break;
  
      default:
        console.error("Unknown layer type:", layer);
        return Promise.reject("Unknown layer type");
    }
  
    let wfstRequest = `
      <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:ne="http://gs.quantasip.com"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <wfs:Insert>
          <${layer}>`;
  
    // Adding name, address, comment, and guid fields
    wfstRequest += `<name>${data.name}</name>`;
    wfstRequest += `<address>${data.address}</address>`;
    wfstRequest += `<comment>${data.comment}</comment>`;
    wfstRequest += `<guid>${data.guid}</guid>`;
    wfstRequest += geometryGML;
  
    wfstRequest += `
        </${layer}>
      </wfs:Insert>
    </wfs:Transaction>`;
  
    console.log("Constructed WFS Transaction request:", wfstRequest);
  
    return this.sendTransaction(wfstRequest);
  }
  

  sendTransaction(wfstRequest: string): Promise<any> {
    const headers = new HttpHeaders().set('Content-Type', 'text/xml');
    return this.http.post(`${this.baseGisUrl}/proxy/geoserver/ne/wfs`, wfstRequest, { headers, responseType: 'text' }).toPromise()
      .then((response: any) => {
        console.log('Transaction successful:', response);
        return response;
      })
      .catch((error: any) => {
        console.error('Transaction failed:', error);
        return null;
      });
  }
}