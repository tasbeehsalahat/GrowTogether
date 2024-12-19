import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'calculatearea.dart';
import 'package:latlong2/latlong.dart';

class AddLandPage extends StatefulWidget {
  final Function(Map<String, dynamic>) onLandAdded;

  const AddLandPage({super.key, required this.onLandAdded});

  @override
  _AddLandPageState createState() => _AddLandPageState();
}

class _AddLandPageState extends State<AddLandPage> {
  final TextEditingController _areaController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _governorateController = TextEditingController();
  final TextEditingController _townController = TextEditingController();
  final TextEditingController _streetController = TextEditingController();
  final TextEditingController _specificAreaController = TextEditingController();
  final TextEditingController _workTypeController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  LatLng? selectedLocation;
  XFile? _selectedImage;
  final ImagePicker _picker = ImagePicker();
  bool useMapForLocation = true;

  Future<void> _navigateToCalculateArea() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LandAreaCalculator(
          onLandAdded: (newArea, location) {},
        ),
      ),
    );

    if (result != null && result is Map) {
      setState(() {
        _areaController.text = result["area"]?.toStringAsFixed(2) ?? "0.0";
        selectedLocation = result["centroid"];
        if (selectedLocation != null) {
          _locationController.text =
              "${selectedLocation?.latitude.toStringAsFixed(5)}, ${selectedLocation?.longitude.toStringAsFixed(5)}";
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

  Widget _buildImagePicker() {
    return GestureDetector(
      onTap: _selectImage,
      child: Container(
        height: 150,
        width: double.infinity,
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFF556B2F), width: 2),
          borderRadius: BorderRadius.circular(12.0),
        ),
        child: _selectedImage == null
            ? const Center(child: Text("Tap to select image"))
            : Image.file(
                File(_selectedImage!.path),
                fit: BoxFit.cover,
              ),
      ),
    );
  }

  Future<void> _selectImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

      if (pickedFile != null) {
        setState(() {
          _selectedImage = XFile(pickedFile.path);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("No image selected.")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to pick image: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Add New Land",
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
                    activeTrackColor: const Color(0xFF8FBC8F),
                    activeColor: const Color(0xFF556B2F),
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
              ),
              if (useMapForLocation)
                _buildCustomTextField(
                  labelText: "Location (Latitude, Longitude)",
                  icon: Icons.location_pin,
                  controller: _locationController,
                  readOnly: true,
                )
              else ...[
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
                labelText: "Specific Area (km²)",
                icon: Icons.landscape,
                controller: _specificAreaController,
                keyboardType: TextInputType.number,
              ),
              _buildCustomTextField(
                labelText: "Type of Work",
                icon: Icons.work,
                controller: _workTypeController,
              ),
              _buildCustomTextField(
                labelText: "Description",
                icon: Icons.description,
                controller: _descriptionController,
              ),
              _buildImagePicker(),
              const SizedBox(height: 16),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: const Color(0xFF556B2F),
                ),
                onPressed: () {
                  if (_areaController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Please calculate area.")),
                    );
                    return;
                  }
                  if (!useMapForLocation &&
                      (_governorateController.text.isEmpty ||
                          _townController.text.isEmpty ||
                          _streetController.text.isEmpty)) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text(
                              "Please fill in Governorate, Town/Village, and Street Name.")),
                    );
                    return;
                  }
                  final landData = {
                    "area": _areaController.text,
                    "location": useMapForLocation && selectedLocation != null
                        ? {
                            "latitude": selectedLocation!.latitude,
                            "longitude": selectedLocation!.longitude,
                          }
                        : {
                            "governorate": _governorateController.text.trim(),
                            "townOrVillage": _townController.text.trim(),
                            "streetName": _streetController.text.trim(),
                          },
                    "specificArea": _specificAreaController.text,
                    "workType": _workTypeController.text,
                    "description": _descriptionController.text,
                    "image": _selectedImage?.path,
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
