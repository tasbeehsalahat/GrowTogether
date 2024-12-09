import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

class SearchForWorkerPage extends StatefulWidget {
  final List<Map<String, dynamic>> lands;

  const SearchForWorkerPage({super.key, required this.lands});

  @override
  _SearchForWorkerPageState createState() => _SearchForWorkerPageState();
}

class _SearchForWorkerPageState extends State<SearchForWorkerPage> {
  Map<String, dynamic>? selectedLand;
  List<Map<String, dynamic>> workers = [
    {
      "name": "Worker A",
      "location": LatLng(32.2201, 35.2542),
      "governorate": "governorate a",
      "town": "town a",
      "street": "main street",
      "skills": ["Plowing", "Harvesting"],
      "distance": null,
    },
    {
      "name": "Worker B",
      "location": LatLng(32.2215, 35.2611),
      "governorate": "governorate b",
      "town": "town b",
      "street": "secondary street",
      "skills": ["Irrigation", "Planting"],
      "distance": null,
    },
    {
      "name": "Worker C",
      "location": LatLng(32.2252, 35.2508),
      "governorate": "governorate a",
      "town": "town a",
      "street": "main street",
      "skills": ["Harvesting", "Irrigation"],
      "distance": null,
    },
  ];

  List<Map<String, dynamic>> filteredWorkers = [];

  // Function to calculate distance between two coordinates
  double _calculateDistance(LatLng start, LatLng end) {
    final Distance distance = Distance();
    return distance.as(LengthUnit.Kilometer, start, end);
  }

  // Function to filter workers based on selected land
  void _filterWorkers() {
    if (selectedLand == null) return;

    setState(() {
      final location = selectedLand?['location'];
      if (location != null && location is LatLng) {
        // Filter based on coordinates
        final LatLng landLocation = location;
        for (var worker in workers) {
          if (worker['location'] != null && worker['location'] is LatLng) {
            worker['distance'] = _calculateDistance(
              landLocation,
              worker['location'],
            ).toStringAsFixed(2);
          } else {
            worker['distance'] = null;
          }
        }

        filteredWorkers = workers
            .where((worker) =>
                worker['distance'] != null &&
                double.parse(worker['distance']!) <= 10.0)
            .toList();
      } else {
        // Filter based on manual location
        final selectedGovernorate =
            selectedLand?['governorate']?.trim().toLowerCase() ?? "";
        final selectedTown = selectedLand?['town']?.trim().toLowerCase() ?? "";
        final selectedStreet =
            selectedLand?['street']?.trim().toLowerCase() ?? "";

        filteredWorkers = workers
            .where((worker) =>
                (worker['governorate']?.trim().toLowerCase() ==
                    selectedGovernorate) &&
                (worker['town']?.trim().toLowerCase() == selectedTown) &&
                (worker['street']?.trim().toLowerCase() == selectedStreet))
            .toList();
      }

      // Sort by distance if available
      filteredWorkers.sort((a, b) {
        if (a['distance'] != null && b['distance'] != null) {
          return double.parse(a['distance']!)
              .compareTo(double.parse(b['distance']!));
        }
        return 0;
      });
    });
  }

  // Function to send a request to a worker
  void _sendRequest(String workerName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Request sent to $workerName!")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Search for Worker",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Select a Land:",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            DropdownButton<Map<String, dynamic>>(
              isExpanded: true,
              value: selectedLand,
              hint: const Text("Choose a land"),
              items: widget.lands.map((land) {
                final location = land['location'];
                final locationText = location is LatLng
                    ? "Coordinates: ${location.latitude}, ${location.longitude}"
                    : [
                        if (land['governorate'] != null)
                          "Governorate: ${land['governorate']}",
                        if (land['town'] != null) "Town: ${land['town']}",
                        if (land['street'] != null) "Street: ${land['street']}",
                      ].join(', ');

                return DropdownMenuItem<Map<String, dynamic>>(
                  value: land,
                  child: Text("Area: ${land['area']} km², $locationText"),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  selectedLand = value;
                });
                _filterWorkers();
              },
            ),
            const SizedBox(height: 20),
            const Text(
              "Available Workers:",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: filteredWorkers.isEmpty
                  ? Center(
                      child: Text(
                        selectedLand == null
                            ? "Please select a land to find workers."
                            : selectedLand?['location'] != null
                                ? "No workers found within 10 km."
                                : "No workers found matching the selected location.",
                        style:
                            const TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      itemCount: filteredWorkers.length,
                      itemBuilder: (context, index) {
                        final worker = filteredWorkers[index];
                        return Card(
                          elevation: 4,
                          margin: const EdgeInsets.symmetric(vertical: 8.0),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFF556B2F),
                              child: Icon(Icons.person, color: Colors.white),
                            ),
                            title: Text(worker["name"]),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (worker['skills'] != null)
                                  Text(
                                      "Skills: ${worker['skills'].join(", ")}"),
                                if (worker['distance'] != null)
                                  Text("Distance: ${worker['distance']} km"),
                              ],
                            ),
                            trailing: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF556B2F),
                              ),
                              onPressed: () => _sendRequest(worker["name"]),
                              child: const Text(
                                "Send Request",
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
