// ignore_for_file: non_constant_identifier_names

import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart'; // مكتبة السلايدر
import 'requestguarantee.dart';
import 'addlandforguarantee.dart';
import 'updatelandforgurantee.dart';
import 'searchforgurantee.dart';

class GuaranteePage extends StatefulWidget {
  final String username; // اسم المستخدم

  const GuaranteePage({super.key, required this.username});

  @override
  _GuaranteePageState createState() => _GuaranteePageState();
}

class _GuaranteePageState extends State<GuaranteePage> {
  List<Map<String, dynamic>> lands = [
    {
      "area": 0.5,
      "image": "image/land1.jpg",
      "governorate": "Governorate A",
      "town": "Town A",
      "street": "Main Street",
      "location": null, // لا توجد إحداثيات
    },
    {
      "area": 0.3,
      "image": "image/land2.jpg",
      "governorate": "Governorate B",
      "town": "Town B",
      "street": "Secondary Street",
      "location": null, // لا توجد إحداثيات
    },
  ];

  int currentIndex = 0; // الفهرس الحالي للأرض المختارة

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Guarantee Page",
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("image/gurantee.png"), // الخلفية
            fit: BoxFit.cover,
          ),
        ),
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              // عبارة ترحيبية
              Card(
                color: Colors.white.withOpacity(0.9),
                margin: const EdgeInsets.symmetric(vertical: 10),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    "Welcome to ${widget.username}'s Lands! Manage your lands efficiently, search for guarantors, and create new opportunities.",
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      color: Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // عرض عدد الأراضي
              Text(
                "Total Lands: ${lands.length}",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              // السلايدر
              if (lands.isNotEmpty)
                SizedBox(
                  height: 300,
                  child: CarouselSlider(
                    options: CarouselOptions(
                      enlargeCenterPage: true,
                      autoPlay: false,
                      viewportFraction: 0.85,
                      onPageChanged: (index, reason) {
                        setState(() {
                          currentIndex = index; // تحديث الفهرس الحالي
                        });
                      },
                    ),
                    items: lands.map((land) {
                      return Builder(
                        builder: (BuildContext context) {
                          return Card(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                            child: Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(15),
                                  child: Image.asset(
                                    land['image'] ?? 'image/defaultland.png',
                                    width: double.infinity,
                                    height: double.infinity,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(15),
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.black.withOpacity(0.5),
                                        Colors.transparent,
                                      ],
                                      begin: Alignment.bottomCenter,
                                      end: Alignment.topCenter,
                                    ),
                                  ),
                                ),
                                Align(
                                  alignment: Alignment.bottomLeft,
                                  child: Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          "${widget.username}'s Lands",
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        Text(
                                          "Area: ${land['area']} km²",
                                          style: const TextStyle(
                                            color: Colors.white70,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    }).toList(),
                  ),
                ),
              if (lands.isEmpty)
                const Center(
                  child: Text(
                    "No lands available.",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              // أزرار التحكم
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(
                    child: _buildActionButton(
                      context,
                      title: "Add Land",
                      icon: Icons.add_circle,
                      color: const Color(0xFF556B2F),
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AddLandForGuarantee(
                              onLandAdded: (Map<String, dynamic> newLand) {
                                setState(() {
                                  newLand['image'] ??= 'image/defaultland.png';
                                  newLand['governorate'] ??= "Not specified";
                                  newLand['town'] ??= "Not specified";
                                  newLand['street'] ??= "Not specified";
                                  lands.add(newLand);
                                });
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionButton(
                      context,
                      title: "Update Land",
                      icon: Icons.edit,
                      color: const Color(0xFF556B2F),
                      onPressed: () async {
                        if (lands.isNotEmpty) {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => UpdateLandPage(
                                initialLandData: lands[currentIndex],
                                onLandUpdated: (updatedLand) {
                                  setState(() {
                                    updatedLand['image'] ??=
                                        'image/defaultland.png';
                                    updatedLand['governorate'] ??=
                                        lands[currentIndex]['governorate'];
                                    updatedLand['town'] ??=
                                        lands[currentIndex]['town'];
                                    updatedLand['street'] ??=
                                        lands[currentIndex]['street'];
                                    lands[currentIndex] = updatedLand;
                                  });
                                },
                                lands: lands,
                              ),
                            ),
                          );
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionButton(
                      context,
                      title: "Delete Land",
                      icon: Icons.delete,
                      color: Colors.red,
                      onPressed: () {
                        if (lands.isNotEmpty) {
                          setState(() {
                            lands.removeAt(currentIndex);
                            if (currentIndex >= lands.length &&
                                lands.isNotEmpty) {
                              currentIndex = lands.length - 1;
                            }
                          });
                        }
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8), // مسافة بين الصفوف
              // أزرار جديدة
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Expanded(
                    child: _buildActionButton(
                      context,
                      title: "Search for Guarantee",
                      icon: Icons.search,
                      color: const Color(0xFF556B2F),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                SearchForGuarantorPage(lands: lands),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildActionButton(
                      context,
                      title: "Request Guarantee",
                      icon: Icons.request_page,
                      color: const Color(0xFF556B2F),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => RequestGuaranteePage(
                              lands: lands,
                              onPostAnnouncement: (announcement) {
                                setState(() {
                                  lands.add({
                                    ...announcement,
                                    'image': 'image/defaultland.png',
                                  });
                                });
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        "Announcement posted successfully!"),
                                  ),
                                );
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 18, color: Colors.white),
      label: Text(
        title,
        style: const TextStyle(fontSize: 14, color: Colors.white),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
