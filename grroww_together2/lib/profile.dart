import 'package:flutter/material.dart';

class LandOwnerProfilePage extends StatelessWidget {
  const LandOwnerProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F8EC), // Light greenish background
      appBar: AppBar(
        backgroundColor: const Color(0xFF556B2F), // Olive green
        elevation: 0,
        title: const Text(
          'Landowner Profile',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            _buildProfileHeader(),
            const SizedBox(height: 30),
            _buildProfileOption(
              icon: Icons.person_outline,
              title: "My Account",
              onTap: () {
                print("Navigating to My Account...");
              },
            ),
            _buildProfileOption(
              icon: Icons.home_work_outlined,
              title: "My Properties",
              onTap: () {
                print("Navigating to My Properties...");
              },
            ),
            _buildProfileOption(
              icon: Icons.payment_outlined,
              title: "Payment History",
              onTap: () {
                print("Navigating to Payment History...");
              },
            ),
            _buildProfileOption(
              icon: Icons.support_agent_outlined,
              title: "Support Center",
              onTap: () {
                print("Navigating to Support Center...");
              },
            ),
            _buildProfileOption(
              icon: Icons.logout,
              title: "Log Out",
              onTap: () {
                print("Logging Out...");
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Center(
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 50,
                backgroundImage: const AssetImage(
                    'assets/profile.jpg'), // Replace with your asset path
                backgroundColor: Colors.grey.shade300,
              ),
              const CircleAvatar(
                radius: 15,
                backgroundColor: Colors.white,
                child: Icon(
                  Icons.camera_alt,
                  size: 18,
                  color: Color(0xFF556B2F), // Olive green
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            "Amani Odeh", // Replace with dynamic name
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const Text(
            "amniodeh225@gmail.com", // Replace with dynamic email
            style: TextStyle(
              fontSize: 14,
              color: Colors.black54,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          elevation: 3,
          child: ListTile(
            leading: Icon(icon, color: const Color(0xFF556B2F), size: 28),
            title: Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            trailing: const Icon(Icons.arrow_forward_ios, color: Colors.grey),
          ),
        ),
      ),
    );
  }
}
