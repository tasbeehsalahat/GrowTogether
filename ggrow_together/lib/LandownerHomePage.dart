import 'package:flutter/material.dart';
import 'advertisment.dart';
import 'messageland.dart';
import 'normalland.dart';
import 'notification.dart';
import 'profile.dart';
import 'lands.dart';
import 'guarantee.dart';

class LandownerHomePage extends StatefulWidget {
  const LandownerHomePage({super.key});

  @override
  _LandownerHomePageState createState() => _LandownerHomePageState();
}

class _LandownerHomePageState extends State<LandownerHomePage> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const LandownerHomePageContent(),
    const Center(child: Text("Search Page Content")),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F8EC), // Soft greenish background
      appBar: AppBar(
        backgroundColor: const Color(0xFF556B2F), // Olive green
        title: const Text(
          'Landowner Portal',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 22,
            color: Colors.white,
          ),
        ),
        elevation: 5.0,
        shadowColor: Colors.black45,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Colors.white),
            onPressed: () {
              setState(() {
                _currentIndex = 2; // الانتقال إلى صفحة الإشعارات
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.message, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => MessagingPage(
                          contactName: '',
                        )),
              );
            },
          ),
        ],
      ),
      body: _currentIndex < _pages.length
          ? _pages[_currentIndex]
          : Container(), // إظهار الصفحة بناءً على الفهرس
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF556B2F), // Olive green
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.white70,
        currentIndex: _currentIndex,
        onTap: (index) {
          if (index == 3) {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const LandOwnerProfilePage()),
            );
          } else if (index == 2) {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const NotificationsPage(
                        notifications: [],
                      )),
            );
          } else {
            setState(() {
              _currentIndex = index; // تحديث الفهرس الحالي
            });
          }
        },

        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: "Home",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            label: "Search",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: "Notifications",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: "Profile",
          ),
        ],
      ),
    );
  }
}

class LandownerHomePageContent extends StatelessWidget {
  const LandownerHomePageContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const LandOwnerProfilePage(),
                ), // الانتقال إلى صفحة LandOwnerProfilePage
              );
            },
            child: _buildProfileSection(),
          ),
          const SizedBox(height: 20),
          _buildWelcomeSection(),
          const SizedBox(height: 20),
          _buildDashboardGrid(context), // تمرير السياق إلى الشبكة
          const SizedBox(height: 20),
          _buildAdvertisementsSection(context),
        ],
      ),
    );
  }

  Widget _buildProfileSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.grey.shade300,
            child: const Icon(
              Icons.person,
              size: 30,
              color: Colors.grey,
            ),
          ),
          const SizedBox(width: 15),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Amani Odeh",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF556B2F),
                ),
              ),
              SizedBox(height: 5),
              Text(
                "Landowner",
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.black54,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(15),
        ),
        elevation: 5,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            gradient: const LinearGradient(
              colors: [
                Color(0xFF81C784), // Lighter green
                Color(0xFF556B2F), // Olive green
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          padding: const EdgeInsets.all(20),
          child: const Column(
            children: [
              Text(
                "Welcome, Landowner!",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                ),
              ),
              SizedBox(height: 10),
              Text(
                "Manage your lands, workers, and advertisements with ease.",
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardGrid(BuildContext context) {
    final List<Map<String, dynamic>> dashboardItems = [
      {
        "title": "My Lands",
        "icon": Icons.terrain,
        "color": const Color(0xFF66BB6A),
        "onTap": () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  const MyLandsPage(), // الانتقال إلى صفحة MyLandsPage
            ),
          );
        },
      },
      {
        "title": "Request Workers",
        "icon": Icons.people_alt,
        "color": const Color(0xFF66BB6A),
        "onTap": () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const WorkRequestLandPage(
                lands: [],
                username: '',
              ), // طلب العمال
            ),
          );
        }
      },
      {
        "title": "Guarantee", // تعديل العنوان
        "icon": Icons.security, // أيقونة الغرنتي (يمكنك اختيار أيقونة أخرى)
        "color": const Color(0xFF81C784),
        "onTap": () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const GuaranteePage(
                username: '',
              ), // الانتقال إلى صفحة الغرنتي
            ),
          );
        },
      },
      {
        "title": "Reports",
        "icon": Icons.bar_chart,
        "color": const Color(0xFF66BB6A),
      },
      {
        "title": "Advertisements",
        "icon": Icons.campaign,
        "color": const Color(0xFF556B2F),
        "onTap": () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AdvertisementsPage(
                advertisements: [
                  {
                    "title": "Guarantee for Land A",
                    "description": "Looking for a guarantee for Land A.",
                    "area": 0.5,
                    "location": "Governorate A, Town A, Main Street",
                    "type": "Guarantee",
                  },
                  {
                    "title": "Worker Needed for Land B",
                    "description": "Need workers for harvesting on Land B.",
                    "area": 0.3,
                    "location": "Governorate B, Town B, Secondary Street",
                    "type": "Worker Request",
                  },
                ],
              ), // صفحة الإعلانات
            ),
          );
        },
      },
      {
        "title": "Settings",
        "icon": Icons.settings,
        "color": const Color(0xFF81C784),
      },
    ];

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: dashboardItems.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemBuilder: (context, index) {
          final item = dashboardItems[index];
          return _buildDashboardCard(
            item["title"],
            item["icon"],
            item["color"],
            item["onTap"] ?? () {},
          );
        },
      ),
    );
  }

  Widget _buildDashboardCard(
      String title, IconData icon, Color color, VoidCallback onTap) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      elevation: 5,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            color: color.withOpacity(0.2),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 40, color: color),
              const SizedBox(height: 10),
              Text(
                title,
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAdvertisementsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(16.0),
          child: Text(
            "Advertisements",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF556B2F),
            ),
          ),
        ),
        SizedBox(
          height: 150,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 3,
            itemBuilder: (context, index) {
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Container(
                  width: 150,
                  padding: const EdgeInsets.all(10),
                  child: const Center(child: Text("Ad")),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
