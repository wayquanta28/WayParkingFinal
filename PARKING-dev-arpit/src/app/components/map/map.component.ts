import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import * as L from 'leaflet';

import 'leaflet-draw';  // Import leaflet-draw for editing features
import 'leaflet-geometryutil';
import { SearchService } from './helper/searchService';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  private baseGeoserverUrl = environment.geoserverUrl;
  private baseGisUrl = environment.gisUrl;
  // Defining componenet properties for data binding
  // rejectedRecords: RejectedRecord[]=[];
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;
  route: any;
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  selectedPlace: string = '';
  from: string = '';  // Declare the 'from' property
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { // Check if the navigation state contains 'from' data
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.from = this.router.getCurrentNavigation()?.extras.state?.['from'] || '';
    }
  }
  map!: L.Map;
  baseLayers!: { [name: string]: L.Layer };
  currentBaseLayer!: L.Layer;
  featureLayer!: L.LayerGroup; // Layer group for feature polygons
  userMarker!: L.Marker; // Marker for user's current location
  lastData: any = null; // To store the last data if map is not clicked
  mapClicked: boolean = false; // Flag to check if the map was clicked

  ngAfterViewInit(): void {
    this.initMap();
    this.initializeSidebarFunctions();
    this.initializeSearch();
    this.highlightSelectedLayer('Google Road Map');

  }

  initializeSearch():void{
    const searchService = new SearchService(this.activatedRoute);
    searchService.initializeSearch(
      'searchInput', 
      'searchButton', 
      this.searchFeatureById.bind(this),  // Bind to keep the context of 'this'
      this.fetchPlaceNames.bind(this)     // Bind to keep the context of 'this'
    );
  }
  updateSearchInput(placeName: string): void {
    if (this.searchInputRef && this.searchInputRef.nativeElement) {
      this.searchInputRef.nativeElement.value = placeName;
    }
  }
  initMap(): void {
    // Initialize the map
    this.map = L.map('map', {
      center: [37.773972, -122.431297],
      zoom: 13,
      maxZoom: 80,  // Set the maximum zoom level
      zoomControl: false
    });
    const storedCenter = localStorage.getItem('mapCenter');
    const storedZoom = localStorage.getItem('mapZoom');
    const storedLayer = localStorage.getItem('selectedLayer');
    const storedImgSrc = localStorage.getItem('selectedLayerImgSrc');

    if (storedCenter && storedZoom) {
      const center = JSON.parse(storedCenter);
      const zoom = parseInt(storedZoom, 10);

      // Set the map view to the stored center and zoom level
      this.map.setView([center.lat, center.lng], zoom);
    }
    const osmLayer = L.tileLayer('http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}', {
      maxZoom: 80,
      attribution: ' ',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    const googleSatelliteLayer = L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
      maxZoom: 80,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    const hybridLayer = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
      maxZoom: 80,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    const terrainLayer = L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}', {
      maxZoom: 80,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    const trafficLayer = L.tileLayer('http://mt0.google.com/vt/lyrs=m,traffic&hl=en&x={x}&y={y}&z={z}', {
      maxZoom: 80,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    osmLayer.addTo(this.map);
    this.currentBaseLayer = osmLayer;
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);
    this.baseLayers = {
      'Google Road Map': osmLayer,
      'Satellite': googleSatelliteLayer,
      'Hybrid': hybridLayer,
      'Terrain': terrainLayer,
      'Traffic': trafficLayer
    };
    if (storedLayer && storedImgSrc) {
      this.selectBaseLayer(storedLayer, storedImgSrc);
      this.highlightSelectedLayer(storedLayer);
    }

    this.currentBaseLayer.addTo(this.map); // Add the current base layer to the map

    L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
      layers: 'ne:sanfrancisco_plot_data',
      format: 'image/png',
      transparent: true,
      maxZoom: 80,
      attribution: '© QuantaSIP'
    }).addTo(this.map);
    L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
      layers: 'ne:Line',
      format: 'image/png',
      transparent: true,
      maxZoom: 80,
      attribution: '© QuantaSIP'
    }).addTo(this.map);
    L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
      layers: 'ne:Points',
      format: 'image/png',
      transparent: true,
      maxZoom: 80,
      attribution: '© QuantaSIP'
    }).addTo(this.map);
    L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
      layers: 'ne:Polygon',
      format: 'image/png',
      transparent: true,
      maxZoom: 80,
      attribution: '© QuantaSIP'
    }).addTo(this.map);

    // Initialize the feature layer for polygons
    this.featureLayer = L.layerGroup().addTo(this.map);

    // Handle click event to get feature info
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const latlng = e.latlng;
      this.getFeatureInfo(latlng);
    });
    const handCursorButton = document.getElementById('handCursorButton') as HTMLButtonElement;
    const mapDiv = document.getElementById('map') as HTMLElement;

    // Initialize flag to track cursor state
    let isHandCursorActive = false;

    // Add event listener to the button
    handCursorButton.addEventListener('click', () => {
      // Toggle the hand cursor state
      isHandCursorActive = !isHandCursorActive;

      if (isHandCursorActive) {
        // Change cursor style on the map division when button is active
        mapDiv.style.cursor = 'grab'; // Set grab cursor
        handCursorButton.style.backgroundColor = '#007BFF';
        mapDiv.addEventListener('mousedown', () => {
          mapDiv.style.cursor = 'grabbing'; // Change to grabbing when dragging starts
        });

        mapDiv.addEventListener('mouseup', () => {
          mapDiv.style.cursor = 'grab'; // Revert to grab when dragging ends
        });

        mapDiv.addEventListener('mouseleave', () => {
          mapDiv.style.cursor = 'grab'; // Revert to grab if the cursor leaves the map
        });

        // Optional: Listen to zoom events if your map library supports it
        this.map.on('zoomstart', () => {
          mapDiv.style.cursor = 'grabbing'; // Set to grabbing when zooming
        });

        this.map.on('zoomend', () => {
          mapDiv.style.cursor = 'grab'; // Revert to grab when zooming ends
        });
      } else {
        // Revert to normal cursor
        mapDiv.style.cursor = 'auto'; // Reset cursor
        handCursorButton.style.backgroundColor = 'white';
        mapDiv.addEventListener('mousedown', () => {
          mapDiv.style.cursor = 'auto'; // Change to grabbing when dragging starts
        });

        mapDiv.addEventListener('mouseup', () => {
          mapDiv.style.cursor = 'auto'; // Revert to grab when dragging ends
        });

        mapDiv.addEventListener('mouseleave', () => {
          mapDiv.style.cursor = 'auto'; // Revert to grab if the cursor leaves the map
        });

        // Optional: Listen to zoom events if your map library supports it
        this.map.on('zoomstart', () => {
          mapDiv.style.cursor = 'auto'; // Set to grabbing when zooming
        });

        this.map.on('zoomend', () => {
          mapDiv.style.cursor = 'auto'; // Revert to grab when zooming ends
        });
      }
    });
  }
  public toggleBaseLayer(layerName: string): void {
    if (this.baseLayers[layerName]) {
      this.map.removeLayer(this.currentBaseLayer);
      this.currentBaseLayer = this.baseLayers[layerName];
      this.currentBaseLayer.addTo(this.map);

      // Optional: Add or adjust WMS layer
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:sanfrancisco_plot_data',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:Line',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:Points',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:Polygon',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);

      // You can add highlight logic for the selected layer here
    }
  }

  public toggleBackgroundOptions(): void {
    const buttonsDiv = document.getElementById('backgroundButtons');
    const toggleButton = document.getElementById('toggleButton');
    if (buttonsDiv) {
      if (buttonsDiv.style.display === 'none' || buttonsDiv.style.display === '') {
        buttonsDiv.style.display = 'block';  // Show background options
        toggleButton!.style.display = 'none'; // Hide toggle button
      } else {
        buttonsDiv.style.display = 'none';  // Hide background options
        toggleButton!.style.display = 'block'; // Show toggle button
      }
    }
  }

  public selectBaseLayer(layerName: string, imgSrc: string): void {
    if (this.baseLayers[layerName]) {
      // Remove the current base layer and add the new one
      this.map.removeLayer(this.currentBaseLayer);
      this.currentBaseLayer = this.baseLayers[layerName];
      this.currentBaseLayer.addTo(this.map);
      this.highlightSelectedLayer(layerName);

      // Hide background buttons after layer selection
      const buttonsDiv = document.getElementById('backgroundButtons');
      const toggleButton = document.getElementById('toggleButton');
      if (buttonsDiv && toggleButton) {
        buttonsDiv.style.display = 'none';  // Hide background buttons
        toggleButton.style.display = 'block';  // Show the toggle button again
        toggleButton.style.height = '50px';
        // Update the toggleButton image to the selected layer image
        toggleButton.setAttribute('src', imgSrc);
      }

      // Optional: Add or adjust WMS layer
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:sanfrancisco_plot_data',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:Line',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:Points',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      L.tileLayer.wms(`${this.baseGeoserverUrl}`, {
        layers: 'ne:Polygon',
        format: 'image/png',
        transparent: true,
        maxZoom: 80,
        attribution: '© QuantaSIP'
      }).addTo(this.map);
      localStorage.setItem('selectedLayer', layerName);
      localStorage.setItem('selectedLayerImgSrc', imgSrc);
    }
  }
  highlightSelectedLayer(layerName: string): void {
    const baseLayers = document.querySelectorAll('.base-layer');
    baseLayers.forEach((layer: Element) => {
      // Remove any existing highlight
      layer.classList.remove('highlighted-layer');

      // If this is the selected layer, add the highlight
      if (layer.innerHTML.includes(layerName)) {
        layer.classList.add('highlighted-layer');
      }
    });
  }


  nearMe() {
    this.addCurrentLocationMarker();
  }
  initializeSidebarFunctions(): void {
    // Ensure the functions are available in the global scope
    (window as any).openSidebar = this.openSidebar.bind(this);
    (window as any).closeSidebar = this.closeSidebar.bind(this);
  }
  addCurrentLocationMarker(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Create and add a marker for the current location
          this.userMarker = L.marker([lat, lng], {
            title: '',
            icon: L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
            })
          }).addTo(this.map);
          this.map.setView([lat, lng], 13);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
  clearFeatureLayer(): void {
    this.featureLayer.clearLayers();
  }
  getFeatureInfo(latlng: L.LatLng): void {
    const size = this.map.getSize();  // Get map size in pixels
    const bounds = this.map.getBounds();  // Get current bounds of the map
    const bbox = bounds.toBBoxString();  // Convert bounds to bounding box
    const point = this.map.latLngToContainerPoint(latlng);  // Convert latlng to pixel coordinates within the map container

    const layers = 'ne:sanfrancisco_plot_data'; // Your layers
    const url = `${this.baseGisUrl}/api/feature-info?x=${Math.floor(point.x)}&y=${Math.floor(point.y)}&width=${size.x}&height=${size.y}&bbox=${bbox}&layers=${layers}`;
    console.log(url);
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.clearFeatureLayer();
        this.displayFeatureInfo(data);

        if (!data || !data.features) {
          console.error('No features found in the response.');
          return;
        }

        // Fetch metadata layer to compare guid
        this.fetchMetadataLayer().then(metadata => {
          const matchedFeatures = metadata.features.filter((feature: any) => {
            const featureId = feature.properties.guid;
            return data.features.some((metaFeature: any) => metaFeature.properties.guid === featureId);
          });

          if (matchedFeatures.length > 0) {
            this.displayMatchedFeatures(matchedFeatures);
            console.log(matchedFeatures);
          } else {
            console.error('No matched features found.');
          }
        });
        data.features.forEach((feature: { geometry: any; id: string }) => {
          const featureGeometry = feature.geometry;
          if (featureGeometry.type === 'LineString' || featureGeometry.type === 'MultiLineString') {
            const transformedCoordinates = this.transformCoordinates(featureGeometry.coordinates);
            const polyline = L.polyline(transformedCoordinates, {
              color: '#1c9be6',
              weight: 6,
              opacity: 0.8,
            }).addTo(this.featureLayer);
            // Fit the map to the polyline's bounds
            this.map.fitBounds(polyline.getBounds(), { maxZoom: 18 });

            // Show popup with edit button and pass the feature ID
            this.showPopupWithEditButton(latlng, polyline, feature.id);
          }
        });

      })
      .catch(error => console.error('Error fetching feature info:', error));
  }
  showPopupWithEditButton(latlng: L.LatLng, polyline: L.Polyline, featureId: string): void {

    const popupContent = `
    <div>
      <button id="edit-line">✏️</button>
    </div>
  `;
  // console.log('123');
    const popup = L.popup()
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(this.map);
      // console.log('123');
    const editButton = popup.getElement()?.querySelector('#edit-line');
    if (editButton) {
      editButton.addEventListener('click', () => this.enableLineEditing(polyline, featureId));
      // console.log('123');
    }
  }
  enableLineEditing(polyline: L.Polyline, featureId: string): void {
    this.map.getContainer().style.cursor = 'crosshair';
    // Get the latLngs from the polyline and flatten if necessary (for MultiLineString)
    let latLngs: L.LatLng[] = Array.isArray(polyline.getLatLngs()[0])
      ? (polyline.getLatLngs() as L.LatLng[][]).flat()
      : (polyline.getLatLngs() as L.LatLng[]);
    const originalCoordinates = Array.isArray(latLngs[0])
      ? (latLngs as unknown as L.LatLng[][]).flat().map((latLng: L.LatLng) => [latLng.lng, latLng.lat])
      : (latLngs as L.LatLng[]).map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);


    // Add drag handlers for each point of the polyline
    latLngs.forEach((latlng: L.LatLng, index: number) => {
      const marker = L.marker(latlng, {
        draggable: true,
        icon: L.divIcon({ className: 'edit-marker' }) // Custom styling for the edit markers
      }).addTo(this.map);

      marker.on('dragstart', (event: L.LeafletEvent) => {
        // Disable map dragging when a marker is being dragged
        this.map.dragging.disable();
      });

      marker.on('drag', (event: L.LeafletEvent) => {
        // Update the latlng for the corresponding index
        latLngs[index] = (event as L.LeafletMouseEvent).latlng;
        polyline.setLatLngs(latLngs); // Update the polyline
        this.updatePolylineLength(polyline); // Recalculate and display length
      });

      marker.on('dragend', async (event: L.DragEndEvent) => {
        // Enable map dragging when the marker dragging ends
        this.map.dragging.enable();
        this.map.getContainer().style.cursor = '';

        // Retrieve updated LatLngs
        const updatedLatLngs = polyline.getLatLngs();

        // Check if the updatedLatLngs is an array of LatLng or nested array
        const updatedCoordinates = Array.isArray(updatedLatLngs[0])
          ? (updatedLatLngs as L.LatLng[][]).flat().map((latLng: L.LatLng) => [latLng.lng, latLng.lat])
          : (updatedLatLngs as L.LatLng[]).map((latLng: L.LatLng) => [latLng.lng, latLng.lat]);

        const isValid = await this.validateGeometry(updatedCoordinates, featureId);

        if (isValid) {
          // If the geometry is valid, update the feature
          this.updateFeatureGeometry(featureId, updatedCoordinates);
        } else {
          alert('The updated geometry intersects with existing geometries. Please adjust the shape.');
          const mapCenter = this.map.getCenter();
          const mapZoom = this.map.getZoom();
          localStorage.setItem('mapCenter', JSON.stringify(mapCenter));
          localStorage.setItem('mapZoom', mapZoom.toString());

          window.location.reload();
        }
      });
    });
  }




  updatePolylineLength(polyline: L.Polyline): void {
    const latLngs = polyline.getLatLngs() as L.LatLng[];
    const length = L.GeometryUtil.length(latLngs); // Calculate length
    console.log(`Updated length: ${length.toFixed(2)} meters`);

    // Update tooltip content
    polyline.getTooltip()?.setContent(`Length: ${length.toFixed(2)} m`);
  }
  async validateGeometry(updatedCoordinates: number[][] | number[][][], featureId: string): Promise<boolean> {
    // Fetch existing geometries from your Spring Boot API
    const existingFeatures = await fetch(`${this.baseGisUrl}/api/get-existing-features`);
    if (!existingFeatures.ok) {
      console.error('Failed to fetch existing features');
      return false;
    }
    const existingGeojson = await existingFeatures.json();
    // Flatten MultiLineString for comparison
    const flattenCoordinates = (coords: number[][] | number[][][]): number[][] => {
      return Array.isArray(coords[0][0]) 
        ? (coords as number[][][]).flat() 
        : coords as number[][];
    };
  
    // Flatten updated coordinates
    const updatedCoords = flattenCoordinates(updatedCoordinates);
  
    // Function to check if two line segments intersect
    const doLinesIntersect = (line1Start: number[], line1End: number[], line2Start: number[], line2End: number[]): boolean => {
      const ccw = (A: number[], B: number[], C: number[]) => {
        return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
      };
      return (ccw(line1Start, line2Start, line2End) !== ccw(line1End, line2Start, line2End)) &&
             (ccw(line1Start, line1End, line2Start) !== ccw(line1Start, line1End, line2End));
    };
  
    // Loop over each feature's geometry and check for intersections
    for (const feature of existingGeojson.features) {
      // Ignore the current feature being edited (based on featureId)
      if (feature.id === featureId) {
        continue; // Skip checking intersection for the same feature
      }
      if (!feature.geometry || !feature.geometry.coordinates) {
        console.warn(`Feature with ID ${feature.id} has no valid geometry or coordinates`);
        continue; // Skip if the feature's geometry or coordinates are missing
      }
  
      const existingCoords = flattenCoordinates(feature.geometry.coordinates);
  
      // Loop through all segments of updated and existing coordinates
      for (let i = 0; i < updatedCoords.length - 1; i++) {
        const updatedStart = updatedCoords[i];
        const updatedEnd = updatedCoords[i + 1];
  
        for (let j = 0; j < existingCoords.length - 1; j++) {
          const existingStart = existingCoords[j];
          const existingEnd = existingCoords[j + 1];
  
          // Check if these two segments intersect
          if (doLinesIntersect(updatedStart, updatedEnd, existingStart, existingEnd)) {
            console.error('Overlap detected with feature ID:', feature.id);
            return false; // Intersection detected
          }
        }
      }
    }
  
    return true; // No intersections found
  }
  updateFeatureGeometry(featureId: string, updatedCoordinates: number[][] | number[][][]): void {

    const wfsTransaction = `
    <wfs:Transaction service="WFS" version="1.1.0"
        xmlns:wfs="http://www.opengis.net/wfs"
        xmlns:gml="http://www.opengis.net/gml"
        xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs
        http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
      <wfs:Update typeName="ne:sanfrancisco_plot_data">
        <wfs:Property>
          <wfs:Name>geometry</wfs:Name>
          <wfs:Value>
            <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
              <gml:lineStringMember>
                <gml:LineString>
                  <gml:coordinates decimal="." cs="," ts=" ">
                    ${this.formatCoordinatesForGML(updatedCoordinates)}
                  </gml:coordinates>
                </gml:LineString>
              </gml:lineStringMember>
            </gml:MultiLineString>
          </wfs:Value>
        </wfs:Property>
        <ogc:Filter>
          <ogc:FeatureId fid="${featureId}"/>
        </ogc:Filter>
      </wfs:Update>
    </wfs:Transaction>
  `;
    fetch(`${this.baseGisUrl}/proxy/geoserver/ne/wfs`,
       {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml'
      },
      body: wfsTransaction
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, response: ${response}`);
        }
        // Parse the response as text since it's XML
        return response.text();
      })
      .then(xmlText => {
        // Parse the XML string into a JavaScript object
        return new window.DOMParser().parseFromString(xmlText, "text/xml");
      })
      .then(xmlDoc => {
        // Handle success with the parsed XML
        console.log("Feature updated successfully:", xmlDoc);

        // Store the current map center and zoom level
        const mapCenter = this.map.getCenter();
        const mapZoom = this.map.getZoom();
        localStorage.setItem('mapCenter', JSON.stringify(mapCenter));
        localStorage.setItem('mapZoom', mapZoom.toString());

        window.location.reload();
      })
      .catch(error => {
        console.error("Error in WFS-T transaction:", error.message);
      });

  }
  formatCoordinatesForGML(coordinates: number[][] | number[][][]): string {
    return coordinates.map(coord => `${coord[0]},${coord[1]}`).join(' ');
  }

  // Utility function to format coordinates for GML
  // Transform the coordinates from GeoJSON format to Leaflet LatLng format
  transformCoordinates(coordinates: number[][] | number[][][]): L.LatLng[] {
    if (Array.isArray(coordinates[0][0])) {
      return (coordinates as number[][][]).flat().map(coord => new L.LatLng(coord[1], coord[0])); // MultiLineString
    } else {
      return (coordinates as number[][]).map(coord => new L.LatLng(coord[1], coord[0])); // LineString
    }
  }

  // Utility function to format coordinates for GML
  // Transform the coordinates from GeoJSON format to Leaflet LatLng format

  // Function to fetch metadata layer data
  fetchMetadataLayer(): Promise<any> {
     // Backend API URL
    const metadataUrl = `${this.baseGisUrl}/api/metadata`; 
    return fetch(metadataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error('Error fetching metadata from backend:', error);
        return null;
      });
  }

  displayMatchedFeatures(matchedFeatures: any[]): void {
    const excludedProperties = ['guid', 'id', 'signpost_url', 'image_url', 'streetview_url', 'centroid'];
    const tableDiv = document.getElementById('feature-info-table');

    if (!tableDiv) {
      console.error('Table container not found.');
      return;
    }
    if (tableDiv.style.display === 'block') {
      tableDiv.style.display = 'block';
    }
    else {
      tableDiv.style.display = 'none';
    }


    // Clear any existing table content
    tableDiv.innerHTML = '';

    // Create a new table element
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse'; // Collapse borders to avoid double borders

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');



    // Extract all unique keys for table headers, excluding specific keys
    const allKeys = new Set<string>();
    matchedFeatures.forEach((feature: any) => {
      const properties = feature.properties;
      Object.keys(properties).forEach(key => {
        if (!excludedProperties.includes(key)) {
          allKeys.add(key);
        }
      });
    });

    allKeys.forEach(key => {
      const headerCell = document.createElement('th');
      headerCell.textContent = key.toUpperCase();
      headerCell.style.border = '1px solid #ddd'; // Border for header cells
      headerCell.style.backgroundColor = '#f4f4f4'; // Light grey background for headers
      headerCell.style.padding = '8px'; // Padding for header cells
      headerCell.style.textAlign = 'center'; // Align text to the left
      headerRow.appendChild(headerCell);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    matchedFeatures.forEach((feature: any) => {
      const properties = feature.properties;
      const row = document.createElement('tr');

      allKeys.forEach(key => {
        const cell = document.createElement('td');
        cell.textContent = properties[key] != null ? properties[key].toString().toUpperCase() : 'N/A'; // Handle null or undefined values
        cell.style.border = '1px solid #ddd'; // Border for table cells
        cell.style.padding = '8px'; // Padding for table cells
        cell.style.textAlign = 'center'; // Align text to the left
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Append the created table to the container div
    tableDiv.appendChild(table);
  }
  searchFeatureById(featureId: string): void {
    const layers = 'ne:sanfrancisco_plot_data'; // Add your layers here
    // Construct URL for feature search API (update to your actual API)
    const url = `${this.baseGisUrl}/api/search?feature_id=${featureId}&layers=${layers}`;
    console.log(url);
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.clearFeatureLayer();
        this.displayFeatureInfo(data);
        if (!data || !data.features || data.features.length === 0) {
          console.error('No features found in the response.');
          return;
        }
        // Fetch metadata layer to compare guid
        this.fetchMetadataLayer().then(metadata => {
          const matchedFeatures = metadata.features.filter((feature: any) => {
            const featureId = feature.properties.guid;
            return data.features.some((metaFeature: any) => metaFeature.properties.guid === featureId);
          });

          if (matchedFeatures.length > 0) {
            this.displayMatchedFeatures(matchedFeatures);
            console.log(matchedFeatures);
          } else {
            console.error('No matched features found.');
          }
        });

        let allCoordinates: L.LatLng[] = [];

        data.features.forEach((feature: { geometry: any; }) => {
          const featureGeometry = feature.geometry;

          // Check for MultiLineString geometry
          if (featureGeometry.type === 'MultiLineString' || featureGeometry.type === 'LineString') {
            const transformedCoordinates = this.transformCoordinates(featureGeometry.coordinates);
            console.log(transformedCoordinates);
            if (transformedCoordinates) {
              const polyline = L.polyline(transformedCoordinates, {
                color: '#1c9be6',
                weight: 6,
                opacity: 0.8
              }).addTo(this.featureLayer);

              // Fit the map to the polyline's bounds
              this.map.fitBounds(polyline.getBounds(), { maxZoom: 18 });

              // Collect coordinates for later use
              allCoordinates.push(...transformedCoordinates);
            }
          }
        });

        // If there are coordinates to zoom into
        if (allCoordinates.length > 0) {
          const targetLatLng = allCoordinates[0]; // Zoom into the first coordinate
          this.map.setView(targetLatLng, 18); // Set the zoom level as needed
        }
      })
      .catch(error => console.error('Error fetching feature info:', error));
  }

  fetchPlaceNames(): void {
    const layers = 'ne:sanfrancisco_plot_data'; // Specify your WMS layer here
    // const url = `https://pmb.quantasip.com/api/place-names?layers=${layers}`;
    const url = `${this.baseGisUrl}/api/place-names?layers=${layers}`;
    console.log(url);

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(placeNames => {
        this.populatePlaceNameOptions(placeNames);
      })
      .catch(error => console.error('Error fetching place names:', error));
  }

  populatePlaceNameOptions(placeNames: string[]): void {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const datalist = document.getElementById('placeNames') as HTMLDataListElement;

    if (datalist) {
      datalist.innerHTML = ''; // Clear existing options

      placeNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
      });
    }
  }

  displayFeatureInfo(data: any): void {
    const sidebarContent = document.getElementById('sidebar-content');
    const sidebarImage = document.getElementById('carousel-image') as HTMLImageElement;
    const leftArrow = document.getElementById('left-arrow') as HTMLElement;
    const rightArrow = document.getElementById('right-arrow') as HTMLElement;

    let currentImageIndex = 0; // To track the current image
    let imagePaths: string[] = []; // To hold the array of image paths

    if (!sidebarContent) {
      console.error('Element with id "sidebar-content" not found in the DOM.');
      return;
    }

    // Clear the sidebar content first
    sidebarContent.innerHTML = '';

    if (data && Array.isArray(data.features) && data.features.length > 0) {
      // Set the sidebar images if available
      const firstFeature = data.features[0];
      const imagePath = firstFeature.properties.imgpath;

      // Show or hide the image(s) based on feature information
      if (imagePath) {
        imagePaths = imagePath.split(',').map((path: string) => path.trim()); // Split paths by commas and trim extra spaces
        currentImageIndex = 0; // Reset the index when loading new images

        updateImage(); // Display the first image

        leftArrow.style.display = 'block'; // Show the arrows
        rightArrow.style.display = 'block';

      } else {
        sidebarImage.style.display = 'none'; // Hide the carousel image if no images are available
        leftArrow.style.display = 'none'; // Hide arrows if no images are available
        rightArrow.style.display = 'none';
      }

      // Function to update the currently displayed image
      function updateImage() {
        if (imagePaths.length > 0) {
          sidebarImage.src = imagePaths[currentImageIndex]; // Set image source to the current path
          sidebarImage.style.display = 'block';
          sidebarImage.style.width = '270px';
          sidebarImage.style.height = '150px';
          sidebarImage.style.objectFit = 'cover';
          sidebarImage.style.marginLeft = '15px';
        } else {
          sidebarImage.style.display = 'none'; // Hide if there are no images
        }
      }

      // Event handlers for arrows
      rightArrow.onclick = function () {
        currentImageIndex = (currentImageIndex + 1) % imagePaths.length; // Go to the next image, loop back to the first if at the end
        updateImage();
      };

      leftArrow.onclick = function () {
        currentImageIndex = (currentImageIndex - 1 + imagePaths.length) % imagePaths.length; // Go to the previous image, loop back to the last if at the beginning
        updateImage();
      };

      // Create feature item elements
      data.features.forEach((feature: any) => {
        const featureElement = document.createElement('div');
        featureElement.className = 'feature-item';

        // Add title
        const titleElement = document.createElement('div');
        titleElement.className = 'title';
        featureElement.appendChild(titleElement);

        // Add details
        const detailsElement = document.createElement('div');
        detailsElement.className = 'details';
        detailsElement.innerHTML = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    .feature-button {
      font-size: 0.7em;
      font-weight: bold;
      background-color: #f1f1f1;
      border: none;
      padding: 10px;
      cursor: pointer;
      width: 100%;
      text-align: center;
      position: relative;
      transition: background-color 0.3s ease, height 0.3s ease;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .feature-button .icon {
      margin-right: 8px; /* Space between icon and text */
    }

    .feature-button:hover {
      background-color: #ddd;
    }

    .feature-button .text {
      display: block;
    }

    .feature-button .tooltip {
      display: none;
    }

    .feature-button:hover .text {
      display: none;
    }

    .feature-button:hover .tooltip {
      display: block;
      position: relative;
      color: #000;
      font-style: italic;
      font-size: 1em;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      align-items: center;
    }

    .button-container .feature-button {
      margin-bottom: 10px;
    }
  </style>
  <div style="text-align: justify;">
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-home icon"></i>
        <span class="text">ADDRESS</span>
        <span class="tooltip">${feature.properties.address ? feature.properties.address.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-building icon"></i>
        <span class="text">CAPACITY</span>
        <span class="tooltip">${feature.properties.capacity ? feature.properties.capacity : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-check-circle icon"></i>
        <span class="text">AVAILABLE</span>
        <span class="tooltip">${feature.properties.available ? feature.properties.available : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-clock icon"></i>
        <span class="text">TIMING</span>
        <span class="tooltip">${feature.properties.timing ? feature.properties.timing.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-gavel icon"></i>
        <span class="text">REGULATION</span>
        <span class="tooltip">${feature.properties.regulation ? feature.properties.regulation.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-broom icon"></i>
        <span class="text">CLEANING</span>
        <span class="tooltip">${feature.properties.cleaning ? feature.properties.cleaning.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-ban icon"></i>
        <span class="text">SUSPENSION</span>
        <span class="tooltip">${feature.properties.suspension ? feature.properties.suspension.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-level-up-alt icon"></i>
        <span class="text">LEVEL</span>
        <span class="tooltip">${feature.properties.level ? feature.properties.level.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-comment-dots icon"></i>
        <span class="text">REMARKS</span>
        <span class="tooltip">${feature.properties.remark ? feature.properties.remark.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
    <div class="button-container">
      <button class="feature-button">
        <i class="fas fa-map-pin icon"></i>
        <span class="text">ZIPCODE</span>
        <span class="tooltip">${feature.properties.zipcode ? feature.properties.zipcode.toUpperCase() : 'N/A'}</span>
      </button>
    </div>
  </div>
      `;
        featureElement.appendChild(detailsElement);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-around';
        buttonContainer.style.marginTop = '10px';
        const editButton = document.createElement('button');
        editButton.innerHTML = ` <i class="fas fa-edit"></i>`;
        editButton.title = 'Edit Data';
        editButton.onclick = () => {
          const guid = feature.properties.guid;
          const geometry = JSON.stringify(feature.geometry);
          const properties = JSON.stringify(feature.properties);
          const feature_id = feature.id;

          // console.log("Sending GUID:", guid);
          // console.log("Sending Geometry:", geometry);
          // console.log("Sending Properties:", properties);
          // console.log(feature_id);

          // Navigate to the /update component using the named 'popup' outlet
          this.router.navigate([{
            outlets: {
              popup: ['update', {
                guid: encodeURIComponent(guid),
                geometry: encodeURIComponent(geometry),
                properties: encodeURIComponent(properties),
                feature_id: encodeURIComponent(feature_id)
              }]
            }
          }]);
          this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && event.url.includes('update') === false) {
                  const mapCenter = this.map.getCenter();
                  const mapZoom = this.map.getZoom();
                  localStorage.setItem('mapCenter', JSON.stringify(mapCenter));
                  localStorage.setItem('mapZoom', mapZoom.toString());
                  window.location.reload();
            }
        });
        };
        buttonContainer.appendChild(editButton);
        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        deleteButton.title = 'Delete Data';
        deleteButton.onclick = () => {
          if (feature.properties.guid) {
            const featureId = feature.properties.guid;
            deleteFeatureFromLayers(featureId);
          } else {
            alert('No feature selected');
          }
        };
        buttonContainer.appendChild(deleteButton);

        function deleteFeatureFromLayers(featureId: any) {
          deleteFeature(featureId, 'sanfrancisco_gis_data');
          deleteFeature(featureId, 'sanfrancisco_metadata');
          deleteFeature(featureId, 'sanfrancisco_plot_data');

        }
        const deleteFeature = (featureId: any, layerName: string) => {
          const deleteRequest = `
          <wfs:Transaction service="WFS" version="1.1.0"
              xmlns:wfs="http://www.opengis.net/wfs"
              xmlns:ogc="http://www.opengis.net/ogc"
              xmlns:gml="http://www.opengis.net/gml"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xmlns:ne="http://gs.quantasip.com"
              xsi:schemaLocation="http://www.opengis.net/wfs
                                  http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
            <wfs:Delete typeName="ne:${layerName}">
      <ogc:Filter>
        <ogc:PropertyIsEqualTo>
          <ogc:PropertyName>guid</ogc:PropertyName>
          <ogc:Literal>${featureId}</ogc:Literal>
        </ogc:PropertyIsEqualTo>
      </ogc:Filter>
    </wfs:Delete>
          </wfs:Transaction>
        `;
          fetch(`${this.baseGisUrl}/proxy/geoserver/ne/wfs`,
             {
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml',
            },
            body: deleteRequest
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.text();
            })
            .then(data => {
              console.log(`Delete Response from ${layerName}:`, data);
              const mapCenter = this.map.getCenter();
              const mapZoom = this.map.getZoom();
              localStorage.setItem('mapCenter', JSON.stringify(mapCenter));
              localStorage.setItem('mapZoom', mapZoom.toString());

              window.location.reload();
            })
            .catch(error => {
              console.error(`Error deleting feature from ${layerName}:`, error);
            });
        }
        const addButton = document.createElement('button');
        addButton.innerHTML = `<i class="fas fa-add"></i>`;
        addButton.title = 'Add Data';
        addButton.onclick = () => {
          // Change the mouse cursor to a + sign
          document.body.style.cursor = 'crosshair';
          const mapDiv = document.getElementById('map');
        
          if (mapDiv) {
            // Add event listener to change the cursor to crosshair when mouse enters the map
            mapDiv.addEventListener('mouseenter', () => {
              document.body.style.cursor = 'crosshair';
            });
        
            // Add event listener to reset the cursor when the mouse leaves the map
            mapDiv.addEventListener('mouseleave', () => {
              document.body.style.cursor = 'default';
            });
          }
        
          // Store the coordinates of the polyline
          let polylineCoordinates: [number, number][] = [];
          const polyline = L.polyline([], { color: '#ff6666', weight: 4 }).addTo(this.map);
          const markers: L.Marker[] = []; // Array to store markers
          let lastClickedLatLng: L.LatLng | null = null; // Variable to store the last clicked position
        
          // Function to add coordinates on mouse click
          const onMapClick = (event: L.LeafletMouseEvent) => {
            const latLng = event.latlng;
        
            // Check if clicked position is close to the last clicked position
            if (lastClickedLatLng && latLng.distanceTo(lastClickedLatLng) < 10) { // 10 meters threshold
              finishDrawing(latLng);
            } else {
              polylineCoordinates.push([latLng.lng, latLng.lat]); // Store coordinates
        
              // Create a square marker at the clicked location
              const marker = L.marker(latLng, {
                icon: L.divIcon({
                  className: 'square-marker',
                  html: '<div style="width: 10px; height: 10px; background-color: red;"></div>', // Square box
                }),
              }).addTo(this.map);

        
              markers.push(marker); // Store the marker
              polyline.addLatLng(latLng); // Add point to the polyline
        
              // Update lastClickedLatLng with the current latLng
              lastClickedLatLng = latLng;
            }
          };
        
          // Listen for map clicks
          this.map.on('click', onMapClick);
        
          // Function to finish drawing
          const finishDrawing = async (latLng: L.LatLng) => {
            // Remove the click event listener
            this.map.off('click', onMapClick);
            // Change the cursor back to default
            document.body.style.cursor = 'default';
            // Create updatedCoordinates in the desired format
            const updatedCoordinates = polylineCoordinates.map(([lng, lat]) => ({
              lat: lat,
              lng: lng,
            }));
            // Convert updatedCoordinates back to number[][] for validation
            const coordinatesForValidation = updatedCoordinates.map(({ lat, lng }) => [lng, lat]);
        
            // Validate the drawn geometry against existing features
            const isValid = await this.validateGeometry(coordinatesForValidation, 'new-feature'); // Pass a feature ID if available
        
            if (isValid) {
              // Navigate to the route with the geometry in query params
              this.router.navigate(
                [
                  {
                    outlets: {
                      popup: ['create']
                    }
                  }
                ],
                {
                  queryParams: { geometry: JSON.stringify(updatedCoordinates) }
                }
              );
              this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd && event.url.includes('create') === false) {
                    if (polylineCoordinates.length > 0) {
                      const mapCenter = this.map.getCenter();
              const mapZoom = this.map.getZoom();
              localStorage.setItem('mapCenter', JSON.stringify(mapCenter));
              localStorage.setItem('mapZoom', mapZoom.toString());

              window.location.reload();
                    }
                }
            });
              
            } else {
              alert('Invalid geometry: The drawn line intersects with existing geometries.');
              // Optionally, remove the drawn polyline from the map
              this.map.removeLayer(polyline);
              markers.forEach(marker => this.map.removeLayer(marker)); // Remove markers
            }
          };
          // Add an event listener to cancel adding markers on double-click elsewhere
          this.map.on('dblclick', () => {
            // Remove the click event listener
            this.map.off('click', onMapClick);
            // Remove markers
            markers.forEach(marker => this.map.removeLayer(marker));
            markers.length = 0; // Clear markers array
            polylineCoordinates = []; // Clear polyline coordinates
            polyline.remove(); // Remove the polyline from the map
            document.body.style.cursor = 'default'; // Change cursor back to default
            lastClickedLatLng = null; // Reset last clicked position
          });
        };
        
        // Append button to your desired container in the DOM
        buttonContainer.appendChild(addButton);
        const eyeButton = document.createElement('button');
        eyeButton.innerHTML = `<i class="fas fa-eye"></i>`;
        eyeButton.title = 'View Meta Data';
        eyeButton.onclick = () => {
          const tableDiv = document.getElementById('feature-info-table');
          if (tableDiv) {
            if (tableDiv.style.display === 'none') {
              if (toggleButton && tableDiv) {
                toggleButton.style.marginBottom = '150px';
              }
              if (bb && tableDiv) {
                bb.style.marginBottom = '130px';
              }
              tableDiv.style.display = 'block';  // Show table when clicked
            }
            else {
              if (toggleButton && bb) {
                toggleButton.style.marginBottom = '5px';
                bb.style.marginBottom = '5px';
              }
              tableDiv.style.display = 'none';   // Hide table when clicked again
            }
          }
        };
        buttonContainer.appendChild(eyeButton);
        const bulkUploadButton = document.createElement('button');
bulkUploadButton.innerHTML = `<i class="fas fa-upload"></i>`;
bulkUploadButton.title = 'Bulk Upload';
bulkUploadButton.onclick = () => {
  // Create a dialog with two options: Bulk Upload or Bulk Feedback
  const dialogContainer = document.getElementById("dialog-container") as HTMLDivElement | null;

  // Option to navigate to Bulk Upload
  if(dialogContainer){

    dialogContainer.style.display='flex';
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✖';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';

    // Close dialog when close button is clicked
    closeButton.onclick = () => {
      dialogContainer!.style.display = 'none';
    };

    dialogContainer.appendChild(closeButton);

  document.getElementById('bulk-upload-option')?.addEventListener('click', () => {

    navigateToBulkUpload();
    dialogContainer.style.display='none';
    
  });

  // Option to navigate to Bulk Feedback
  document.getElementById('bulk-feedback-option')?.addEventListener('click', () => {

    navigateToBulkFeedback();
    dialogContainer.style.display='none';
  });
}
};

// Function to navigate to Bulk Upload
const navigateToBulkUpload = () => {
  this.router.navigate([{
    outlets: {
      popup: ['bulk-upload']
    }
  }]);
};

// Function to navigate to Bulk Feedback
const navigateToBulkFeedback = () => {
  this.router.navigate([{
    outlets: {
      popup: ['bulk-feedback']
    }
  }]);
};
// Append the bulk upload button to the container
buttonContainer.appendChild(bulkUploadButton);
        // Append button container to the feature element
        featureElement.appendChild(buttonContainer);

        // Append the feature item to the sidebar content
        sidebarContent.appendChild(featureElement);
      });
      // Show the sidebar if it was not already open
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('toggleButton');
      const bb = document.getElementById('backgroundButtons');
      if (sidebar && toggleButton) {
        this.openSidebar();
        sidebar.style.display = 'block'; // Show sidebar if map was clicked
        toggleButton.style.marginLeft = '300px';
      }
      if (bb) {
        bb.style.marginLeft = '300px';
      }

    } else {
      // Hide the sidebar image and update the sidebar content based on whether the map was clicked
      sidebarImage.style.display = 'none'; // Hide image if no features are available
      if (this.mapClicked) {
        sidebarContent.innerHTML = '<p>No information available.</p>';
        const sidebar = document.getElementById('sidebar');
        const openButton = document.getElementById('openbtn');
        if (sidebar) {
          sidebar.style.display = 'block'; // Show sidebar if map was clicked
        }
      } else {
        sidebarContent.innerHTML = '<p>No Data.</p>';
        const sidebar = document.getElementById('sidebar');
        const toggleButton = document.getElementById('toggleButton');
        const bb = document.getElementById('backgroundButtons');
        const tableDiv = document.getElementById('feature-info-table');

        if (sidebar && toggleButton) {
          sidebar.classList.remove('open');
          toggleButton.style.marginLeft = '5px';
          toggleButton.style.marginBottom = '5px';
        }
        if (bb && toggleButton) {
          bb.style.marginLeft = '5px';
          bb.style.display = 'none';
          toggleButton.style.display = 'block';
          bb.style.marginBottom = '5px';
        }
        if (tableDiv) {
          tableDiv.style.display = 'none';
        }
      }
    }
  }
  onMapClick(): void {
    this.mapClicked = true;
    // Optionally you might want to clear the previous feature data or set it to some default state
    this.displayFeatureInfo({ features: [] });
  }
  onFeatureClick(data: any): void {
    this.mapClicked = false;
    this.displayFeatureInfo(data);
  }
  openSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const openbtn = document.getElementById('openbtn');
    if (sidebar) {
      sidebar.classList.add('open'); // Adjust width as needed
    }
    if (openbtn) {
      openbtn.style.display = 'none'; // Hide the open button
    }
  }
  closeSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const openbtn = document.getElementById('openbtn');
    const toggleButton = document.getElementById('toggleButton');
    const bb = document.getElementById('backgroundButtons');
    if (sidebar && toggleButton) {
      sidebar.classList.remove('open'); 
      toggleButton.style.marginLeft = '5px';
    }
    if (openbtn) {
      openbtn.style.display = 'block'; // Hide the open button
    }
    if (bb) {
      bb.style.marginLeft = '5px';
    }
  }
  // from editor to login page
  goBack() {
      // Method for back button
    if (this.from === 'admin') {
      this.router.navigate(['/way/admin']);
    } else if (this.from === 'user') {
      this.router.navigate(['/way/user']);
    } else {
      // Fallback to location back if the state is undefined
      // this.location.back();
      this.router.navigate(['/way']);
    }
  }
}
