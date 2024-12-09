import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'LandownerHomePage.dart'; // صفحة المالك
import 'signin.dart'; // صفحة تسجيل الدخول

class SignUpForm extends StatefulWidget {
  const SignUpForm({super.key, required String baseUrl});

  @override
  _SignUpFormState createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  String confirmpassword = '';
  String ownerName = '';
  String contactNumber = '';
  bool _isPasswordVisible = false;
  File? _profileImage;

  final ImagePicker _picker = ImagePicker();

  // وظيفة اختيار الصورة الشخصية
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _profileImage = File(pickedFile.path);
      });
    }
  }

  // وظيفة التسجيل
  Future<void> _signUp() async {
    if (_formKey.currentState!.validate()) {
      try {
        // رابط API
        final url = Uri.parse(
            'https://growtogetherjkdfvujdfvb.onrender.com/auth/signupowner');

        // إعداد البيانات لإرسالها
        final Map<String, String> requestBody = {
          'email': email,
          'password': password,
          'confirmpassword': confirmpassword,
          'ownerName': ownerName,
          'contactNumber': contactNumber,
        };

        print('Request Body: ${jsonEncode(requestBody)}');

        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(requestBody),
        );

        print('Response: ${response.body}');

        if (response.statusCode == 200) {
          final responseData = jsonDecode(response.body);

          if (responseData['message']?.toLowerCase() ==
              'owner added successfully'.toLowerCase()) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                  content: Text('Signup successful! Redirecting...')),
            );

            // تأخير صغير للسماح بعرض رسالة النجاح
            await Future.delayed(const Duration(seconds: 1));

            print('Navigating to LandownerHomePage');
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const LandownerHomePage()),
            );
          } else {
            _showErrorDialog(responseData['message']);
          }
        } else {
          final responseData = jsonDecode(response.body);
          print('Signup failed: $responseData');
          _showErrorDialog(responseData['message'] ?? 'Signup failed.');
        }
      } catch (error) {
        print('Error during sign up: $error');
        _showErrorDialog('An error occurred. Please try again.');
      }
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF556B2F)),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 10),
              const Align(
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Welcome",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF556B2F),
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(
                      Icons.agriculture,
                      color: Color(0xFF556B2F),
                      size: 30,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.grey.shade300,
                      backgroundImage: _profileImage != null
                          ? FileImage(_profileImage!)
                          : const AssetImage(
                                  'profilephoto/default-profile-photo.jpg')
                              as ImageProvider,
                    ),
                    Positioned(
                      bottom: 5,
                      right: 5,
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: const CircleAvatar(
                          radius: 15,
                          backgroundColor: Colors.white,
                          child: Icon(
                            Icons.edit,
                            color: Color(0xFF556B2F),
                            size: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              _buildTextField('Owner Name', (value) => ownerName = value),
              _buildTextField('Email', (value) => email = value),
              _buildPasswordField('Password', (value) => password = value),
              _buildPasswordField('Confirm Password', (value) {
                confirmpassword = value;
                if (value != password) {
                  return 'Passwords do not match';
                }
                return null;
              }),
              _buildTextField(
                  'Contact Number', (value) => contactNumber = value,
                  keyboardType: TextInputType.phone),
              const SizedBox(height: 15),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF556B2F),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: _signUp,
                child: const Text(
                  'Sign Up',
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
              const SizedBox(height: 15),
              _buildSignInOption(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, Function(String) onChanged,
      {TextInputType keyboardType = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: TextFormField(
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Color(0xFF556B2F), fontSize: 14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
          filled: true,
          fillColor: const Color(0xFF556B2F).withOpacity(0.1),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter $label';
          }
          if (label == 'Contact Number' &&
              (value.length < 10 || !RegExp(r'^\d+$').hasMatch(value))) {
            return 'Please enter a valid contact number';
          }
          return null;
        },
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildPasswordField(String label, Function(String) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: TextFormField(
        obscureText: !_isPasswordVisible,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Color(0xFF556B2F), fontSize: 14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
          filled: true,
          fillColor: const Color(0xFF556B2F).withOpacity(0.1),
          suffixIcon: IconButton(
            icon: Icon(
              _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
              color: const Color(0xFF556B2F),
              size: 20,
            ),
            onPressed: () {
              setState(() {
                _isPasswordVisible = !_isPasswordVisible;
              });
            },
          ),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter $label';
          }
          return null;
        },
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildSignInOption(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          "Already have an account? ",
          style: TextStyle(color: Colors.black54, fontSize: 14),
        ),
        GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const LoginPage()),
            );
          },
          child: const Text(
            "Sign in",
            style: TextStyle(
              color: Color(0xFF556B2F),
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}
