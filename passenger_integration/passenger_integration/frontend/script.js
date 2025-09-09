// // Initialize map
// const map = L.map('map').setView([23.0, 80.0], 5);
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// let routeLayers = {};
// let trainMarkers = {};

// // Draw all routes once
// function drawAllRoutes() {
//   fetch("http://127.0.0.1:8000/all_routes")
//     .then(res => res.json())
//     .then(data => {
//       Object.keys(data).forEach(trainNo => {
//         const coords = data[trainNo].map(st => [st.lat, st.lon]);

//         // Draw polyline
//         routeLayers[trainNo] = L.polyline(coords, { color: 'blue', weight: 3 }).addTo(map);

//         // Draw station markers
//         data[trainNo].forEach(st => {
//           L.circleMarker([st.lat, st.lon], { radius: 5, color: 'red' })
//             .addTo(map)
//             .bindPopup(`<b>${st.station}</b>`);
//         });
//       });

//       // Fit map to all routes
//       let allCoords = [];
//       Object.values(data).forEach(route => {
//         route.forEach(st => allCoords.push([st.lat, st.lon]));
//       });
//       map.fitBounds(allCoords);
//     });
// }

// // Update all train positions
// function updateAllPositions() {
//   fetch("http://127.0.0.1:8000/all_positions")
//     .then(res => res.json())
//     .then(data => {
//       let infoHTML = "";
//       Object.keys(data).forEach(trainNo => {
//         const pos = data[trainNo];

//         if (!trainMarkers[trainNo]) {
//           trainMarkers[trainNo] = L.marker([pos.lat, pos.lon], {
//             icon: L.icon({
//               iconUrl: "https://cdn-icons-png.flaticon.com/512/34/34627.png",
//               iconSize: [28, 28]
//             })
//           }).addTo(map);
//         } else {
//           trainMarkers[trainNo].setLatLng([pos.lat, pos.lon]);
//         }

//         infoHTML += `<b>Train ${trainNo}</b> → Next stop: ${pos.next_station}<br>`;
//       });

//       document.getElementById("infoBox").innerHTML = infoHTML;
//     });
// }

// drawAllRoutes();
// setInterval(updateAllPositions, 2000);
