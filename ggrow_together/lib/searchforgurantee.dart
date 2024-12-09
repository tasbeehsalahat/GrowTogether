import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

class SearchForGuarantorPage extends StatefulWidget {
  final List<Map<String, dynamic>> lands;

  const SearchForGuarantorPage({super.key, required this.lands});

  @override
  _SearchForGuarantorPageState createState() => _SearchForGuarantorPageState();
}

class _SearchForGuarantorPageState extends State<SearchForGuarantorPage> {
  Map<String, dynamic>? selectedLand;
  List<Map<String, dynamic>> guarantors = [
    {
      "name": "John Doe",
      "location": LatLng(32.2211, 35.2544),
      "governorate": "governorate a",
      "town": "town a",
      "street": "main street",
      "distance": null,
    },
    {
      "name": "Jane Smith",
      "location": LatLng(32.2200, 35.2600),
      "governorate": "governorate b",
      "town": "town b",
      "street": "secondary street",
      "distance": null,
    },
    {
      "name": "Ali Ahmad",
      "location": LatLng(32.2250, 35.2500),
      "governorate": "governorate a",
      "town": "town a",
      "street": "main street",
      "distance": null,
    },
  ];

  List<Map<String, dynamic>> filteredGuarantors = [];

  // Function to calculate distance between two coordinates
  double _calculateDistance(LatLng start, LatLng end) {
    final Distance distance = Distance();
    return distance.as(LengthUnit.Kilometer, start, end);
  }

  // Function to filter guarantors based on selected land
  void _filterGuarantors() {
    if (selectedLand == null) return;

    setState(() {
      final location = selectedLand?['location'];
      if (location != null && location is LatLng) {
        // Filter based on coordinates
        final LatLng landLocation = location;
        for (var guarantor in guarantors) {
          if (guarantor['location'] != null &&
              guarantor['location'] is LatLng) {
            guarantor['distance'] = _calculateDistance(
              landLocation,
              guarantor['location'],
            ).toStringAsFixed(2);
          } else {
            guarantor['distance'] = null;
          }
        }

        filteredGuarantors = guarantors
            .where((guarantor) =>
                guarantor['distance'] != null &&
                double.parse(guarantor['distance']!) <= 10.0)
            .toList();
      } else {
        // Filter based on manual location
        final selectedGovernorate =
            selectedLand?['governorate']?.trim().toLowerCase() ?? "";
        final selectedTown = selectedLand?['town']?.trim().toLowerCase() ?? "";
        final selectedStreet =
            selectedLand?['street']?.trim().toLowerCase() ?? "";

        filteredGuarantors = guarantors
            .where((guarantor) =>
                (guarantor['governorate']?.trim().toLowerCase() ==
                    selectedGovernorate) &&
                (guarantor['town']?.trim().toLowerCase() == selectedTown) &&
                (guarantor['street']?.trim().toLowerCase() == selectedStreet))
            .toList();
      }

      // Sort by distance if available
      filteredGuarantors.sort((a, b) {
        if (a['distance'] != null && b['distance'] != null) {
          return double.parse(a['distance']!)
              .compareTo(double.parse(b['distance']!));
        }
        return 0;
      });

      print("Filtered Guarantors: $filteredGuarantors");
    });
  }

  // Function to send a request to a guarantor
  void _sendRequest(String guarantorName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Request sent to $guarantorName!")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Search for Guarantor",
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
                        if (land['governorate'] == null &&
                            land['town'] == null &&
                            land['street'] == null)
                          "Location: Not specified"
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
                _filterGuarantors();
              },
            ),
            const SizedBox(height: 20),
            const Text(
              "Nearby Guarantors:",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: filteredGuarantors.isEmpty
                  ? Center(
                      child: Text(
                        selectedLand?['location'] != null
                            ? "No guarantors found within 10 km."
                            : "No guarantors found matching the selected location.",
                        style:
                            const TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      itemCount: filteredGuarantors.length,
                      itemBuilder: (context, index) {
                        final guarantor = filteredGuarantors[index];
                        return Card(
                          elevation: 4,
                          margin: const EdgeInsets.symmetric(vertical: 8.0),
                          child: ListTile(
                            leading: const CircleAvatar(
                              backgroundColor: Color(0xFF556B2F),
                              child: Icon(Icons.person, color: Colors.white),
                            ),
                            title: Text(guarantor["name"]),
                            subtitle: guarantor['distance'] != null
                                ? Text("Distance: ${guarantor['distance']} km")
                                : const Text("Manual location match"),
                            trailing: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF556B2F),
                              ),
                              onPressed: () => _sendRequest(guarantor["name"]),
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
