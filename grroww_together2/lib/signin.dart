import 'package:flutter/material.dart';
import 'discription.dart'; // Import your ProjectInfoPage here
import 'LandownerHomePage.dart'; // صفحة Landowner
import 'resetpassword.dart'; // صفحة إعادة تعيين كلمة المرور
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true; // حالة إظهار/إخفاء كلمة المرور

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // عرض رسالة للمستخدم باستخدام GlobalKey
  void _showToast(String message) {
    scaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // التحقق من الحقول
  bool _validateFields() {
    String email = _emailController.text;
    String password = _passwordController.text;

    if (email.isEmpty || !email.contains('@') || password.isEmpty) {
      _showToast("Invalid email or password");
      return false;
    }
    return true;
  }

  // إرسال طلب تسجيل الدخول
  Future<void> _login() async {
    if (_validateFields()) {
      final url =
          Uri.parse('https://growtogetherjkdfvujdfvb.onrender.com/auth/login');
      final requestBody = {
        'email': _emailController.text,
        'password': _passwordController.text,
      };

      try {
        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(requestBody),
        );

        if (!mounted) return; // تحقق إذا كانت الشاشة ما زالت موجودة

        final responseData = jsonDecode(response.body);

        if (response.statusCode == 200) {
          _showToast("Login successful!");

          // استخراج التوكن
          final token = responseData['token'];
          final role = responseData['role']?.trim();
          print(token);

          if (token != null) {
            // حفظ التوكن باستخدام shared_preferences
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('token', token);

            // تحديد التنقل بناءً على الدور
            if (role == 'Owner') {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) => const LandownerHomePage(),
                ),
              );
            } else {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      const ProjectInfoPage(baseUrl: ''), // صفحة أخرى
                ),
              );
            }
          } else {
            _showToast("Token not found.");
          }
        } else {
          _showToast(responseData['message'] ?? "Login failed.");
        }
      } catch (error) {
        if (mounted) {
          _showToast("An error occurred. Please try again.");
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('image/dis.png'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    'Welcome Back!',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF556B2F),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Together, we grow agriculture!',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.black54,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  Card(
                    color: Colors.white,
                    elevation: 10,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(15.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text(
                            'Sign In',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF556B2F),
                            ),
                          ),
                          const SizedBox(height: 15),
                          _buildTextField(
                              'Email', Icons.email, false, _emailController),
                          const SizedBox(height: 15),
                          _buildPasswordField(),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF556B2F),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 50, vertical: 15),
                            ),
                            onPressed: _login,
                            child: const Text(
                              'Login',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(height: 15),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const ResetPasswordPage(), // انتقال إلى صفحة Reset Password
                                ),
                              );
                            },
                            child: const Text(
                              "Reset Password",
                              style: TextStyle(
                                color: Color(0xFF556B2F),
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                          const SizedBox(height: 15),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                "Don't have an account? ",
                                style: TextStyle(color: Colors.black54),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          const ProjectInfoPage(baseUrl: ''),
                                    ),
                                  );
                                },
                                child: const Text(
                                  "Sign Up",
                                  style: TextStyle(
                                    color: Color(0xFF556B2F),
                                    fontWeight: FontWeight.bold,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordField() {
    return TextField(
      controller: _passwordController,
      obscureText: _obscurePassword,
      decoration: InputDecoration(
        prefixIcon: const Icon(Icons.lock, color: Color(0xFF556B2F)),
        suffixIcon: IconButton(
          icon: Icon(
            _obscurePassword ? Icons.visibility_off : Icons.visibility,
            color: const Color(0xFF556B2F),
          ),
          onPressed: () {
            setState(() {
              _obscurePassword = !_obscurePassword;
            });
          },
        ),
        hintText: 'Password',
        hintStyle: const TextStyle(color: Color(0xFF556B2F)),
        filled: true,
        fillColor: const Color(0xFF556B2F).withOpacity(0.1),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }

  Widget _buildTextField(String hint, IconData icon, bool obscureText,
      TextEditingController controller) {
    return TextField(
      controller: controller,
      obscureText: obscureText && _obscurePassword,
      keyboardType:
          hint == 'Email' ? TextInputType.emailAddress : TextInputType.text,
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: const Color(0xFF556B2F)),
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF556B2F)),
        filled: true,
        fillColor: const Color(0xFF556B2F).withOpacity(0.1),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}

void main() {
  runApp(MaterialApp(
    scaffoldMessengerKey: scaffoldMessengerKey,
    home: const LoginPage(),
  ));
}
