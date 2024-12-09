import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart'; // مكتبة التخزين المحلي
import 'globalstate.dart';

class MyLandsPage extends StatefulWidget {
  const MyLandsPage({super.key});

  @override
  _MyLandsPageState createState() => _MyLandsPageState();
}

class _MyLandsPageState extends State<MyLandsPage> {
  @override
  void initState() {
    super.initState();
    _loadUser(); // تحميل المستخدم الحالي
    _loadLands(); // تحميل الأراضي المحفوظة عند فتح الصفحة
  }

  // تحميل الأراضي المحفوظة من التخزين المحلي
  Future<void> _loadLands() async {
    final prefs = await SharedPreferences.getInstance();
    final String? landsString = prefs.getString('lands');
    if (landsString != null) {
      try {
        setState(() {
          GlobalState.lands = List<Map<String, dynamic>>.from(
            json.decode(landsString),
          );
        });
        print("Lands loaded: ${GlobalState.lands}");
      } catch (e) {
        print("Error loading lands: $e");
      }
    }
  }

  // تحميل المستخدم الحالي من التخزين المحلي
  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final String? username = prefs.getString('currentUser');
    if (username != null) {
      setState(() {
        GlobalState.currentUser = username;
      });
      print("Current User: ${GlobalState.currentUser}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "All Lands",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('image/dis.png'), // خلفية الصفحة
            fit: BoxFit.cover,
          ),
        ),
        child: GlobalState.lands.isEmpty
            ? const Center(
                child: Text(
                  "No lands available.",
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.black87,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: GlobalState.lands.length,
                itemBuilder: (context, index) {
                  final land = GlobalState.lands[index];
                  return _buildLandCard(land);
                },
              ),
      ),
    );
  }

  Widget _buildLandCard(Map<String, dynamic> land) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 10),
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(15),
          gradient: const LinearGradient(
            colors: [Color(0xFF81C784), Color(0xFF556B2F)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              land['name'] ?? 'Unnamed Land',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Area: ${land['area'] ?? 'N/A'} km²",
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              "Type: ${land['type'] ?? 'General'}",
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
