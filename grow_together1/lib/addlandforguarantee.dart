import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'calculatearea.dart'; // ملف حساب المساحة
import 'package:latlong2/latlong.dart'; // مكتبة الموقع الجغرافي

class AddLandForGuarantee extends StatefulWidget {
  final Function(Map<String, dynamic>) onLandAdded;

  const AddLandForGuarantee({super.key, required this.onLandAdded});

  @override
  _AddLandForGuaranteeState createState() => _AddLandForGuaranteeState();
}

class _AddLandForGuaranteeState extends State<AddLandForGuarantee> {
  final TextEditingController _areaController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _governorateController = TextEditingController();
  final TextEditingController _townController = TextEditingController();
  final TextEditingController _streetController = TextEditingController();
  final TextEditingController _workTypeController = TextEditingController();
  final TextEditingController _guaranteeController = TextEditingController();
  final TextEditingController _guaranteeDurationController =
      TextEditingController(); // مدة الضمان
  final TextEditingController _descriptionController = TextEditingController();

  XFile? _selectedImage;
  final ImagePicker _picker = ImagePicker();
  LatLng? selectedLocation; // الموقع المحدد للأرض
  bool useMapForLocation = true; // الافتراضي: استخدام الخريطة لحساب الموقع
  bool showGuaranteeField = false;

