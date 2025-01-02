import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {
  baseGisUrl: string = environment.gisUrl;
  allRows: any[] = [];

  constructor(private http: HttpClient) {}

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processBulkUploadCSV(file);
    }
  }

  processBulkUploadCSV(file: File): void {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: { data: any }) => {
        const rows = result.data;
        rows.forEach((row: any, rowIndex: number) => {
          try {
            row['guid'] = uuidv4(); // Set a new GUID for each row

            if (row['geometry']) {
              row['geometry'] = JSON.parse(row['geometry']);
              console.log('Parsed Geometry:', row['geometry']);
            } else {
              console.warn(`No geometry data found for row at index ${rowIndex}`);
            }
            
            this.allRows.push(row); // Collect each processed row
          } catch (error) {
            console.error(`Failed to process row at index ${rowIndex}:`, error);
          }
        });

        // After processing all rows, create and send bulk transactions
        this.createAndSendBulkTransactions();
      },
      error: (error) => {
        console.error('Error reading CSV file:', error);
      }
    });
  }

  createAndSendBulkTransactions(): void {
    // Create and send all rows to sanfrancisco_plot_data first
    const plotDataTransaction = this.createBulkTransaction(this.allRows, 'sanfrancisco_plot_data');
    this.sendTransaction(plotDataTransaction).then(() => {
      console.log('All rows added to sanfrancisco_plot_data');

      // Then create and send all rows to sanfrancisco_gis_data
      const gisDataTransaction = this.createBulkTransaction(this.allRows, 'sanfrancisco_gis_data');
      this.sendTransaction(gisDataTransaction).then(() => {
        console.log('All rows added to sanfrancisco_gis_data');

        // Finally, create and send all rows to sanfrancisco_metadata
        const metadataTransaction = this.createBulkTransaction(this.allRows, 'sanfrancisco_metadata');
        this.sendTransaction(metadataTransaction).then(() => {
          console.log('All rows added to sanfrancisco_metadata');
        });
      });
    });
  }

  createBulkTransaction(rows: any[], layer: string): string {
    let wfstRequest = `
      <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:ne="http://gs.quantasip.com"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    `;

    rows.forEach(data => {
      wfstRequest += `<wfs:Insert><ne:${layer}>`;

      for (const key in data) {
        if (data.hasOwnProperty(key) && key !== 'geometry') {
          const escapedValue = this.escapeXml(data[key]);
          wfstRequest += `<ne:${key}>${escapedValue}</ne:${key}>`;
        }
      }

      if (data.geometry) {
        wfstRequest += this.createGeometryXML(data.geometry);
      }

      wfstRequest += `</ne:${layer}></wfs:Insert>`;
    });

    wfstRequest += `</wfs:Transaction>`;
    return wfstRequest;
  }

  createGeometryXML(geometry: any): string {
    let geometryXML = '';

    if (Array.isArray(geometry) && geometry.length > 0 && Array.isArray(geometry[0])) {
      const isMultiLineString = geometry.length > 1 && Array.isArray(geometry[0][0]);

      if (isMultiLineString) {
        geometryXML += `
          <ne:geometry>
            <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
        `;
        geometry.forEach((line: any[]) => {
          geometryXML += `
            <gml:lineStringMember>
              <gml:LineString>
                <gml:coordinates decimal="." cs="," ts=" ">${line.map(coord => coord.join(',')).join(' ')}</gml:coordinates>
              </gml:LineString>
            </gml:lineStringMember>
          `;
        });
        geometryXML += `
            </gml:MultiLineString>
          </ne:geometry>
        `;
      } else {
        geometryXML += `
          <ne:geometry>
            <gml:LineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
              <gml:coordinates decimal="." cs="," ts=" ">${geometry.map((coord: any[]) => coord.join(',')).join(' ')}</gml:coordinates>
            </gml:LineString>
          </ne:geometry>
        `;
      }
    } else {
      console.error('Invalid geometry format, expected array of coordinate pairs.');
    }

    return geometryXML;
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

  escapeXml(unsafe: any): string {
    if (unsafe === null || unsafe === undefined) {
      return '';
    }
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
