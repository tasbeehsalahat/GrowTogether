import 'package:flutter/material.dart';
import 'discription.dart'; // استدعاء صفحة ProjectInfoPage

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const WelcomePage(),
        '/info': (context) => const ProjectInfoPage(
              baseUrl:
                  'https://growtogetherjkdfvujdfvb.onrender.com', // تمرير baseUrl
            ),
      },
    );
  }
}

class WelcomePage extends StatelessWidget {
  const WelcomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // خلفية الصورة
          Image.asset(
            'image/welcome.png', // تأكد من وجود الصورة داخل assets
            fit: BoxFit.cover,
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      const Color(0xFF343920), // لون الخلفية الجديد
                  padding: const EdgeInsets.symmetric(
                    horizontal: 40,
                    vertical: 15,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                onPressed: () {
                  Navigator.pushNamed(
                      context, '/info'); // الانتقال إلى صفحة ProjectInfoPage
                },
                child: const Text(
                  'Get Started',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 235), // مسافة بين الزر وأسفل الشاشة
            ],
          ),
        ],
      ),
    );
  }
}