  // لتحديد صورة
  Future<void> _selectImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) {
        setState(() {
          _selectedImage = XFile(pickedFile.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to pick image: $e")),
      );
    }
  }

  // تحديث حقل الضمان بناءً على نوع العمل المدخل
  void _onWorkTypeChanged(String value) {
    setState(() {
      showGuaranteeField = value.trim() == "زراعة" ||
          value.trim() == "حصاد" ||
          value.trim() == "تلقيط";
    });
  }

  // دالة للانتقال إلى صفحة حساب المساحة
  Future<void> _navigateToCalculateArea() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LandAreaCalculator(
          onLandAdded: (newArea, location) {
            setState(() {
              _areaController.text = newArea.toStringAsFixed(2);
              if (useMapForLocation) {
                selectedLocation = location;
                _locationController.text =
                    "${selectedLocation?.latitude.toStringAsFixed(5)}, ${selectedLocation?.longitude.toStringAsFixed(5)}";
              }
            });
          },
        ),
      ),
    );

    if (result != null && result is Map) {
      setState(() {
        _areaController.text = result["area"]?.toStringAsFixed(2) ?? "0.0";
        if (useMapForLocation) {
          selectedLocation = result["centroid"];
          _locationController.text =
              "${selectedLocation?.latitude.toStringAsFixed(5)}, ${selectedLocation?.longitude.toStringAsFixed(5)}";
        }
      });
    }
  }

  // عرض حقل الضمان بناءً على نوع العمل
  Widget _buildGuaranteeField() {
    if (!showGuaranteeField) {
      return const SizedBox.shrink();
    }
    final workType = _workTypeController.text.trim();
    if (workType == "حصاد" || workType == "تلقيط") {
      return _buildCustomTextField(
        labelText: "نسبة الضمان (%)",
        icon: Icons.percent,
        controller: _guaranteeController,
        keyboardType: TextInputType.number,
        onChanged: (_) {},
      );
    } else if (workType == "زراعة") {
      return _buildCustomTextField(
        labelText: "سعر الضمان (ILS)",
        icon: Icons.attach_money,
        controller: _guaranteeController,
        keyboardType: TextInputType.number,
        onChanged: (_) {},
      );
    }
    return const SizedBox.shrink();
  }

  // حقل مخصص
  Widget _buildCustomTextField({
    required String labelText,
    required IconData icon,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
    required Function(String) onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      decoration: BoxDecoration(
        border: Border.all(
          color: const Color(0xFF556B2F),
          width: 2,
        ),
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        readOnly: readOnly,
        onChanged: (value) => onChanged(value),
        decoration: InputDecoration(
          border: InputBorder.none,
          labelText: labelText,
          labelStyle: const TextStyle(
            color: Color(0xFF556B2F),
            fontWeight: FontWeight.bold,
          ),
          prefixIcon: Icon(
            icon,
            color: const Color(0xFF556B2F),
          ),
          filled: true,
          fillColor: Colors.white,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Add Land for Guarantee",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "Use Map for Location:",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Switch(
                    value: useMapForLocation,
                    onChanged: (value) {
                      setState(() {
                        useMapForLocation = value;
                      });
                    },
                    activeTrackColor: const Color(0xFF556B2F),
                    activeColor: Colors.white,
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: _navigateToCalculateArea,
                icon: const Icon(Icons.map),
                label: const Text("Calculate Area from Map"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF556B2F),
                  foregroundColor: Colors.white,
                ),
              ),
              _buildCustomTextField(
                labelText: "Total Area (km²)",
                icon: Icons.square_foot,
                controller: _areaController,
                onChanged: (_) {},
              ),
              if (useMapForLocation)
                _buildCustomTextField(
                  labelText: "Location (Latitude, Longitude)",
                  icon: Icons.location_pin,
                  controller: _locationController,
                  readOnly: true,
                  onChanged: (_) {},
                )
              else ...[
                _buildCustomTextField(
                  labelText: "Governorate",
                  icon: Icons.location_city,
                  controller: _governorateController,
                  onChanged: (value) => {},
                ),
                _buildCustomTextField(
                  labelText: "Town/Village/Camp",
                  icon: Icons.location_on,
                  controller: _townController,
                  onChanged: (value) => {},
                ),
                _buildCustomTextField(
                  labelText: "Street Name",
                  icon: Icons.streetview,
                  controller: _streetController,
                  onChanged: (value) => {},
                ),
              ],
              _buildCustomTextField(
                labelText: "Type of Work",
                icon: Icons.work,
                controller: _workTypeController,
                onChanged: _onWorkTypeChanged,
              ),
              _buildGuaranteeField(),
              _buildCustomTextField(
                labelText: "Guarantee Duration ",
                icon: Icons.timer,
                controller: _guaranteeDurationController,
                onChanged: (_) {},
              ),
              _buildCustomTextField(
                labelText: "Description",
                icon: Icons.description,
                controller: _descriptionController,
                onChanged: (_) {},
              ),
              GestureDetector(
                onTap: _selectImage,
                child: Container(
                  height: 150,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    border:
                        Border.all(color: const Color(0xFF556B2F), width: 2),
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  child: _selectedImage == null
                      ? const Center(
                          child: Text("Tap to select image (Optional)"))
                      : Image.file(
                          File(_selectedImage!.path),
                          fit: BoxFit.cover,
                        ),
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: const Color(0xFF556B2F),
                ),
                onPressed: () {
                  if (_areaController.text.isEmpty ||
                      _workTypeController.text.trim().isEmpty ||
                      _guaranteeController.text.isEmpty ||
                      _guaranteeDurationController.text.isEmpty ||
                      (!useMapForLocation &&
                          (_governorateController.text.isEmpty ||
                              _townController.text.isEmpty ||
                              _streetController.text.isEmpty))) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text("Please fill all required fields.")),
                    );
                    return;
                  }

                  final landData = {
                    "area": _areaController.text,
                    "location": useMapForLocation
                        ? selectedLocation
                        : {
                            "governorate": _governorateController.text,
                            "town": _townController.text,
                            "street": _streetController.text,
                          },
                    "workType": _workTypeController.text.trim(),
                    "guaranteeValue": _guaranteeController.text,
                    "guaranteeDuration": _guaranteeDurationController.text,
                    "description": _descriptionController.text,
                    "image": _selectedImage?.path,
                    "type": "guarantee",
                  };

                  widget.onLandAdded(landData);
                  Navigator.pop(context);
                },
                child: const Text("Add Land"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
