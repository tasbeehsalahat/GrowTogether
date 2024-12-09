import 'package:flutter/material.dart';
import 'signupworker.dart';
import 'signupowner.dart';

class ProjectInfoPage extends StatefulWidget {
  final String baseUrl;

  const ProjectInfoPage({super.key, required this.baseUrl}); // استلام baseUrl

  @override
  _ProjectInfoPageState createState() => _ProjectInfoPageState();
}

class _ProjectInfoPageState extends State<ProjectInfoPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;

  bool _isHoveringOwner = false;
  bool _isHoveringWorker = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: const Offset(0, 0),
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('image/dis.png'), // تأكد من وجود الصورة
                fit: BoxFit.cover,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Column(
              children: [
                const Spacer(),
                _buildAnimatedText(
                  text: "Welcome to 'Grow Together' Project",
                  delay: 0,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF556B2F),
                ),
                const SizedBox(height: 15),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7A886A),
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 8,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: _buildAnimatedText(
                      text:
                          "Grow Together aims to optimize agricultural land use by connecting landowners with skilled laborers.",
                      delay: 300,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 50),
                SlideTransition(
                  position: _slideAnimation,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 10,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        const Text(
                          "Sign Up Now AS:",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF556B2F),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildSignupOption(
                              icon: Icons.agriculture,
                              label: "Land Owner",
                              description:
                                  "Register your land and find skilled laborers for agricultural work.",
                              onHover: (hovering) {
                                setState(() {
                                  _isHoveringOwner = hovering;
                                });
                              },
                              isHovering: _isHoveringOwner,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => SignUpForm(
                                      baseUrl: widget.baseUrl,
                                    ), // تمرير baseUrl إلى صفحة تسجيل المالك
                                  ),
                                );
                              },
                            ),
                            _buildSignupOption(
                              icon: Icons.person,
                              label: "Worker",
                              description:
                                  "Register as a worker to offer your skills in agriculture.",
                              onHover: (hovering) {
                                setState(() {
                                  _isHoveringWorker = hovering;
                                });
                              },
                              isHovering: _isHoveringWorker,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => SignUpWorker(
                                      baseUrl: widget.baseUrl,
                                    ), // تمرير baseUrl إلى صفحة تسجيل العامل
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedText({
    required String text,
    required int delay,
    double? fontSize,
    FontWeight? fontWeight,
    Color? color,
  }) {
    return AnimatedOpacity(
      opacity: 1.0,
      duration: const Duration(milliseconds: 1000),
      curve: Curves.easeIn,
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color ?? Colors.black,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildSignupOption({
    required IconData icon,
    required String label,
    required String description,
    required VoidCallback onTap,
    required Function(bool) onHover,
    required bool isHovering,
  }) {
    return Flexible(
      child: MouseRegion(
        onEnter: (_) => onHover(true),
        onExit: (_) => onHover(false),
        child: GestureDetector(
          onTap: onTap,
          child: Column(
            children: [
              const SizedBox(height: 10),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                decoration: BoxDecoration(
                  color: isHovering
                      ? const Color(0xFF556B2F).withOpacity(0.2)
                      : const Color(0xFF556B2F).withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF556B2F), width: 2),
                ),
                padding: const EdgeInsets.all(30),
                child: Icon(icon, size: 40, color: const Color(0xFF556B2F)),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF556B2F),
                ),
              ),
              if (isHovering)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10.0),
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 300),
                    opacity: isHovering ? 1.0 : 0.0,
                    child: Text(
                      description,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.black54,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
