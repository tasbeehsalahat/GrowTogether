import 'package:flutter/material.dart';

class RequestGuaranteePage extends StatefulWidget {
  final List<Map<String, dynamic>> lands;
  final Function(Map<String, dynamic>) onPostAnnouncement;

  const RequestGuaranteePage({
    super.key,
    required this.lands,
    required this.onPostAnnouncement,
  });

  @override
  _RequestGuaranteePageState createState() => _RequestGuaranteePageState();
}

class _RequestGuaranteePageState extends State<RequestGuaranteePage> {
  Map<String, dynamic>? selectedLand;

  // Function to post an announcement
  void _postAnnouncement() {
    if (selectedLand == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please select a land before posting an announcement."),
        ),
      );
      return;
    }

    // Create the announcement details
    final announcement = {
      "title": "Guarantee Request for ${selectedLand!['governorate'] ?? 'N/A'}",
      "area": selectedLand!['area'],
      "location":
          "${selectedLand!['town'] ?? 'N/A'}, ${selectedLand!['street'] ?? 'N/A'}",
      "guaranteeValue": selectedLand!['guaranteeValue'] ?? "N/A",
      "guaranteeDuration": selectedLand!['guaranteeDuration'] ?? "N/A",
    };

    // Pass the announcement to the parent widget
    widget.onPostAnnouncement(announcement);

    // Display success message
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Your announcement has been posted!"),
      ),
    );

    // Navigate back to the previous page
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Request Guarantee",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("image/dis.png"), // Background image
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.0),
            ),
            elevation: 10,
            margin:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 32.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Select a Land:",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 20),
                  DropdownButtonFormField<Map<String, dynamic>>(
                    isExpanded: true,
                    value: selectedLand,
                    hint: const Text("Choose a land"),
                    items: widget.lands.map((land) {
                      final details = [
                        "Area: ${land['area']} km²",
                        if (land['governorate'] != null)
                          "Governorate: ${land['governorate']}",
                        if (land['town'] != null) "Town: ${land['town']}",
                        if (land['street'] != null) "Street: ${land['street']}",
                      ].join(', ');

                      return DropdownMenuItem<Map<String, dynamic>>(
                        value: land,
                        child: Text(details),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        selectedLand = value;
                      });
                    },
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 20.0, horizontal: 20.0),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                        borderSide: const BorderSide(
                          color: Color(0xFF556B2F), // Green border color
                          width: 2.0,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                        borderSide: const BorderSide(
                          color: Color(0xFF556B2F), // Green border color
                          width: 2.0,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  if (selectedLand != null) ...[
                    const Divider(color: Colors.black54),
                    const Text(
                      "Land Details:",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text("Area: ${selectedLand!['area']} km²"),
                    if (selectedLand!['governorate'] != null)
                      Text("Governorate: ${selectedLand!['governorate']}"),
                    if (selectedLand!['town'] != null)
                      Text("Town: ${selectedLand!['town']}"),
                    if (selectedLand!['street'] != null)
                      Text("Street: ${selectedLand!['street']}"),
                    if (selectedLand!['workType'] != null)
                      Text("Work Type: ${selectedLand!['workType']}"),
                    if (selectedLand!['guaranteeValue'] != null)
                      Text(
                          "Guarantee Value: ${selectedLand!['guaranteeValue']}"),
                    if (selectedLand!['guaranteeDuration'] != null)
                      Text(
                          "Guarantee Duration: ${selectedLand!['guaranteeDuration']} months"),
                  ],
                  const SizedBox(height: 40),
                  Center(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF556B2F),
                        padding: const EdgeInsets.symmetric(
                          vertical: 15,
                          horizontal: 40,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                      onPressed: _postAnnouncement,
                      child: const Text(
                        "Post Announcement",
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
