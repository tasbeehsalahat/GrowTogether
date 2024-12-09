import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'calculatearea.dart'; // ملف حساب المساحة
import 'package:latlong2/latlong.dart'; // مكتبة الموقع الجغرافي

class UpdateLandPage extends StatefulWidget {
  final Map<String, dynamic> initialLandData;
  final Function(Map<String, dynamic>) onLandUpdated;

  const UpdateLandPage({
    super.key,
    required this.initialLandData,
    required this.onLandUpdated, required List<Map<String, dynamic>> lands,
  });

  @override
  _UpdateLandPageState createState() => _UpdateLandPageState();
}

class _UpdateLandPageState extends State<UpdateLandPage> {
  late TextEditingController _areaController;
  late TextEditingController _governorateController;
  late TextEditingController _townController;
  late TextEditingController _streetController;
  late TextEditingController _workTypeController;
  late TextEditingController _guaranteeController;
  late TextEditingController _guaranteeDurationController;
  late TextEditingController _descriptionController;

  XFile? _selectedImage;
  final ImagePicker _picker = ImagePicker();
  LatLng? selectedLocation;
  bool useMapForLocation = false;

  @override
  void initState() {
    super.initState();

    // تعبئة الحقول
    _areaController = TextEditingController(
      text: widget.initialLandData['area']?.toString() ?? '',
    );

    // التحقق من نوع الموقع (يدوي أو خريطة)
    if (widget.initialLandData['location'] is LatLng) {
      selectedLocation = widget.initialLandData['location'];
      useMapForLocation = true;
    } else {
      _governorateController = TextEditingController(
          text: widget.initialLandData['location']?['governorate'] ?? '');
      _townController = TextEditingController(
          text: widget.initialLandData['location']?['town'] ?? '');
      _streetController = TextEditingController(
          text: widget.initialLandData['location']?['street'] ?? '');
      useMapForLocation = false;
    }

    _workTypeController =
        TextEditingController(text: widget.initialLandData['workType'] ?? '');
    _guaranteeController = TextEditingController(
        text: widget.initialLandData['guaranteeValue'] ?? '');
    _guaranteeDurationController = TextEditingController(
        text: widget.initialLandData['guaranteeDuration'] ?? '');
    _descriptionController = TextEditingController(
        text: widget.initialLandData['description'] ?? '');

    if (widget.initialLandData['image'] != null) {
      _selectedImage = XFile(widget.initialLandData['image']);
    }
  }

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
        }
      });
    }
  }

  Widget _buildCustomTextField({
    required String labelText,
    required IconData icon,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
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
          "Update Land",
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
                onPressed: useMapForLocation ? _navigateToCalculateArea : null,
                icon: const Icon(Icons.map),
                label: const Text("Calculate Area from Map"),
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      useMapForLocation ? const Color(0xFF556B2F) : Colors.grey,
                  foregroundColor: Colors.white,
                ),
              ),
              _buildCustomTextField(
                labelText: "Total Area (km²)",
                icon: Icons.square_foot,
                controller: _areaController,
              ),
              if (useMapForLocation && selectedLocation != null)
                Text(
                  "Selected Location: (${selectedLocation!.latitude.toStringAsFixed(5)}, ${selectedLocation!.longitude.toStringAsFixed(5)})",
                  style: const TextStyle(fontSize: 16, color: Colors.black54),
                )
              else if (!useMapForLocation) ...[
                _buildCustomTextField(
                  labelText: "Governorate",
                  icon: Icons.location_city,
                  controller: _governorateController,
                ),
                _buildCustomTextField(
                  labelText: "Town/Village/Camp",
                  icon: Icons.location_on,
                  controller: _townController,
                ),
                _buildCustomTextField(
                  labelText: "Street Name",
                  icon: Icons.streetview,
                  controller: _streetController,
                ),
              ],
              _buildCustomTextField(
                labelText: "Type of Work",
                icon: Icons.work,
                controller: _workTypeController,
              ),
              _buildCustomTextField(
                labelText: "Guarantee Value",
                icon: Icons.attach_money,
                controller: _guaranteeController,
                keyboardType: TextInputType.number,
              ),
              _buildCustomTextField(
                labelText: "Guarantee Duration",
                icon: Icons.timer,
                controller: _guaranteeDurationController,
                keyboardType: TextInputType.number,
              ),
              _buildCustomTextField(
                labelText: "Description",
                icon: Icons.description,
                controller: _descriptionController,
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
                  final updatedLand = {
                    "area": _areaController.text,
                    "location": useMapForLocation && selectedLocation != null
                        ? LatLng(
                            selectedLocation!.latitude,
                            selectedLocation!.longitude,
                          )
                        : {
                            "governorate": _governorateController.text,
                            "town": _townController.text,
                            "street": _streetController.text,
                          },
                    "workType": _workTypeController.text,
                    "guaranteeValue": _guaranteeController.text,
                    "guaranteeDuration": _guaranteeDurationController.text,
                    "description": _descriptionController.text,
                    "image": _selectedImage?.path,
                  };
                  widget.onLandUpdated(updatedLand);
                  Navigator.pop(context);
                },
                child: const Text("Save Changes"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
