import 'package:flutter/material.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  _ResetPasswordPageState createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  int _currentStep =
      0; // 0 = إدخال البريد، 1 = إدخال الكود، 2 = إعادة تعيين كلمة المرور
  bool _obscurePassword = true;

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // التحقق من البريد الإلكتروني وإرسال الكود
  void _sendResetCode() {
    final email = _emailController.text;

    if (email.isEmpty || !email.contains('@')) {
      _showToast('Please enter a valid email address');
      return;
    }

    // قم بإضافة منطق إرسال الكود هنا
    _showToast('A reset code has been sent to your email.');

    setState(() {
      _currentStep = 1; // الانتقال إلى خطوة إدخال الكود
    });
  }

  // التحقق من الكود
  void _verifyCode() {
    final code = _codeController.text;

    if (code.isEmpty) {
      _showToast('Please enter the code sent to your email');
      return;
    }

    // قم بإضافة منطق التحقق من الكود هنا
    _showToast('Code verified successfully.');

    setState(() {
      _currentStep = 2; // الانتقال إلى خطوة إعادة تعيين كلمة المرور
    });
  }

  // إعادة تعيين كلمة المرور
  void _resetPassword() {
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (password.isEmpty || confirmPassword.isEmpty) {
      _showToast('Please fill all fields');
      return;
    }

    if (password != confirmPassword) {
      _showToast('Passwords do not match');
      return;
    }

    // قم بإضافة منطق تحديث كلمة المرور هنا
    _showToast('Password reset successfully.');

    // العودة إلى صفحة تسجيل الدخول أو الصفحة الرئيسية
    Navigator.pop(context);
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
              child: Card(
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
                      Text(
                        _currentStep == 0
                            ? 'Reset Password'
                            : _currentStep == 1
                                ? 'Enter Code'
                                : 'New Password',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF556B2F),
                        ),
                      ),
                      const SizedBox(height: 15),
                      _currentStep == 0
                          ? _buildEmailStep()
                          : _currentStep == 1
                              ? _buildCodeStep()
                              : _buildPasswordStep(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // الخطوة 1: إدخال البريد الإلكتروني
  Widget _buildEmailStep() {
    return Column(
      children: [
        TextField(
          controller: _emailController,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.email, color: Color(0xFF556B2F)),
            hintText: 'Enter your email',
            hintStyle: const TextStyle(color: Color(0xFF556B2F)),
            filled: true,
            fillColor: const Color(0xFF556B2F).withOpacity(0.1),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF556B2F),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
            ),
            onPressed: _sendResetCode,
            child:
                const Text('Send Code', style: TextStyle(color: Colors.white))),
      ],
    );
  }

  // الخطوة 2: إدخال الكود
  Widget _buildCodeStep() {
    return Column(
      children: [
        TextField(
          controller: _codeController,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.code, color: Color(0xFF556B2F)),
            hintText: 'Enter reset code',
            hintStyle: const TextStyle(color: Color(0xFF556B2F)),
            filled: true,
            fillColor: const Color(0xFF556B2F).withOpacity(0.1),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF556B2F),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
          ),
          onPressed: _verifyCode,
          child: const Text(
            'Verify Code',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ],
    );
  }

  // الخطوة 3: إعادة تعيين كلمة المرور
  Widget _buildPasswordStep() {
    return Column(
      children: [
        TextField(
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
            hintText: 'Enter new password',
            hintStyle: const TextStyle(color: Color(0xFF556B2F)),
            filled: true,
            fillColor: const Color(0xFF556B2F).withOpacity(0.1),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        const SizedBox(height: 15),
        TextField(
          controller: _confirmPasswordController,
          obscureText: true,
          decoration: InputDecoration(
            prefixIcon: const Icon(Icons.lock, color: Color(0xFF556B2F)),
            hintText: 'Confirm new password',
            hintStyle: const TextStyle(color: Color(0xFF556B2F)),
            filled: true,
            fillColor: const Color(0xFF556B2F).withOpacity(0.1),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF556B2F),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
          ),
          onPressed: _resetPassword,
          child: const Text(
            'Reset Password',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ],
    );
  }
}
