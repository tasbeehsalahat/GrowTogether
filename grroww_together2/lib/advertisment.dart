import 'package:flutter/material.dart';

class AdvertisementsPage extends StatefulWidget {
  final List<Map<String, dynamic>> advertisements;

  const AdvertisementsPage({super.key, required this.advertisements});

  @override
  _AdvertisementsPageState createState() => _AdvertisementsPageState();
}

class _AdvertisementsPageState extends State<AdvertisementsPage> {
  late List<Map<String, dynamic>> _advertisements;

  @override
  void initState() {
    super.initState();
    _advertisements = List<Map<String, dynamic>>.from(widget.advertisements);
  }

  void _deleteAdvertisement(Map<String, dynamic> ad) {
    setState(() {
      _advertisements.remove(ad);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Deleted advertisement: ${ad['title']}")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Advertisements"),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: _advertisements.isNotEmpty
          ? ListView.builder(
              itemCount: _advertisements.length,
              itemBuilder: (context, index) {
                final ad = _advertisements[index];
                return Card(
                  margin: const EdgeInsets.all(10),
                  child: ListTile(
                    leading: Icon(
                      ad["type"] == "Guarantee" ? Icons.security : Icons.people,
                      color: const Color(0xFF81C784),
                    ),
                    title: Text(ad["title"]),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(ad["description"]),
                        Text("Area: ${ad["area"]} km²"),
                        Text("Location: ${ad["location"]}"),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _deleteAdvertisement(ad),
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              AdvertisementDetailsPage(advertisement: ad),
                        ),
                      );
                    },
                  ),
                );
              },
            )
          : const Center(
              child: Text(
                "No advertisements available.",
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
    );
  }
}

class AdvertisementDetailsPage extends StatelessWidget {
  final Map<String, dynamic> advertisement;

  const AdvertisementDetailsPage({super.key, required this.advertisement});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(advertisement["title"]),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Details:",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 10),
            Text("Title: ${advertisement["title"]}"),
            Text("Description: ${advertisement["description"]}"),
            Text("Area: ${advertisement["area"]} km²"),
            Text("Location: ${advertisement["location"]}"),
            Text("Type: ${advertisement["type"]}"),
            const SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                            "You have applied for '${advertisement["title"]}'"),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF556B2F),
                  ),
                  child: const Text(
                    "Apply",
                    style: TextStyle(
                      color: Colors.white,
                    ),
                  )),
            ),
          ],
        ),
      ),
    );
  }
}
