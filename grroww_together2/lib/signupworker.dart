import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'signin.dart';

class SignUpWorker extends StatefulWidget {
  final String baseUrl;

  const SignUpWorker({super.key, required this.baseUrl});

  @override
  _SignUpWorkerState createState() => _SignUpWorkerState();
}

class _SignUpWorkerState extends State<SignUpWorker> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  String confirmPassword = '';
  String username = '';
  String phoneNumber = '';
  String skills = '';
  File? _profileImage;
  bool _isPasswordVisible = false;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _profileImage = File(pickedFile.path);
      });
    }
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
        padding: const EdgeInsets.all(16.0), // Adjusted padding
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Align(
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Worker Registration👷‍♂️",
                      style: TextStyle(
                        fontSize: 18, // Reduced font size
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF556B2F),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16), // Adjusted spacing
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 45, // Smaller profile image
                      backgroundColor: Colors.grey.shade300,
                      backgroundImage: _profileImage != null
                          ? FileImage(_profileImage!)
                          : const AssetImage('profilephoto/default-profile-photo.jpg')
                              as ImageProvider,
                    ),
                    Positioned(
                      bottom: 5,
                      right: 5,
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: const CircleAvatar(
                          radius: 14, // Smaller edit button
                          backgroundColor: Colors.white,
                          child: Icon(
                            Icons.edit,
                            color: Color(0xFF556B2F),
                            size: 14, // Smaller icon
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16), // Adjusted spacing
              _buildTextField('Username', (value) => username = value),
              _buildTextField('Email', (value) => email = value),
              _buildPasswordField('Password', (value) => password = value),
              _buildPasswordField('Confirm Password', (value) {
                confirmPassword = value;
                if (value != password) {
                  return 'Passwords do not match';
                }
                return null;
              }),
              _buildTextField('Phone Number', (value) => phoneNumber = value,
                  keyboardType: TextInputType.phone),
              _buildTextField('Skills', (value) => skills = value),
              const SizedBox(height: 12), // Adjusted spacing
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF556B2F),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: const EdgeInsets.symmetric(
                      vertical: 10), // Reduced button height
                ),
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    print('Sign up successful for: $username');
                    print(
                        'Profile Image Path: ${_profileImage?.path ?? "Default"}');
                  }
                },
                child: const Text(
                  'Sign Up',
                  style: TextStyle(
                      fontSize: 16, color: Colors.white), // Reduced font size
                ),
              ),
              const SizedBox(height: 12), // Adjusted spacing
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
      padding: const EdgeInsets.symmetric(vertical: 4.0), // Reduced spacing
      child: TextFormField(
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(
              color: Color(0xFF556B2F), fontSize: 12), // Reduced font size
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
          filled: true,
          fillColor: const Color(0xFF556B2F).withOpacity(0.1),
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

  Widget _buildPasswordField(String label, Function(String) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0), // Reduced spacing
      child: TextFormField(
        obscureText: !_isPasswordVisible,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(
              color: Color(0xFF556B2F), fontSize: 12), // Reduced font size
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
          filled: true,
          fillColor: const Color(0xFF556B2F).withOpacity(0.1),
          suffixIcon: IconButton(
            icon: Icon(
              _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
              color: const Color(0xFF556B2F),
              size: 18, // Reduced icon size
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
          style: TextStyle(
              color: Colors.black54, fontSize: 12), // Reduced font size
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
              fontSize: 12, // Reduced font size
            ),
          ),
        ),
      ],
    );
  }
}
