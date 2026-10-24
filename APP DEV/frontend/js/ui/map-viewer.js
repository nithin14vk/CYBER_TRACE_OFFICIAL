/**
 * CyberTrace: Digital Exposure Lab - Map Viewer Integration
 * Renders Leaflet OpenStreetMap with approximate IP node and optional precise GPS pin.
 * Includes interactive SVG fallback for offline/air-gapped labs.
 */
class MapViewer {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.ipMarker = null;
    this.ipCircle = null;
    this.gpsMarker = null;
    this.gpsCircle = null;
    this.lastIpLat = 37.7749;
    this.lastIpLon = -122.4194;
    this.lastCity = 'Regional Gateway';
    this.lastIsp = 'ISP Routing Node';
  }

  /**
   * Initializes the map with approximate IP coordinates.
   */
  initMap(lat, lon, city, region, country, isp) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const defaultLat = typeof lat === 'number' && !isNaN(lat) ? lat : 37.7749;
    const defaultLon = typeof lon === 'number' && !isNaN(lon) ? lon : -122.4194;

    this.lastIpLat = defaultLat;
    this.lastIpLon = defaultLon;
    this.lastCity = city || 'Regional Gateway';
    this.lastIsp = isp || 'ISP Routing Node';

    const isLeafletAvailable = typeof window.L !== 'undefined';
    if (!isLeafletAvailable) {
      this.renderSvgFallback(defaultLat, defaultLon, city, isp, null);
      return;
    }

    try {
      // Clear existing instance if any
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map(this.containerId, {
        center: [defaultLat, defaultLon],
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Dark OpenStreetMap Tiles via standard CartoDB DarkMatter or OSM
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | CyberTrace Lab',
        maxZoom: 18
      }).addTo(this.map);

      // Custom Cyan Pulse Icon for Approximate IP Hub
      const ipIcon = L.divIcon({
        className: 'custom-map-pin ip-pin',
        html: `<div style="
          width: 16px; 
          height: 16px; 
          background: #00f0ff; 
          border: 2px solid #fff; 
          border-radius: 50%; 
          box-shadow: 0 0 12px #00f0ff;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      this.ipMarker = L.marker([defaultLat, defaultLon], { icon: ipIcon }).addTo(this.map);
      this.ipMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #000;">
          <strong>[APPROXIMATE ISP ROUTING NODE]</strong><br/>
          <strong>Location:</strong> ${city}, ${region}, ${country}<br/>
          <strong>Carrier / ISP:</strong> ${isp}<br/>
          <em>Accuracy: Metropolitan region (10 - 50 km)</em>
        </div>
      `).openPopup();

      // Approximate Area Circle (20 km radius)
      this.ipCircle = L.circle([defaultLat, defaultLon], {
        color: '#00f0ff',
        fillColor: '#00f0ff',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6',
        radius: 20000 // 20 km in meters
      }).addTo(this.map);

    } catch (err) {
      console.warn('Leaflet initialization failed, falling back to SVG tactical radar:', err);
      this.renderSvgFallback(defaultLat, defaultLon, city, isp, null);
    }
  }

  /**
   * Plots precise GPS coordinates onto the map and zooms to show both nodes.
   */
  plotPreciseLocation(lat, lon, accuracyMeters) {
    const isLeafletAvailable = typeof window.L !== 'undefined';
    if (!this.map || !isLeafletAvailable) {
      const container = document.getElementById(this.containerId);
      if (container) {
        this.renderSvgFallback(this.lastIpLat, this.lastIpLon, this.lastCity, this.lastIsp, { lat, lon, accuracy: accuracyMeters });
      }
      return;
    }

    try {
      // Remove prior GPS markers if re-granted
      if (this.gpsMarker) this.map.removeLayer(this.gpsMarker);
      if (this.gpsCircle) this.map.removeLayer(this.gpsCircle);

      // Amber Icon for Precise Physical Position
      const gpsIcon = L.divIcon({
        className: 'custom-map-pin gps-pin',
        html: `<div style="
          width: 18px; 
          height: 18px; 
          background: #ffb703; 
          border: 2px solid #fff; 
          border-radius: 50%; 
          box-shadow: 0 0 15px #ffb703;
          animation: pulse-dot 1.5s infinite;
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      this.gpsMarker = L.marker([lat, lon], { icon: gpsIcon }).addTo(this.map);
      this.gpsMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #000;">
          <strong>[PRECISE PHYSICAL GPS FIX]</strong><br/>
          <strong>Latitude:</strong> ${lat.toFixed(6)}<br/>
          <strong>Longitude:</strong> ${lon.toFixed(6)}<br/>
          <strong>Reported Accuracy:</strong> &plusmn;${Math.round(accuracyMeters)} meters<br/>
          <span style="color: #b91c1c; font-weight: bold;">Elevated Exposure: Disclosed via user permission</span>
        </div>
      `).openPopup();

      // Exact accuracy circle
      this.gpsCircle = L.circle([lat, lon], {
        color: '#ffb703',
        fillColor: '#ffb703',
        fillOpacity: 0.25,
        weight: 2,
        radius: Math.max(accuracyMeters, 25)
      }).addTo(this.map);

      // Fit bounds to encompass both IP routing hub and GPS point
      if (this.ipMarker) {
        const group = new L.featureGroup([this.ipMarker, this.gpsMarker, this.gpsCircle]);
        this.map.fitBounds(group.getBounds().pad(0.2));
      } else {
        this.map.setView([lat, lon], 15);
      }

    } catch (err) {
      console.error('Error plotting precise location:', err);
    }
  }

  /**
   * Resilient SVG radar map for offline or disconnected environments.
   */
  renderSvgFallback(ipLat, ipLon, city, isp, preciseGps) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    let gpsMarkup = '';
    if (preciseGps) {
      gpsMarkup = `
        <circle cx="280" cy="180" r="16" fill="rgba(255,183,3,0.25)" stroke="#ffb703" stroke-width="1.5" />
        <circle cx="280" cy="180" r="5" fill="#ffb703" />
        <text x="295" y="185" fill="#ffb703" font-family="monospace" font-size="11">Precise GPS: ${preciseGps.lat.toFixed(4)}, ${preciseGps.lon.toFixed(4)} (&plusmn;${Math.round(preciseGps.accuracy)}m)</text>
      `;
    }

    container.innerHTML = `
      <div style="width: 100%; height: 100%; position: relative; background: #080d1a; display: flex; align-items: center; justify-content: center;">
        <svg width="100%" height="100%" viewBox="0 0 600 340" style="background: #090e1a;">
          <defs>
            <pattern id="radarGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 240, 255, 0.08)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="600" height="340" fill="url(#radarGrid)" />
          
          <!-- Concentric Tactical Radar Rings -->
          <circle cx="300" cy="170" r="130" fill="none" stroke="rgba(0, 240, 255, 0.15)" stroke-width="1" stroke-dasharray="4,4" />
          <circle cx="300" cy="170" r="85" fill="none" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
          <circle cx="300" cy="170" r="40" fill="none" stroke="rgba(0, 240, 255, 0.25)" stroke-width="1" />
          <line x1="170" y1="170" x2="430" y2="170" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
          <line x1="300" y1="40" x2="300" y2="300" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />

          <!-- Approximate IP Node -->
          <circle cx="210" cy="140" r="50" fill="rgba(0, 240, 255, 0.12)" stroke="#00f0ff" stroke-width="1" stroke-dasharray="3,3" />
          <circle cx="210" cy="140" r="5" fill="#00f0ff" />
          <text x="70" y="115" fill="#00f0ff" font-family="monospace" font-size="11">Approximate IP Routing Hub (~25km)</text>
          <text x="70" y="132" fill="#94a3b8" font-family="monospace" font-size="10">${city || 'Metro Subnet'} (${ipLat.toFixed(2)}, ${ipLon.toFixed(2)})</text>

          ${gpsMarkup}

          <text x="20" y="320" fill="#64748b" font-family="monospace" font-size="10">TACTICAL GEOLOCATION RADAR // OFFLINE LABORATORY FALLBACK</text>
        </svg>
      </div>
    `;
  }
}

window.MapViewer = MapViewer;
